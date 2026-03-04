import { prisma } from '@/lib/prisma'
import type { Asset } from '@/types'

function toAsset(row: {
  id: string
  projectId: string
  fileName: string
  storagePath: string
  mimeType: string
  size: bigint
  sortOrder: number
  createdAt: Date
}): Asset {
  return {
    id: row.id,
    projectId: row.projectId,
    fileName: row.fileName,
    storagePath: row.storagePath,
    mimeType: row.mimeType,
    size: Number(row.size),
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
  }
}

export async function getAssetsByProjectId(projectId: string): Promise<Asset[]> {
  const rows = await prisma.asset.findMany({
    where: { projectId },
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map(toAsset)
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const row = await prisma.asset.findUnique({ where: { id } })
  return row ? toAsset(row) : null
}

export async function createAsset(data: {
  projectId: string
  fileName: string
  storagePath: string
  mimeType: string
  size: number
  sortOrder: number
}): Promise<Asset> {
  const row = await prisma.asset.create({
    data: {
      projectId: data.projectId,
      fileName: data.fileName,
      storagePath: data.storagePath,
      mimeType: data.mimeType,
      size: BigInt(data.size),
      sortOrder: data.sortOrder,
    },
  })
  return toAsset(row)
}

export async function deleteAsset(id: string): Promise<void> {
  await prisma.asset.delete({ where: { id } })
}

export async function getMaxSortOrder(projectId: string): Promise<number> {
  const result = await prisma.asset.aggregate({
    where: { projectId },
    _max: { sortOrder: true },
  })
  return result._max.sortOrder ?? -1
}

export async function reorderAssets(assetIds: string[]): Promise<void> {
  await prisma.$transaction(
    assetIds.map((id, index) =>
      prisma.asset.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )
}
