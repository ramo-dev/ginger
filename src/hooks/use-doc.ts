import { create } from 'zustand'
import { CompletedDocument } from '@/types/document'

interface DocStoreProps {
  documents: CompletedDocument[]
  addDocument: (doc: Omit<CompletedDocument, 'timestamp'>) => void
  removeDocument: (id: string) => void
  clearDocuments: () => void
}

export const useDocStore = create<DocStoreProps>((set) => ({
  documents: [],

  addDocument: (doc) => {
    console.log('📚 [DOC STORE] Adding document:', doc);
    const newDoc: CompletedDocument = {
      ...doc,
      timestamp: Date.now(),
    }
    set((state) => {
      const updatedDocuments = [...state.documents, newDoc];
      console.log('📚 [DOC STORE] Documents after add:', updatedDocuments.length, 'total');
      return {
        documents: updatedDocuments
      }
    })
  },

  removeDocument: (id) => {
    console.log('🗑️ [DOC STORE] Removing document:', id);
    set((state) => {
      const updatedDocuments = state.documents.filter((doc) => doc.id !== id);
      console.log('📚 [DOC STORE] Documents after remove:', updatedDocuments.length, 'total');
      return {
        documents: updatedDocuments
      }
    })
  },

  clearDocuments: () => {
    console.log('🧹 [DOC STORE] Clearing all documents');
    set({ documents: [] })
  },
}))

// Hook for convenience
export function useDoc() {
  const store = useDocStore()
  return store
}