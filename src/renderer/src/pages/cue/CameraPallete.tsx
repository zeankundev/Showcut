import React from 'react'
import styles from '../../assets/styles/editor.module.css'
import { getCameraColor } from '@renderer/constants'

interface CameraPalleteProps {
  onSelect: (camera: number) => void
  onClose: () => void
  selectedCamera: number
}
const CameraPallete: React.FC<CameraPalleteProps> = ({ onSelect, onClose, selectedCamera }) => {
  const cameras = Array.from({ length: 24 }, (_, i) => i + 1)
  return (
    <div className={styles['camera-pallete-picker']}>
      <h3>Choose a camera</h3>
      <div className={styles['camera-pallete-grid']}>
        {cameras.map((camera) => (
          <button
            key={camera}
            className={`${styles['camera-pallete-button']} ${styles[getCameraColor(camera)]}${selectedCamera === camera ? ' ' + styles['selected'] : ''}`}
            onClick={() => onSelect(camera)}
          >
            <b>{camera}</b>
          </button>
        ))}
      </div>
      <button className={styles['closer']} onClick={onClose}>
        Close
      </button>
    </div>
  )
}
export default CameraPallete
