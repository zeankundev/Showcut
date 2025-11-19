import React, { useRef, MouseEvent, useMemo, useState, useEffect } from 'react'
import { Cue } from '@renderer/constants'
import { getCameraColor } from '@renderer/constants'
import PlayIcon from '@renderer/assets/img/play.svg'
import PauseIcon from '@renderer/assets/img/pause.svg'
import styles from '../../assets/styles/editor.module.css'
import SaveIcon from '@renderer/assets/img/save.svg'

interface CueTimelineProps {
  cues: Cue[]
  duration: number
  currentTime: number
  onScrub: (time: number) => void
  isPlaying: boolean
  onPlayPause: () => void
  onSave: () => void
  setSelectedCueId: (id: string | null) => void
  videoRef: React.RefObject<HTMLVideoElement>
}
// Function for the full display format: 00:MM:SS.mmm
const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00:00:00.000'
  const minutes = parseMinutes(timeInSeconds)
  const seconds = parseSeconds(timeInSeconds)
  const milliseconds = parseMilliseconds(timeInSeconds)
  return `00:${minutes}:${seconds}.${milliseconds}`
}

// NOTE: Ensure parseMinutes, parseSeconds, and parseMilliseconds are available here.

const formatTimeMarker = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
    .toString()
    .padStart(2, '0')
  return `${minutes}:${seconds}`
}
// Parse minutes component
const parseMinutes = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00'
  return Math.floor(timeInSeconds / 60)
    .toString()
    .padStart(2, '0')
}

// Parse seconds component
const parseSeconds = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '00'
  return Math.floor(timeInSeconds % 60)
    .toString()
    .padStart(2, '0')
}

// Parse milliseconds component
const parseMilliseconds = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds)) return '000'
  return Math.floor((timeInSeconds % 1) * 1000)
    .toString()
    .padStart(3, '0')
}

// Original function using the separated parsers
const formatMinutes = (timeInSeconds: number): string => {
  const minutes = parseMinutes(timeInSeconds)
  const seconds = parseSeconds(timeInSeconds)
  const milliseconds = parseMilliseconds(timeInSeconds)
  return `${minutes}:${seconds}:${milliseconds}`
}

