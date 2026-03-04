import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as projectService from '@/lib/services/projects'

const CreateProjectSchema = z.object({
  name: z.string().optional(),
})

export async function GET() {
  try {
    const projects = await projectService.listProjects()
    return NextResponse.json(projects)
  } catch (error) {
    console.error('GET /api/projects error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = CreateProjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    const project = await projectService.createProject(parsed.data.name)
    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : String(error)
    console.error('POST /api/projects error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create project',
        ...(process.env.NODE_ENV === 'development' && { detail: message }),
      },
      { status: 500 }
    )
  }
}
