import styles from '../assets/styles/main.module.css'
import HomeIcon from '../assets/img/home.svg'
import CuesIcon from '../assets/img/cues.svg'
import { useState } from 'react'
import Home from '../pages/Home'
import CuePage from '../pages/CuePage'
import { CueDocument } from '@renderer/constants'

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
  const [cueDocument, setCueDocument] = useState<CueDocument | null>(null)
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
        {page == Page.Home && (
          <Home
            onPassCueDocument={(cuedoc) => {
              setCueDocument(cuedoc)
              setPage(Page.CueEditor)
            }}
          />
        )}
        {page == Page.CueEditor &&
          (cueDocument ? <CuePage cueDoc={cueDocument} /> : <div>Please load a cue document.</div>)}
      </>
    </div>
  )
}

export default MainView