const CueTimeline: React.FC<CueTimelineProps> = ({
  cues,
  duration,
  currentTime,
  onScrub,
  isPlaying,
  onPlayPause,
  onSave,
  setSelectedCueId,
  videoRef
}) => {
  const [zoom, setZoom] = useState(1) // 1x to 20x
  // Add this inside the CueTimeline component body
  const timeDisplayRef = useRef<HTMLSpanElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)

  // Playhead Animation Loop
  useEffect(() => {
    let animationFrameId: number

    const updatePlayhead = () => {
      if (duration > 0 && playheadRef.current) {
        // Prefer the actual video time for 60fps smoothness, fallback to prop
        const time = videoRef.current ? videoRef.current.currentTime : currentTime
        const pct = (time / duration) * 100
        playheadRef.current.style.left = `${pct}%`
      }
      animationFrameId = requestAnimationFrame(updatePlayhead)
    }

    updatePlayhead()
    return () => cancelAnimationFrame(animationFrameId)
  }, [duration, videoRef, currentTime])

  useEffect(() => {
    let animationFrameId: number

    const updateTime = () => {
      // 1. Directly update DOM for performance.
      // 2. Pull time from videoRef.current for 60fps accuracy.
      if (videoRef.current && timeDisplayRef.current) {
        timeDisplayRef.current.textContent = formatTime(videoRef.current.currentTime)
      }
      animationFrameId = requestAnimationFrame(updateTime)
    }

    updateTime()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [videoRef]) // Only depends on videoRef, ensuring it only runs when the component mounts/videoRef changes.

  // --- Fallback/Initial Sync (Optional but Recommended) ---
  // Ensure it updates when paused or scrubbing via props if the loop isn't running or video is null.
  useEffect(() => {
    if (timeDisplayRef.current && (!videoRef.current || videoRef.current.paused)) {
      timeDisplayRef.current.textContent = formatTime(currentTime)
    }
  }, [currentTime, videoRef])

  const calculateSnappedTime = (clientX: number, contentEl: HTMLDivElement) => {
    const rect = contentEl.getBoundingClientRect()
    const scrollLeft = contentEl.scrollLeft
    const scrollWidth = contentEl.scrollWidth // This is the total zoomed wid
    // 1. Find click position relative to the visible part of the container
    const x = clientX - rect.left
    // 2. Account for scroll position to get click position on total zoomed content
    const pixelOffset = x + scrollLeft
    // 3. Calculate time based on total zoomed width (scrollWidth)
    const rawTime = (pixelOffset / scrollWidth) * duration
    const clampedTime = Math.max(0, Math.min(rawTime, duration))

    // Snapping logic: 15px visual threshold
    const snapThresholdPx = 15
    const snapThresholdSec = (snapThresholdPx / rect.width) * duration

    let bestTime = clampedTime
    let minDistance = snapThresholdSec

    // Check distance to all cue start/end times
    cues.forEach((cue) => {
      const distStart = Math.abs(cue.startTime - clampedTime)
      if (distStart < minDistance) {
        minDistance = distStart
        bestTime = cue.startTime
      }

      const distEnd = Math.abs(cue.endTime - clampedTime)
      if (distEnd < minDistance) {
        minDistance = distEnd
        bestTime = cue.endTime
      }
    })

    return bestTime
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!contentRef.current || duration === 0) return
    const time = calculateSnappedTime(e.clientX, contentRef.current)
    onScrub(time)

    const onMouseMove = (moveEvent: globalThis.MouseEvent) => {
      if (!contentRef.current || duration === 0) return
      const t = calculateSnappedTime(moveEvent.clientX, contentRef.current)
      onScrub(t)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const timeMarkers = useMemo(() => {
    if (!duration) return []
    const markers = []
    // Adjust interval based on zoom to keep markers readable
    // Base interval is ~1/15th of duration at 1x zoom.
    // As zoom increases, we decrease the interval to show more detail.
    const baseInterval = duration / 15
    const interval = Math.max(1, Math.floor(baseInterval / zoom))

    for (let i = 0; i <= duration; i += interval) {
      markers.push(i)
    }
    return markers
  }, [duration, zoom])
  return (
    <div className={styles['cue-timeline-container']}>
      <div className={styles['cue-timeline-toolbar']}>
        <button onClick={onPlayPause} className={styles['cue-timeline-button']}>
          <img src={isPlaying ? PauseIcon : PlayIcon} width={16} />
        </button>
        <button onClick={onSave} className={styles['cue-timeline-button']}>
          <img src={SaveIcon} width={16} />
        </button>
        <div className={styles['cue-timeline-zoom']}>
          <label>Zoom:</label>
          <input
            type="range"
            min={1}
            max={20}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
        </div>
        <span className={styles['cue-timecode']} ref={timeDisplayRef}>
          {formatTime(currentTime)}
        </span>
      </div>
      <div
        className={styles['cue-timeline-content']}
        ref={contentRef}
        onMouseDown={handleMouseDown}
        style={{ overflowX: 'auto' }}
      >
        <div
          className={styles['cue-timeline-inner']}
          style={{ width: `${zoom * 100}%`, position: 'relative' }}
        >
          {/* Time Markers */}
          <div className={styles['cue-timeline-markers']}>
            {timeMarkers.map((time) => {
              const pct = (time / duration) * 100
              return (
                <div
                  key={time}
                  className={styles['cue-timeline-marker']}
                  style={{ left: `${pct}%` }}
                >
                  <div className={styles['cue-timeline-marker-line']} />
                  <div className={styles['cue-timeline-marker-label']}>
                    {formatTimeMarker(time)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cues */}
          <div className={styles['cue-timeline-cues']}>
            {cues.map((cue) => {
              const startPct = (cue.startTime / duration) * 100
              const endPct = (cue.endTime / duration) * 100
              const widthPct = endPct - startPct
              const color = getCameraColor(cue.camera)
              return (
                <div
                  key={cue.id}
                  className={styles['cue-timeline-cue'] + ' ' + styles[color]}
                  style={{
                    left: `${startPct}%`,
                    width: `${widthPct}%`
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedCueId(cue.id)
                  }}
                >
                  <span className={styles['cue-box-label']}>{cue.camera}</span> &nbsp;&nbsp;
                  <span className={styles['cue-timeline-cue-label']}>{cue.description}</span>
                </div>
              )
            })}
          </div>

          {/* Playhead */}
          <div className={styles['cue-timeline-playhead']} ref={playheadRef} />
        </div>
      </div>
    </div>
  )
}
export default CueTimeline
