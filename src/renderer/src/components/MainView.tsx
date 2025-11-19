import styles from '../assets/styles/main.module.css'
import HomeIcon from '../assets/img/home.svg'
import CuesIcon from '../assets/img/cues.svg'
import { useState } from 'react'
import Home from '../pages/Home'
import CuePage from '../pages/CuePage'

enum Page {
  Home,
  CueEditor
}

const SidePane = ({
  state,
  onStateChange
}: {
  state: Page
  onStateChange: (page: Page) => void
}): React.ReactElement => {
  return (
    <div className={styles['side-pane']}>
      <button
        className={styles['side-pane-button'] + (state == Page.Home ? ' ' + styles['active'] : '')}
        onClick={() => onStateChange(Page.Home)}
      >
        <img src={HomeIcon} width={24} />
      </button>
      <button
        className={
          styles['side-pane-button'] + (state == Page.CueEditor ? ' ' + styles['active'] : '')
        }
        onClick={() => onStateChange(Page.CueEditor)}
      >
        <img src={CuesIcon} width={24} />
      </button>
    </div>
  )
}

const MainView = (): React.ReactElement => {
  const [page, setPage] = useState<Page>(Page.Home)
  return (
    <div className={styles['main-view']}>
      <SidePane
        state={page}
        onStateChange={(page) => {
          setPage(page)
          console.log('[MainView] page change')
        }}
      />
      <>
        {page == Page.Home && <Home />}
        {page == Page.CueEditor && <CuePage />}
      </>
    </div>
  )
}

export default MainView
