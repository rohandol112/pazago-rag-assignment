# 🚀 Pazago Assignment - Berkshire Intelligence RAG System

## 📋 Assignment Submission

**Framework**: Mastra with OpenAI GPT-4o & Pinecone  
**Status**: ✅ **Production Ready & Deployed**

### 🌐 **Live Demo**
- **Backend API**: https://pazago-rag-assignment-1.onrender.com
- **Frontend**: Ready for deployment (connect via environment variable)
- **Documents**: 337+ chunks from real Berkshire Hathaway letters (2019-2024)

A sophisticated RAG (Retrieval-Augmented Generation) application that provides AI-powered insights from Warren Buffett's Berkshire Hathaway shareholder letters.

## Features

- **Intelligent Q&A**: Ask questions about Warren Buffett's investment philosophy
- **Real Document Search**: Searches through 337 processed document chunks
- **Source Attribution**: Shows which shareholder letters were referenced
- **Professional UI**: Clean, responsive React frontend
- **Markdown Support**: Properly formatted responses with headers, lists, and emphasis
- **Year Filtering**: Filter responses by specific years (2019-2024)

## Tech Stack

### Backend (Mastra Framework)
- **Mastra**: v0.13.2-alpha.4 - AI agent framework
- **OpenAI GPT-4o**: For chat completions and embeddings
- **Pinecone**: Vector database for document storage
- **LangChain**: PDF processing and text splitting
- **LibSQL**: Conversation persistence

### Frontend (React)
- **React 18**: Modern React with TypeScript
- **Tailwind CSS**: Utility-first CSS framework  
- **React Markdown**: Proper markdown rendering
- **Lucide React**: Icon library

## Project Structure

```
├── berkshire-frontend/          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   └── BerkshireChat.tsx    # Main chat interface
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   └── package.json
│
└── pazego-rag/                 # Mastra backend application
    ├── src/
    │   ├── lib/
    │   │   └── pdf-document-processor.ts  # PDF processing & Pinecone
    │   └── mastra/
    │       ├── agents/
    │       │   └── rag-agent.ts           # Main RAG agent
    │       ├── tools/
    │       │   └── rag-tools.ts           # Search tools
    │       ├── workflows/
    │       │   └── document-processing.ts  # Document workflow
    │       └── index.ts                   # Mastra configuration
    ├── documents/              # Berkshire Hathaway PDFs (2019-2024)
    ├── process-pdfs.mjs       # PDF processing script
    ├── .env                   # Environment variables
    └── package.json
```

## Quick Start

### Prerequisites
- Node.js (v18 or higher)
- OpenAI API key
- Pinecone API key

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd pazego-rag
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENVIRONMENT=your_pinecone_environment
   PINECONE_INDEX=your_pinecone_index_name
   ```

4. Process PDFs (if not already done):
   ```bash
   node process-pdfs.mjs
   ```

5. Start backend server:
   ```bash
   npm run dev
   ```
   Backend runs at: http://localhost:4111

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd berkshire-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start frontend server:
   ```bash
   npm start
   ```
   Frontend runs at: http://localhost:3000

## Usage

1. **Open the application**: Navigate to http://localhost:3000
2. **Ask questions**: Use the chat interface to ask about Warren Buffett's investment philosophy
3. **View sources**: See which shareholder letters were referenced in responses
4. **Filter by year**: Use the year dropdown to focus on specific time periods
5. **Quick questions**: Click on suggested questions to get started

## Data

The system contains:
- **6 years** of Berkshire Hathaway shareholder letters (2019-2024)
- **337 document chunks** processed and stored in Pinecone
- **1024-dimensional embeddings** using OpenAI's text-embedding-3-small model

## API Endpoints

- **Chat with RAG Agent**: `POST http://localhost:4111/api/agents/ragAgent/generate`
- **Mastra Playground**: `http://localhost:4111/`

## UI Features

- Clean, professional design
- Responsive layout for desktop and mobile
- Real-time typing indicators
- Message timestamps
- Source attribution with relevance scores
- Markdown rendering for formatted responses

## Example Questions

- "What is Warren Buffett's investment philosophy?"
- "How does Berkshire evaluate potential acquisitions?"
- "What are the key principles for long-term investing?"
- "How does Berkshire approach risk management?"
- "What does Buffett think about market timing?"

## 🚀 Production Deployment Status

### ✅ **Backend - DEPLOYED & LIVE**
- **Platform**: Render (Docker deployment)  
- **URL**: https://pazago-rag-assignment-1.onrender.com
- **Status**: ✅ Production ready and serving requests

### 🎯 **Frontend - Ready for Deployment**
Frontend is configured to connect to the live backend:
```bash
cd berkshire-frontend
npm run build
# Deploy to Vercel, Netlify, or any static hosting
```

### 🔧 **Testing the Live Backend**
Test the deployed API directly:
```bash
curl -X POST https://pazago-rag-assignment-1.onrender.com/api/agents/ragAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is Warren Buffett'\''s investment philosophy?"}]}'
```

## License

This project is for educational and demonstration purposes.

---

**Berkshire Intelligence** - Bringing Warren Buffett's investment wisdom to your fingertips through AI.