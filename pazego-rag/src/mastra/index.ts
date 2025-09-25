
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { documentProcessingWorkflow } from './workflows/document-processing';
import { ragAgent } from './agents/rag-agent';

export const mastra = new Mastra({
  workflows: { 
    documentProcessingWorkflow 
  },
  agents: { 
    ragAgent
  },
  // No storage needed - we use Pinecone for document storage
  // Conversations are stateless for this RAG application
  logger: new PinoLogger({
    name: 'BerkshireRAG',
    level: 'info',
  }),
});
