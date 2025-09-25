
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
  // Explicitly set storage to undefined - we're stateless using only Pinecone
  storage: undefined,
  logger: new PinoLogger({
    name: 'BerkshireRAG',
    level: 'info',
  }),
});
