import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as assetService from '@/lib/services/assets'

const ReorderSchema = z.object({
  assetIds: z.array(z.string().uuid()),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params
    const body = await request.json()
    const parsed = ReorderSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    await assetService.reorderAssets(parsed.data.assetIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/projects/[id]/assets/reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder assets' },
      { status: 500 }
    )
  }
}
