import { ProjectList } from '@/components/ProjectList'
import * as projectService from '@/lib/services/projects'
import styles from './page.module.scss'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const initialProjects = await projectService.listProjects()
  return (
    <div className={styles.app}>
      <ProjectList initialProjects={initialProjects} />
    </div>
  )
}
