/**
 * PDF processing script for Berkshire Hathaway documents
 * Processes PDF documents and stores them in Pinecone vector database
 */

import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { Document } from '@langchain/core/documents';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function processPDFs() {
  console.log('Processing Berkshire Hathaway PDF Documents\n');

  try {
    // Initialize services
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      model: 'text-embedding-3-small',  // Use newer model
      dimensions: 1024  // Match your Pinecone index dimension
    });

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', '']
    });

    // Get PDF files
    const documentsDir = path.join(process.cwd(), 'documents');
    const pdfFiles = fs.readdirSync(documentsDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => path.join(documentsDir, file));

    console.log(`Found ${pdfFiles.length} PDF files to process:`);
    pdfFiles.forEach(file => console.log(`   - ${path.basename(file)}`));

    // Process each PDF
    const allDocuments = [];

    for (const pdfPath of pdfFiles) {
      try {
        const fileName = path.basename(pdfPath, '.pdf');
        console.log(`\nProcessing: ${fileName}`);

        // Load PDF
        const loader = new PDFLoader(pdfPath);
        const rawDocs = await loader.load();
        
        // Extract year from filename
        const yearMatch = fileName.match(/(\d{4})/);
        const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

        // Combine all pages
        const fullText = rawDocs.map(doc => doc.pageContent).join('\n\n');
        
        // Split into chunks
        const textChunks = await textSplitter.splitText(fullText);
        
        console.log(`   Extracted ${rawDocs.length} pages, created ${textChunks.length} chunks`);

        // Create documents with metadata
        const documents = textChunks.map((chunk, index) => new Document({
          pageContent: chunk,
          metadata: {
            source: fileName,
            year,
            chunkIndex: index,
            totalChunks: textChunks.length,
            documentType: 'shareholder_letter'
          }
        }));

        allDocuments.push(...documents);
        console.log(`   Processed ${fileName}: ${documents.length} chunks ready`);

      } catch (error) {
        console.error(`   Error processing ${path.basename(pdfPath)}:`, error.message);
      }
    }

    console.log(`\nTotal chunks to store: ${allDocuments.length}`);

    // Store in Pinecone
    if (allDocuments.length > 0) {
      console.log('\nStoring documents in Pinecone...');
      
      const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
      
      await PineconeStore.fromDocuments(
        allDocuments,
        embeddings,
        {
          pineconeIndex: index,
          namespace: 'berkshire-hathaway-letters'
        }
      );

      console.log('Successfully stored all documents in Pinecone');

      // Check stats
      console.log('\nFinal Pinecone Stats:');
      const stats = await index.describeIndexStats();
      console.log(`   Total records: ${stats.totalRecordCount}`);
      if (stats.namespaces?.['berkshire-hathaway-letters']) {
        const nsStats = stats.namespaces['berkshire-hathaway-letters'];
        console.log(`   Berkshire documents: ${nsStats.recordCount} chunks`);
      }
    }

    console.log('\nPDF Processing Complete');
    console.log('\nNext Steps:');
    console.log('1. Start your Mastra server: npm run dev');
    console.log('2. Visit http://localhost:4111/');
    console.log('3. Select "ragAgent" and ask questions about Berkshire Hathaway');
    console.log('\nExample questions:');
    console.log('   - "What did Buffett say about inflation in 2022?"');
    console.log('   - "How did COVID-19 impact Berkshire\'s strategy?"');
    console.log('   - "What are Buffett\'s investment principles?"');

  } catch (error) {
    console.error('Setup failed:', error);
    
    if (error.message?.includes('API key')) {
      console.log('\nCheck your OpenAI and Pinecone API keys in .env file');
    } else if (error.message?.includes('index')) {
      console.log('\nMake sure your Pinecone index exists and is configured correctly');
    }
  }
}

processPDFs();