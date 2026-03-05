import { CurationView } from './CurationView'
import * as projectService from '@/lib/services/projects'
import * as assetService from '@/lib/services/assets'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  const [project, assets] = await Promise.all([
    projectService.getProject(id),
    assetService.listAssets(id),
  ])

  const initialProject = project ?? null
  const initialAssets =
    assets.map((a) => ({
      ...a,
      url: assetService.getAssetUrl(a.storagePath),
    })) ?? []

  return (
    <CurationView
      projectId={id}
      initialProject={initialProject}
      initialAssets={initialAssets}
    />
  )
}
