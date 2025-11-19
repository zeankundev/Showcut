import styles from '../assets/styles/main.module.css'
import { CueDocument } from '@renderer/constants'

const Home = ({
  onPassCueDocument
}: {
  onPassCueDocument: (cue: CueDocument) => void
}): React.ReactElement => {
  const initialCueDocument: CueDocument = {
    title: 'Untitled Cue',
    num: 1,
    videoPath: '',
    framerate: 24,
    cues: []
  }
  return (
    <div className={styles['home']}>
      <h1>Welcome to Showcut</h1>
      <button onClick={() => onPassCueDocument(initialCueDocument)}>Create New Cue Document</button>
    </div>
  )
}
export default Home
