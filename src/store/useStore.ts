'use client'

import { create } from 'zustand'
import type { Project, Asset, DragState, ToastState } from '@/types'

interface AssetWithUrl extends Asset {
  url: string
}

interface StoreState {
  projects: Project[]
  currentProject: Project | null
  assets: AssetWithUrl[]
  isUploading: boolean
  dragState: DragState | null
  toast: ToastState | null

  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void

  setAssets: (assets: AssetWithUrl[]) => void
  addAsset: (asset: AssetWithUrl) => void
  removeAsset: (id: string) => void
  reorderAssets: (fromIndex: number, toIndex: number) => void

  setIsUploading: (uploading: boolean) => void
  setDragState: (state: DragState | null) => void
  showToast: (message: string, variant?: 'success' | 'error') => void
  hideToast: () => void
}

let toastCounter = 0

export const useStore = create<StoreState>((set) => ({
  projects: [],
  currentProject: null,
  assets: [],
  isUploading: false,
  dragState: null,
  toast: null,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: (project) =>
    set((state) => ({ projects: [project, ...state.projects] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject,
    })),

  removeProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    })),

  setAssets: (assets) => set({ assets }),

  addAsset: (asset) =>
    set((state) => ({ assets: [...state.assets, asset] })),

  removeAsset: (id) =>
    set((state) => ({
      assets: state.assets.filter((a) => a.id !== id),
    })),

  reorderAssets: (fromIndex, toIndex) =>
    set((state) => {
      const next = [...state.assets]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      return { assets: next }
    }),

  setIsUploading: (uploading) => set({ isUploading: uploading }),

  setDragState: (dragState) => set({ dragState }),

  showToast: (message, variant = 'success') => {
    toastCounter += 1
    set({ toast: { message, variant, id: toastCounter } })
  },

  hideToast: () => set({ toast: null }),
}))
