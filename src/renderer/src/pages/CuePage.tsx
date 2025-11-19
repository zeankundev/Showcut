import React, { useState } from 'react'
import { CueDocument } from '../constants'
import styles from '../assets/styles/editor.module.css'
import FileLoader from './cue/FileLoader'
const CuePage = ({ cueDoc }: { cueDoc: CueDocument }): React.ReactElement => {
  const [doc, setDoc] = useState<CueDocument>(cueDoc)
  const handleFileLoad = (filePath: string): void => {
    console.log(`[CuePage] Loaded file: ${filePath}`)
    setDoc({ ...doc, videoPath: filePath })
  }
  return (
    <div className={styles['cue-editor-main']}>
      {doc.videoPath == '' ? (
        <FileLoader onFileLoad={handleFileLoad} />
      ) : (
        <div>
          <p>lo and behold its loaded</p>
        </div>
      )}
    </div>
  )
}
export default CuePage
