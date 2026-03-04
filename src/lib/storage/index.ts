import { createSupabaseAdmin } from '@/lib/supabase/admin'

const BUCKET = 'curation-assets'

export async function uploadFile(
  projectId: string,
  fileName: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const supabase = createSupabaseAdmin()
  const storagePath = `${projectId}/${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, {
      contentType,
      upsert: true,
    })

  if (error) throw new Error(`Upload failed: ${error.message}`)
  return storagePath
}

export async function deleteFile(storagePath: string): Promise<void> {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) throw new Error(`Delete failed: ${error.message}`)
}

export async function deleteProjectFiles(projectId: string): Promise<void> {
  const supabase = createSupabaseAdmin()
  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(projectId)

  if (files && files.length > 0) {
    const paths = files.map((f) => `${projectId}/${f.name}`)
    await supabase.storage.from(BUCKET).remove(paths)
  }
}

export function getPublicUrl(storagePath: string): string {
  const supabase = createSupabaseAdmin()
  const { data } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(storagePath)
  return data.publicUrl
}
