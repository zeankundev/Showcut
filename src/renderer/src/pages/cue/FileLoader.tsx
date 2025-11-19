import React, { useCallback } from 'react'

interface FileLoaderProps {
  onFileLoad: (videoPath: string) => void
}

const FileLoader: React.FC<FileLoaderProps> = ({ onFileLoad }) => {
  const handleClick = useCallback(async () => {
    console.log('[FileLoader] Opening file dialog...')
    const filePath = await window.api.dialog.openVideo()

    if (filePath) {
      console.log('[FileLoader] Selected video:', filePath)
      onFileLoad(filePath)
    } else {
      console.log('[FileLoader] No file selected')
    }
  }, [onFileLoad])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      event.stopPropagation()

      console.log('[FileLoader] File dropped')
      console.log('[FileLoader] DataTransfer:', event.dataTransfer)
      console.log('[FileLoader] Files:', event.dataTransfer.files)

      const files = event.dataTransfer.files
      if (files && files.length > 0) {
        const file = files[0]

        console.log('[FileLoader] File object:', file)
        console.log('[FileLoader] File properties:', Object.keys(file))
        console.log('[FileLoader] File.path:', (file as any).path)

        // Check if it's a video file
        if (file && file.type.startsWith('video/')) {
          // Try to get the path
          const filePath = (file as any).path

          if (filePath) {
            console.log('[FileLoader] Video file path:', filePath)
            onFileLoad(filePath)
          } else {
            console.error(
              '[FileLoader] Could not get file path - please use the click to browse option'
            )
            alert(
              'Drag and drop is not supported in this Electron configuration. Please click to browse for a file.'
            )
          }
        } else {
          console.warn('[FileLoader] Dropped file is not a video. Type:', file.type)
        }
      }
    },
    [onFileLoad]
  )

  const onDragOver = (event: React.DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        style={{
          minHeight: '400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          border: '2px dashed #555',
          borderRadius: '8px',
          padding: '40px',
          cursor: 'pointer'
        }}
      >
        <h1>Let&apos;s begin!</h1>
        <p>Click me to browse</p>
      </div>
    </div>
  )
}

export default FileLoader
