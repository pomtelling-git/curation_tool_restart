export interface Project {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Asset {
  id: string
  projectId: string
  fileName: string
  storagePath: string
  mimeType: string
  size: number
  sortOrder: number
  createdAt: Date
}

export interface DragState {
  draggedId: string | null
  overId: string | null
}

export interface ToastState {
  message: string
  variant: 'success' | 'error'
  id: number
}

export interface CreateProjectInput {
  name?: string
}

export interface UpdateProjectInput {
  name?: string
}

export interface ReorderAssetsInput {
  assetIds: string[]
}
