import React, { useEffect, useRef, useMemo } from 'react'
import { Cue } from '../../constants'
import { getCameraColor, formatDuration } from '../../constants'
import styles from '../../assets/styles/editor.module.css' // Import CSS Module

interface EditViewProps {
  cues: Cue[]
  currentTime: number
  selectedCueId: string | null
  setSelectedCueId: (id: string | null) => void
  updateCue: (cue: Cue) => void
  deleteCue: (id: string) => void
  addCue: () => void
  onCameraPaletteOpen: () => void
  videoRef: React.RefObject<HTMLVideoElement>
}

const EditView: React.FC<EditViewProps> = ({
  cues,
  currentTime,
  selectedCueId,
  setSelectedCueId,
  updateCue,
  deleteCue,
  addCue,
  onCameraPaletteOpen,
  videoRef
}) => {
  const barRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const cuesMap = useRef<Map<string, Cue>>(new Map())

  // Relaxed filter: Keep cues that ended recently (e.g., last 1.5s) in the DOM.
  const visibleCues = useMemo(() => {
    return cues.filter((c) => c.endTime > currentTime - 1.5)
  }, [cues, currentTime])

  // Sync cuesMap for O(1) access in RAF loop
  useEffect(() => {
    cuesMap.current.clear()
    visibleCues.forEach((c) => cuesMap.current.set(c.id, c))
  }, [visibleCues])

  // Waterfall constants
  const PX_PER_SECOND = 150

  // Animation Loop for smooth waterfall movement and instant deletion
  useEffect(() => {
    let frameId: number

    const loop = () => {
      const t = videoRef.current ? videoRef.current.currentTime : currentTime
      let foundCurrent = false

      rowRefs.current.forEach((row, id) => {
        const cue = cuesMap.current.get(id)
        if (!cue) return

        // 1. Frame-Accurate Visibility & Styling
        if (cue.endTime <= t) {
          // Immediately hide cues that have passed without waiting for React rerender
          row.style.display = 'none'
          row.classList.remove(styles['active-cue']) // Use style module class
        } else {
          // Show future/current cues
          row.style.display = 'flex'

          // The first visible cue is considered the "active" one for highlighting
          if (!foundCurrent) {
            row.classList.add(styles['active-cue']) // Use style module class
            foundCurrent = true
          } else {
            row.classList.remove(styles['active-cue']) // Use style module class
          }
        }

        // 2. Waterfall Bar Position
        const bar = barRefs.current.get(id)
        if (bar) {
          const diff = cue.startTime - t
          const x = diff * PX_PER_SECOND
          bar.style.transform = `translate3d(${x}px, 0, 0)`
        }
      })

      frameId = requestAnimationFrame(loop)
    }

    loop()
    return () => cancelAnimationFrame(frameId)
  }, [videoRef, currentTime])

  const selectedCue = cues.find((c) => c.id === selectedCueId)

  return (
    <div className={styles['waterfall-container']}>
      {/* Scrollable List */}
      <div className={styles['cue-list-scroll-area']}>
        {visibleCues.map((cue) => {
          const absoluteIndex = cues.findIndex((c) => c.id === cue.id)
          const isSelected = selectedCueId === cue.id
          const duration = cue.endTime - cue.startTime
          const width = Math.max(2, duration * PX_PER_SECOND)
          const initialOffset = (cue.startTime - currentTime) * PX_PER_SECOND

          return (
            <div
              key={cue.id}
              ref={(el) => {
                if (el) rowRefs.current.set(cue.id, el)
                else rowRefs.current.delete(cue.id)
              }}
              // Combined base classes and conditional selected class
              className={`${styles['cue-row-base']} ${isSelected ? styles['cue-row-selected'] : ''}`}
              onClick={() => setSelectedCueId(cue.id)}
            >
              {/* Index */}
              <div className={styles['cue-index']}>{absoluteIndex + 1}</div>

              {/* Camera Badge */}
              <div className={styles['camera-badge-wrapper']}>
                <div
                  className={`${styles['camera-badge']} ${getCameraColor(cue.camera)} ${cue.color === 'white' ? styles['camera-badge-white-text'] : styles['camera-badge-black-text']}`}
                >
                  {cue.camera}
                </div>
              </div>

              {/* Duration */}
              <div className={styles['cue-duration']}>{formatDuration(duration)}</div>

              {/* Description */}
              <div className={styles['cue-description']}>{cue.description || 'New Cue'}</div>

              {/* Waterfall Visualization */}
              <div className={styles['waterfall-viz']}>
                {/* The Cue Bar (Moving via RAF) */}
                <div
                  ref={(el) => {
                    if (el) barRefs.current.set(cue.id, el)
                    else barRefs.current.delete(cue.id)
                  }}
                  className={`${styles['cue-bar']} ${styles[getCameraColor(cue.camera)]}`}
                  style={{
                    width: `${width}px`,
                    transform: `translate3d(${initialOffset}px, 0, 0)`,
                    willChange: 'transform'
                  }}
                >
                  <div className={styles['cue-bar-text']}>{cue.camera}</div>
                </div>
              </div>
            </div>
          )
        })}
        {/* Spacer to ensure last items can be scrolled */}
        <div className={styles['scroll-spacer']}></div>
      </div>

      {/* Editor Footer */}
      <div className={styles['editor-footer']}>
        <div className={styles['footer-actions']}>
          <button onClick={addCue} className={styles['add-cue-button']}>
            Add Cue at Playhead
          </button>
          {selectedCue && (
            <button
              onClick={() => deleteCue(selectedCue.id)}
              className={styles['delete-cue-button']}
            >
              <p>trash</p>
            </button>
          )}
        </div>
        {selectedCue ? (
          <div className={styles['settings-grid']}>
            <div className={styles['settings-group']}>
              <label className={styles['settings-label']}>Description</label>
              <input
                type="text"
                value={selectedCue.description}
                onChange={(e) => updateCue({ ...selectedCue, description: e.target.value })}
                className={styles['settings-input']}
              />
            </div>
            <div className={styles['settings-group']}>
              <label className={styles['settings-label']}>Settings</label>
              <div className={styles['settings-fields']}>
                <button onClick={onCameraPaletteOpen} className={styles['camera-settings-button']}>
                  Camera {selectedCue.camera}
                </button>
                <select
                  value={selectedCue.color}
                  onChange={(e) =>
                    updateCue({ ...selectedCue, color: e.target.value as 'black' | 'white' })
                  }
                  className={styles['color-select']}
                >
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles['select-cue-message']}>Select a cue to edit details</div>
        )}
      </div>
    </div>
  )
}

export default EditView
