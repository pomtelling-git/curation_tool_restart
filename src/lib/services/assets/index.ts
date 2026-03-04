import * as assetRepo from '@/lib/repositories/assets'
import { uploadFile, deleteFile, getPublicUrl } from '@/lib/storage'
import type { Asset } from '@/types'

const ALLOWED_PREFIXES = ['image/', 'video/'] as const

function isAllowedType(mimeType: string): boolean {
  return ALLOWED_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
}

export async function listAssets(projectId: string): Promise<Asset[]> {
  return assetRepo.getAssetsByProjectId(projectId)
}

export async function uploadAsset(
  projectId: string,
  fileName: string,
  mimeType: string,
  size: number,
  fileBuffer: Buffer
): Promise<Asset> {
  if (!isAllowedType(mimeType)) {
    throw new Error(`Unsupported file type: ${mimeType}`)
  }

  const timestamp = Date.now()
  const uniqueName = `${timestamp}-${fileName}`
  const storagePath = await uploadFile(projectId, uniqueName, fileBuffer, mimeType)
  const maxOrder = await assetRepo.getMaxSortOrder(projectId)

  return assetRepo.createAsset({
    projectId,
    fileName,
    storagePath,
    mimeType,
    size,
    sortOrder: maxOrder + 1,
  })
}

export async function deleteAsset(id: string): Promise<void> {
  const asset = await assetRepo.getAssetById(id)
  if (!asset) throw new Error('Asset not found')
  await deleteFile(asset.storagePath)
  await assetRepo.deleteAsset(id)
}

export async function reorderAssets(assetIds: string[]): Promise<void> {
  await assetRepo.reorderAssets(assetIds)
}

export function getAssetUrl(storagePath: string): string {
  return getPublicUrl(storagePath)
}
