/**
 * PDF Document Processor for Berkshire Hathaway Shareholder Letters
 * Processes PDF documents and stores embeddings in Pinecone vector database
 */

import fs from 'fs';
import path from 'path';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Pinecone } from '@pinecone-database/pinecone';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';

export interface DocumentMetadata {
  source: string;
  year: number;
  pageNumber?: number;
  chunkIndex: number;
  totalChunks: number;
  documentType: 'shareholder_letter';
}

export class PDFDocumentProcessor {
  private pinecone: Pinecone;
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor() {
    // Check if environment variables are loaded
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    if (!process.env.PINECONE_INDEX_NAME) {
      throw new Error('PINECONE_INDEX_NAME environment variable is required');
    }

    console.log(`Initializing with Pinecone index: ${process.env.PINECONE_INDEX_NAME}`);

    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      model: 'text-embedding-3-small',
      dimensions: 1024  // Match Pinecone index dimension
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });
  }

  /**
   * Process all PDFs in the documents folder
   */
  async processAllPDFs(): Promise<void> {
    const documentsDir = path.join(process.cwd(), 'documents');
    
    // Create documents directory if it doesn't exist
    if (!fs.existsSync(documentsDir)) {
      fs.mkdirSync(documentsDir, { recursive: true });
      console.log(`Created documents directory: ${documentsDir}`);
      console.log(`Please add your Berkshire Hathaway PDF files to: ${documentsDir}`);
      return;
    }

    // Get all PDF files
    const pdfFiles = fs.readdirSync(documentsDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(documentsDir, file));

    if (pdfFiles.length === 0) {
      console.log(`No PDF files found in ${documentsDir}`);
      console.log(`Please add Berkshire Hathaway shareholder letter PDFs to this folder`);
      return;
    }

    console.log(`Found ${pdfFiles.length} PDF files to process...`);

    // Process each PDF
    for (const pdfPath of pdfFiles) {
      try {
        await this.processPDF(pdfPath);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error processing ${path.basename(pdfPath)}:`, errorMessage);
      }
    }

    console.log(`Finished processing all PDFs`);
  }

  /**
   * Process a single PDF file
   */
  async processPDF(pdfPath: string): Promise<void> {
    const fileName = path.basename(pdfPath, '.pdf');
    console.log(`Processing: ${fileName}`);

    try {
      // Load PDF
      const loader = new PDFLoader(pdfPath);
      const rawDocs = await loader.load();
      
      // Extract year from filename (assumes format like "2023-berkshire-letter.pdf")
      const yearMatch = fileName.match(/(\d{4})/);
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

      // Combine all pages into one document for better chunking
      const fullText = rawDocs.map(doc => doc.pageContent).join('\n\n');
      
      // Split into chunks
      const textChunks = await this.textSplitter.splitText(fullText);
      
      // Create documents with metadata
      const documents = textChunks.map((chunk, index) => new Document({
        pageContent: chunk,
        metadata: {
          source: fileName,
          year,
          chunkIndex: index,
          totalChunks: textChunks.length,
          documentType: 'shareholder_letter' as const
        }
      }));

      // Store in Pinecone
      await this.storeInPinecone(documents);
      
      console.log(`Successfully processed ${fileName}: ${documents.length} chunks stored`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error processing ${fileName}:`, errorMessage);
      throw error;
    }
  }

  /**
   * Store documents in Pinecone
   */
  async storeInPinecone(documents: Document[]): Promise<void> {
    try {
      const index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      
      await PineconeStore.fromDocuments(
        documents,
        this.embeddings,
        {
          pineconeIndex: index,
          namespace: 'berkshire-hathaway-letters',
        }
      );
      
      console.log(`Stored ${documents.length} document chunks in Pinecone`);
    } catch (error) {
      console.error('Error storing in Pinecone:', error);
      throw error;
    }
  }

  /**
   * Get vector store for querying
   */
  async getVectorStore(): Promise<PineconeStore> {
    const index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME!);
    
    return new PineconeStore(this.embeddings, {
      pineconeIndex: index,
      namespace: 'berkshire-hathaway-letters',
    });
  }

  /**
   * Initialize Pinecone index if needed
   */
  async initialize(): Promise<void> {
    try {
      const indexName = process.env.PINECONE_INDEX_NAME!;
      
      // Check if index exists
      const indexes = await this.pinecone.listIndexes();
      const indexExists = indexes.indexes?.some(index => index.name === indexName);
      
      if (!indexExists) {
        console.log(`Creating Pinecone index: ${indexName}`);
        
        await this.pinecone.createIndex({
          name: indexName,
          dimension: 1024, // text-embedding-3-small dimension (1024 for our config)
          spec: {
            serverless: {
              cloud: 'aws',
              region: 'us-east-1'
            }
          }
        });
        
        console.log('Waiting for index to be ready...');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 1 minute
      }
      
      console.log(`Pinecone index ${indexName} is ready`);
    } catch (error) {
      console.error('Error initializing Pinecone:', error);
      throw error;
    }
  }

  /**
   * Check what's already stored in Pinecone
   */
  async checkPineconeStats(): Promise<void> {
    try {
      const index = this.pinecone.Index(process.env.PINECONE_INDEX_NAME!);
      const stats = await index.describeIndexStats();
      
      console.log('Pinecone Index Stats:');
      console.log(`   Total vectors: ${stats.totalRecordCount}`);
      console.log(`   Namespaces:`, Object.keys(stats.namespaces || {}));
      
      if (stats.namespaces?.['berkshire-hathaway-letters']) {
        const nsStats = stats.namespaces['berkshire-hathaway-letters'];
        console.log(`   Berkshire documents: ${nsStats.recordCount} chunks`);
      }
    } catch (error) {
      console.error('Error checking Pinecone stats:', error);
    }
  }
}