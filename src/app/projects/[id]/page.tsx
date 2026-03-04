import { CurationView } from './CurationView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params

  return <CurationView projectId={id} />
}
