import React from 'react'
import logo from '../assets/img/logo.svg'
import Minimize from '../assets/img/minimize.svg'
import Maximize from '../assets/img/maximize.svg'
import Close from '../assets/img/close.svg'
import Restore from '../assets/img/restore.svg'
import styles from '../assets/styles/main.module.css'

const Header = (): React.ReactElement => {
  return (
    <header className={styles.header}>
      <div className={styles['logo-container']}>
        <img src={logo} width={24} />
      </div>
      <div className={styles['window-controls']}>
        <button className={styles['window-buttons']}>
          <img src={Minimize} />
        </button>
        <button className={styles['window-buttons']}>
          <img src={Maximize} />
        </button>
        <button className={styles['window-buttons']}>
          <img src={Close} />
        </button>
      </div>
    </header>
  )
}

export default Header
