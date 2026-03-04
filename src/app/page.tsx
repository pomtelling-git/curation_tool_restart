import { ProjectList } from '@/components/ProjectList'
import styles from './page.module.scss'

export default function HomePage() {
  return (
    <div className={styles.app}>
      <ProjectList />
    </div>
  )
}
