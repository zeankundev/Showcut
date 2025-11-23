import { forwardRef } from 'react'
import styles from '../../assets/styles/editor.module.css'

interface MediaPreviewProps {
  src: string
  onLoadedMetadata: () => void
  onTimeUpdate: () => void
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
}

const MediaPreview = forwardRef<HTMLVideoElement, MediaPreviewProps>(
  ({ src, onLoadedMetadata, onTimeUpdate, onPlay, onPause }, ref) => {
    return (
      <div className={styles['video-player']}>
        <video
          ref={ref}
          src={src}
          className={styles['video-element']}
          onLoadedMetadata={onLoadedMetadata}
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
        />
      </div>
    )
  }
)

MediaPreview.displayName = 'MediaPreview'

export default MediaPreview
