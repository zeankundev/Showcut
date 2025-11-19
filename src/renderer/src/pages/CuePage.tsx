import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Cue, CueDocument } from '../constants'
import styles from '../assets/styles/editor.module.css'
import FileLoader from './cue/FileLoader'
import { updateTitle } from '@renderer/TitleUpdater'
import CueTimeline from './cue/CueTimeline'
import MediaPreview from './cue/MediaPreview'
import EditView from './cue/EditView'
import CameraPallete from './cue/CameraPallete'
const CuePage = ({ cueDoc }: { cueDoc: CueDocument }): React.ReactElement => {
  const [doc, setDoc] = useState<CueDocument>(cueDoc)
  const [cues, setCues] = useState<Cue[]>(cueDoc.cues)
  const [filePath, setFilePath] = useState<string>('')
  const [projectPath, setProjectPath] = useState<string>('')
  const [videoURL, setVideoURL] = useState<string>('')
  const [duration, setDuration] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [selectedCueId, setSelectedCueId] = useState<string | null>(null)
  const [isPalleteOpen, setIsPalleteOpen] = useState<boolean>(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const cuesRef = useRef<Cue[]>(cues)
  const currentTimeRef = useRef<number>(currentTime)
  const isPlayingRef = useRef<boolean>(isPlaying)
  const durationRef = useRef<number>(duration)

  useEffect(() => {
    cuesRef.current = cues
    currentTimeRef.current = currentTime
    isPlayingRef.current = isPlaying
    durationRef.current = duration
  }, [cues, currentTime, isPlaying, duration])
  useEffect(() => {
    if (cueDoc.videoPath) {
      console.log('[CuePage] video path exists, loading')
      handleFileLoad(cueDoc.videoPath)
      setCues(cueDoc.cues)
    } else {
      setCues([])
    }
  }, [])
  updateTitle(doc.num, doc.title)
  const handleFileLoad = async (filePath: string): Promise<void> => {
    console.log(`[CuePage] Loaded file: ${filePath}`)
    setDoc({ ...doc, videoPath: filePath })
    try {
      const fileBuffer = await window.api.fs.readFile(filePath)
      const blob = new Blob([fileBuffer], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setVideoURL(url)
      setCurrentTime(0)
      setIsPlaying(false)
      setSelectedCueId(null)
      setFilePath(filePath)
    } catch (e) {
      console.error('[CuePage] Error loading video file:', e)
    }
  }
  const handleLoadedMetadata = (): void => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      if (cues.length === 0) {
        setCues([
          {
            id: `cue_${Date.now()}`,
            startTime: 0,
            endTime: videoRef.current.duration,
            camera: 1,
            description: 'Start Cue',
            color: 'black'
          }
        ])
      }
    }
  }
  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }, [isPlaying])
  const handleScrub = useCallback(
    (newTime: number) => {
      if (videoRef.current) {
        const clampedTime = Math.max(0, Math.min(newTime, duration))
        videoRef.current.currentTime = clampedTime
        setCurrentTime(clampedTime)
      }
    },
    [duration]
  )
  const handleLiveCut = useCallback((camera: number) => {
    const currentCues = [...cuesRef.current]
    const time = currentTimeRef.current
    const isVideoPlaying = isPlayingRef.current

    if (isVideoPlaying) {
      const activeIndex = currentCues.findIndex((c) => c.startTime <= time && c.endTime > time)

      if (activeIndex !== -1) {
        const activeCue = currentCues[activeIndex]
        if (time - activeCue.startTime < 0.5) {
          currentCues[activeIndex] = { ...activeCue, camera }
          setCues(currentCues)
          setSelectedCueId(activeCue.id)
          return
        }
        const originalEndTime = activeCue.endTime
        currentCues[activeIndex] = { ...activeCue, endTime: time }
        const newCue: Cue = {
          id: `cue_${Date.now()}`,
          startTime: time,
          endTime: originalEndTime,
          camera: camera,
          description: `Cut to ${camera}`,
          color: 'white'
        }

        // Insert
        currentCues.splice(activeIndex + 1, 0, newCue)
        setCues(currentCues)
        setSelectedCueId(newCue.id)
      }
    } else {
      // If paused, just modify the active cue's camera
      const activeCue = currentCues.find((c) => c.startTime <= time && c.endTime > time)
      if (activeCue) {
        const updatedCues = currentCues.map((c) => (c.id === activeCue.id ? { ...c, camera } : c))
        setCues(updatedCues)
      }
    }
  }, [])
  const addCueAtPlayhead = useCallback(() => {
    const currentCues = [...cuesRef.current]
    const time = currentTimeRef.current
    const activeIndex = currentCues.findIndex((c) => c.startTime <= time && c.endTime > time)

    if (activeIndex !== -1) {
      const activeCue = currentCues[activeIndex]

      if (time <= activeCue.startTime + 0.001) return

      const originalEndTime = activeCue.endTime

      currentCues[activeIndex] = { ...activeCue, endTime: time }

      const newCue: Cue = {
        id: `cue_${Date.now()}`,
        startTime: time + 1e-3,
        endTime: originalEndTime,
        camera: activeCue.camera,
        description: 'New Cue',
        color: 'white'
      }

      currentCues.splice(activeIndex + 1, 0, newCue)
      setCues(currentCues)
      setSelectedCueId(newCue.id)
    }
  }, [])
  useEffect(() => {
    const FRAME_TIME = 0.04 // Approx 1 frame at 25fps

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      if (e.code === 'Space') {
        e.preventDefault()
        handlePlayPause()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        if (videoRef.current) {
          const newTime = Math.max(0, videoRef.current.currentTime - FRAME_TIME)
          videoRef.current.currentTime = newTime
          setCurrentTime(newTime)
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        if (videoRef.current) {
          const newTime = Math.min(durationRef.current, videoRef.current.currentTime + FRAME_TIME)
          videoRef.current.currentTime = newTime
          setCurrentTime(newTime)
        }
      } else {
        // Check for number keys 1-9
        const num = parseInt(e.key)
        if (!isNaN(num) && num >= 1 && num <= 9) {
          handleLiveCut(num)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlePlayPause, handleLiveCut])

  const updateCue = (updatedCue: Cue) => {
    const index = cues.findIndex((c) => c.id === updatedCue.id)
    if (index === -1) return

    const newCues = [...cues]
    newCues[index] = updatedCue
    setCues(newCues)
  }

  const deleteCue = (id: string) => {
    const index = cues.findIndex((c) => c.id === id)
    if (index === -1 || cues.length <= 1) return // Keep at least one cue

    const newCues = [...cues]
    const cueToDelete = newCues[index]

    // Extend previous cue if exists
    if (index > 0) {
      newCues[index - 1].endTime = cueToDelete.endTime
      newCues.splice(index, 1)
    } else {
      // If deleting first cue, extend next cue to start at 0
      newCues[index + 1].startTime = 0
      newCues.splice(index, 1)
    }
    setCues(newCues)
    setSelectedCueId(null)
  }
  const handleSave = async (): Promise<void> => {
    const savedData: CueDocument = {
      num: 1,
      title: 'Untitled Cue',
      videoPath: filePath,
      framerate: 24,
      cues: cues
    }
    console.log(JSON.stringify(savedData))
    if (projectPath) {
      window.api.fs.writeFile(projectPath, JSON.stringify(savedData))
    } else {
      const path = await window.api.dialog.saveProject()
      if (path) {
        console.log(path)
        window.api.fs.writeFile(path, JSON.stringify(savedData))
        setProjectPath(path)
      }
    }
  }
  return (
    <div className={styles['cue-editor-main']}>
      {doc.videoPath == '' ? (
        <FileLoader onFileLoad={handleFileLoad} />
      ) : (
        <>
          <div className={styles['top-container']}>
            <EditView
              cues={cues}
              currentTime={currentTime}
              selectedCueId={selectedCueId}
              updateCue={updateCue}
              deleteCue={deleteCue}
              addCue={addCueAtPlayhead}
              onCameraPaletteOpen={() => setIsPalleteOpen(true)}
              videoRef={videoRef}
            />
            <div className={styles['video-workflow']}>
              <MediaPreview
                ref={videoRef}
                src={videoURL}
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
          <CueTimeline
            cues={cues}
            duration={duration}
            currentTime={currentTime}
            onScrub={handleScrub}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onSave={handleSave}
            setSelectedCueId={setSelectedCueId}
            videoRef={videoRef}
          />
          {isPalleteOpen && selectedCueId && (
            <CameraPallete
              selectedCamera={cues.find((c) => c.id === selectedCueId)?.camera || 1}
              onSelect={(cam) => {
                const cue = cues.find((c) => c.id === selectedCueId)
                if (cue) {
                  updateCue({ ...cue, camera: cam })
                }
                setIsPalleteOpen(false)
              }}
              onClose={() => setIsPalleteOpen(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
export default CuePage
