'use client'

import { create } from 'zustand'

interface DocSidebarState {
  isOpen: boolean
  isLoading: boolean
  documentId: string | null
  documentContent: string | null
  documentTitle: string | null
  documentFileType: string | null
  openSidebar: (documentId?: string, content?: string, title?: string, fileType?: string) => void
  closeSidebar: () => void
  setLoading: (loading: boolean) => void
  setDocumentContent: (content: string, title: string, fileType: string) => void;
}

export const useDocSidebar = create<DocSidebarState>((set) => ({
  isOpen: false,
  isLoading: false,
  documentId: null,
  documentContent: null,
  documentTitle: null,
  documentFileType: null,
  openSidebar: (documentId, content, title, fileType) => set({ 
    isOpen: true, 
    documentId: documentId || null,
    documentContent: content || null,
    documentTitle: title || null,
    documentFileType: fileType || null
  }),
  closeSidebar: () => set({ 
    isOpen: false, 
    isLoading: false, 
    documentId: null,
    documentContent: null,
    documentTitle: null,
    documentFileType: null
  }),
  setLoading: (loading) => set({ isLoading: loading }),
  setDocumentContent: (content, title, fileType) => set({ 
    documentContent: content,
    documentTitle: title,
    documentFileType: fileType
  }),
}))
