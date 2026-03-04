import { NextResponse } from 'next/server'
import * as assetService from '@/lib/services/assets'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await assetService.deleteAsset(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to delete asset'
    console.error('DELETE /api/assets/[id] error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
