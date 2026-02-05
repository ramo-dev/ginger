// components/chat/tools/document/index.tsx
import { useDoc } from '@/hooks/use-doc'
import { DocumentTool } from './DocumentTool'
import { z } from "zod";
import type { Toolkit } from "@assistant-ui/react";

// Mock document creation API - same as server-side
const createDocumentAPI = async (params: {
  title: string;
  content: string;
  fileType: string;
}) => {
  // Simulate document creation delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate a mock document ID and download URL
  const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
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

export const DocumentToolkit: Toolkit = {
  createDocument: {
    description: "Create a new document with specified title, content, and file type",
    parameters: z.object({
      title: z.string().describe("The title of the document"),
      content: z.string().describe("The content of the document"),
      fileType: z
        .enum(["txt", "md", "docx", "pdf", "html"])
        .default("txt")
        .describe("The file type/format of the document"),
    }),
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
    render: ({ args, result }) => {
      const { addDocument } = useDoc()
      
      console.log('🎨 [CREATE DOCUMENT UI] Render called:', { 
        args,
        hasResult: result !== undefined
      });
      
      // Determine the state based on result
      const state = result === undefined 
        ? "input-available" 
        : result.success 
          ? "output-available" 
          : "output-error";

      // Handle completed state - only save when document is ready
      if (result !== undefined && result.success) {
        console.log('✅ [CREATE DOCUMENT UI] Document completed, saving to store:', {
          id: result.id,
          title: result.title,
          contentLength: result.content?.length || 0,
          fileType: result.fileType || 'txt'
        });
        
        // Save completed document to store
        addDocument({
          id: result.id,
          title: result.title,
          content: result.content,
          fileType: result.fileType || 'txt',
        })
      }
      
      return (
        <DocumentTool
          input={args}
          output={result}
          errorText={result?.error}
          state={state}
          type="tool-createDocument"
        />
      );
    },
  },
  editDocument: {
    description: "Edit an existing document by updating its title or content",
    parameters: z.object({
      documentId: z.string().describe("The ID of the document to edit"),
      title: z.string().optional().describe("New title for the document"),
      content: z.string().optional().describe("New content for the document"),
    }),
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
    render: ({ args, result }) => {
      const { addDocument } = useDoc()
      
      console.log('🎨 [EDIT DOCUMENT UI] Render called:', { 
        args,
        hasResult: result !== undefined
      });
      
      // Determine the state based on result
      const state = result === undefined 
        ? "input-available" 
        : result.success 
          ? "output-available" 
          : "output-error";

      // Handle completed state - only save when document is ready
      if (result !== undefined && result.success) {
        console.log('✅ [EDIT DOCUMENT UI] Document completed, saving to store:', {
          id: result.id,
          title: result.title,
          contentLength: result.content?.length || 0,
          fileType: result.fileType || 'txt'
        });
        
        // Save completed document to store
        addDocument({
          id: result.id,
          title: result.title,
          content: result.content,
          fileType: result.fileType || 'txt',
        })
      }
      
      return (
        <DocumentTool
          input={{
            title: args.title || "Editing Document",
            content: args.content || "",
            fileType: "txt",
          }}
          output={result}
          errorText={result?.error}
          state={state}
          type="tool-editDocument"
        />
      );
    },
  },
}