import React, { useState } from 'react'
import logo from '../assets/img/logo.svg'
import Minimize from '../assets/img/minimize.svg'
import Maximize from '../assets/img/maximize.svg'
import Close from '../assets/img/close.svg'
import Restore from '../assets/img/restore.svg'
import styles from '../assets/styles/main.module.css'

const interop = window.electron

const Header = (): React.ReactElement => {
  const [maximized, setMaximized] = useState<boolean>(false)
  interop.ipcRenderer.on('isMaximized', (_event, isMaximized: boolean) => {
    console.log(`[windowbar] isMaximized: ${isMaximized}`)
    setMaximized(isMaximized)
  })
  return (
    <header className={styles.header}>
      <div className={styles['logo-container']}>
        <img src={logo} width={24} />
      </div>
      <div className={styles['window-electron-dragger']}>
        <div className={styles['cue-box-label']}>?</div>
        <p>Welcome to Showcut</p>
      </div>
      <div className={styles['window-controls']}>
        <button
          className={styles['window-buttons']}
          onClick={() => interop.ipcRenderer.send('minimize')}
        >
          <img src={Minimize} />
        </button>
        <button
          className={styles['window-buttons']}
          onClick={() => interop.ipcRenderer.send('toggle-max')}
        >
          <img src={maximized ? Restore : Maximize} />
        </button>
        <button
          className={styles['window-buttons']}
          onClick={() => interop.ipcRenderer.send('close')}
        >
          <img src={Close} />
        </button>
      </div>
    </header>
  )
}

export default Header
