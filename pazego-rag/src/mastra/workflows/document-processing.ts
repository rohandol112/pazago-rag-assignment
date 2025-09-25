import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { DocumentProcessor } from '../../lib/document-processor';
import fs from 'fs';

const documentIngestionStep = createStep({
  id: 'document_ingestion',
  description: 'Process and ingest PDF documents into the vector database',
  inputSchema: z.object({
    documentsPath: z.string().describe('Path to directory containing PDF documents'),
    forceReindex: z.boolean().default(false).describe('Force reindexing even if documents exist')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    documentsProcessed: z.number(),
    totalChunks: z.number(),
    message: z.string(),
    error: z.string().optional()
  }),
  execute: async ({ inputData }) => {
    try {
      const processor = new DocumentProcessor();
      
      // Check if path exists
      if (!fs.existsSync(inputData.documentsPath)) {
        throw new Error(`Documents path does not exist: ${inputData.documentsPath}`);
      }
      
      console.log(`Starting document ingestion from: ${inputData.documentsPath}`);
      
      // Initialize Pinecone index
      await processor.initializePineconeIndex();
      
      // Process all PDFs in the directory
      const documents = await processor.processDirectory(inputData.documentsPath);
      
      if (documents.length === 0) {
        throw new Error('No documents were processed');
      }
      
      // Store documents in vector database
      await processor.storeDocuments(documents);
      
      const uniqueDocuments = [...new Set(documents.map(doc => doc.metadata.source))];
      
      return {
        success: true,
        documentsProcessed: uniqueDocuments.length,
        totalChunks: documents.length,
        message: `Successfully processed ${uniqueDocuments.length} documents into ${documents.length} chunks`
      };
    } catch (error) {
      console.error('Document ingestion error:', error);
      return {
        success: false,
        documentsProcessed: 0,
        totalChunks: 0,
        message: 'Document ingestion failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

const vectorStoreValidationStep = createStep({
  id: 'vector_store_validation',
  description: 'Validate that the vector store is properly configured and contains data',
  inputSchema: z.object({
    testQuery: z.string().default('Warren Buffett investment philosophy').describe('Test query to validate vector store')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    resultsFound: z.number(),
    message: z.string(),
    sampleResult: z.string().optional(),
    error: z.string().optional()
  }),
  execute: async ({ inputData }) => {
    try {
      const processor = new DocumentProcessor();
      const vectorStore = await processor.getVectorStore();
      
      // Perform test search
      const results = await vectorStore.similaritySearch(inputData.testQuery, 3);
      
      if (results.length === 0) {
        throw new Error('No results found for test query - vector store may be empty');
      }
      
      return {
        success: true,
        resultsFound: results.length,
        message: `Vector store validation successful - found ${results.length} results`,
        sampleResult: results[0].pageContent.substring(0, 200) + '...'
      };
    } catch (error) {
      console.error('Vector store validation error:', error);
      return {
        success: false,
        resultsFound: 0,
        message: 'Vector store validation failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
});

export const documentProcessingWorkflow = createWorkflow({
  id: 'document-processing-workflow',
  inputSchema: z.object({
    documentsPath: z.string(),
    forceReindex: z.boolean().default(false)
  }),
  outputSchema: z.object({
    success: z.boolean(),
    documentsProcessed: z.number(),
    totalChunks: z.number(),
    message: z.string()
  })
}).then(documentIngestionStep);

documentProcessingWorkflow.commit();