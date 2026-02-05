import { tool, zodSchema } from "ai";
import { z } from "zod";

// Mock document creation API - replace with your actual document generation logic
const createDocumentAPI = async (params: {
  title: string;
  content: string;
  fileType: string;
}) => {
  // Simulate document creation delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a mock document ID and download URL
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // In production, you would:
  // 1. Generate the actual file (docx, pdf, etc.)
  // 2. Upload to cloud storage (S3, etc.)
  // 3. Return the download URL
  
  return {
    id: docId,
    title: params.title,
    content: params.content,
    fileType: params.fileType,
    downloadUrl: `/api/documents/${docId}/download`,
    createdAt: new Date().toISOString(),
    success: true,
  };
};

// Mock document editing API
const editDocumentAPI = async (params: {
  documentId: string;
  title?: string;
  content?: string;
}) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    id: params.documentId,
    title: params.title || "Edited Document",
    content: params.content || "",
    fileType: "txt",
    downloadUrl: `/api/documents/${params.documentId}/download`,
    updatedAt: new Date().toISOString(),
    success: true,
  };
};

export const createDocumentTool = tool({
  description: "Create a new document with specified title, content, and file type",
  inputSchema: zodSchema(
    z.object({
      title: z.string().describe("The title of the document"),
      content: z.string().describe("The content of the document"),
      fileType: z
        .enum(["txt", "md", "docx", "pdf", "html"])
        .default("txt")
        .describe("The file type/format of the document"),
    }),
  ),
  execute: async ({ title, content, fileType }) => {
    console.log('🔍 [CREATE DOCUMENT TOOL] Input received:', { title, content, fileType });
    
    try {
      console.log('🚀 [CREATE DOCUMENT TOOL] Calling createDocumentAPI...');
      const document = await createDocumentAPI({
        title,
        content,
        fileType,
      });
      
      console.log('✅ [CREATE DOCUMENT TOOL] API result:', document);

      const result = {
        id: document.id,
        title: document.title,
        content: document.content,
        fileType: document.fileType,
        downloadUrl: document.downloadUrl,
        success: true,
      };
      
      console.log('📤 [CREATE DOCUMENT TOOL] Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ [CREATE DOCUMENT TOOL] Error:', error);
      const errorResult = {
        id: "error",
        title,
        fileType,
        success: false,
        error: error instanceof Error ? error.message : "Failed to create document",
      };
      console.log('📤 [CREATE DOCUMENT TOOL] Returning error result:', errorResult);
      return errorResult;
    }
  },
});

export const editDocumentTool = tool({
  description: "Edit an existing document by updating its title or content",
  inputSchema: zodSchema(
    z.object({
      documentId: z.string().describe("The ID of the document to edit"),
      title: z.string().optional().describe("New title for the document"),
      content: z.string().optional().describe("New content for the document"),
    }),
  ),
  execute: async ({ documentId, title, content }) => {
    console.log('🔍 [EDIT DOCUMENT TOOL] Input received:', { documentId, title, content });
    
    try {
      console.log('🚀 [EDIT DOCUMENT TOOL] Calling editDocumentAPI...');
      const document = await editDocumentAPI({
        documentId,
        title,
        content,
      });
      
      console.log('✅ [EDIT DOCUMENT TOOL] API result:', document);

      const result = {
        id: document.id,
        title: document.title,
        content: document.content,
        fileType: document.fileType,
        downloadUrl: document.downloadUrl,
        success: true,
      };
      
      console.log('📤 [EDIT DOCUMENT TOOL] Returning result:', result);
      return result;
    } catch (error) {
      console.error('❌ [EDIT DOCUMENT TOOL] Error:', error);
      const errorResult = {
        id: documentId,
        success: false,
        error: error instanceof Error ? error.message : "Failed to edit document",
      };
      console.log('📤 [EDIT DOCUMENT TOOL] Returning error result:', errorResult);
      return errorResult;
    }
  },
});

// Export all document tools
export const documentTools = {
  createDocument: createDocumentTool,
  editDocument: editDocumentTool,
};