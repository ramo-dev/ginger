// components/chat/tools/document/types.ts
export interface CreateDocumentInput {
  title: string
  content: string
  fileType?: 'txt' | 'md' | 'docx' | 'pdf' | 'html'
}

export interface CreateDocumentOutput {
  id: string
  title: string
  content?: string
  fileType: string
  downloadUrl?: string
  success: boolean
  error?: string
}

export interface CompletedDocument {
  id: string
  title: string
  content: string
  fileType: 'txt' | 'md' | 'docx' | 'pdf' | 'html'
  timestamp: number
}