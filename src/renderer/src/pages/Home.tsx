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
  const openCueDoc = async () => {
    const filePath = await window.api.dialog.openProject()
    if (filePath) {
      const file = await window.api.fs.readFile(filePath, 'utf-8')
      try {
        const parsed = JSON.parse(file as string)
        const payload: CueDocument = {
          title: parsed.title || 'Unknown Cue',
          num: parsed.num || '?',
          videoPath: parsed.videoPath || '',
          framerate: parsed.framerate || 24,
          cues: parsed.cues || []
        }
        console.log(payload)
        onPassCueDocument(payload)
      } catch (e) {
        console.error(e)
      }
    }
  }
  return (
    <div className={styles['home']}>
      <h1>Welcome to Showcut</h1>
      <button onClick={() => onPassCueDocument(initialCueDocument)}>Create New Cue Document</button>
      <button onClick={openCueDoc}>Open Previous Document</button>
    </div>
  )
}
export default Home
