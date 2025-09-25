
import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { documentProcessingWorkflow } from './workflows/document-processing';
import { ragAgent } from './agents/rag-agent';

export const mastra = new Mastra({
  workflows: { 
    documentProcessingWorkflow 
  },
  agents: { 
    ragAgent
  },
  storage: new LibSQLStore({
    // Use file storage for persistence of conversations and data
    url: process.env.DATABASE_URL || "file:./mastra.db",
  }),
  logger: new PinoLogger({
    name: 'BerkshireRAG',
    level: 'info',
  }),
});
