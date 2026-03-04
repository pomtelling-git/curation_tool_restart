import { NextResponse } from 'next/server'
import * as assetService from '@/lib/services/assets'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const assets = await assetService.listAssets(id)
    const withUrls = assets.map((asset) => ({
      ...asset,
      url: assetService.getAssetUrl(asset.storagePath),
    }))
    return NextResponse.json(withUrls)
  } catch (error) {
    console.error('GET /api/projects/[id]/assets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assets' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const asset = await assetService.uploadAsset(
      id,
      file.name,
      file.type,
      file.size,
      buffer
    )

    return NextResponse.json(
      {
        ...asset,
        url: assetService.getAssetUrl(asset.storagePath),
      },
      { status: 201 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to upload asset'
    console.error('POST /api/projects/[id]/assets error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
