# Berkshire Hathaway Documents Directory

## Instructions

1. **Download Documents**: Download the Berkshire Hathaway annual shareholder letters from the provided Google Drive link.

2. **Place PDF Files Here**: Copy all the PDF files to this directory. The expected files are:
   - `2019-berkshire-hathaway-annual-letter.pdf`
   - `2020-berkshire-hathaway-annual-letter.pdf`
   - `2021-berkshire-hathaway-annual-letter.pdf`
   - `2022-berkshire-hathaway-annual-letter.pdf`
   - `2023-berkshire-hathaway-annual-letter.pdf`
   - `2024-berkshire-hathaway-annual-letter.pdf`

   **Note**: The exact filenames don't matter as long as they are PDF files and contain year information in the filename.

3. **Run Ingestion**: After placing the files, run:
   ```bash
   npm run ingest-docs ./documents
   ```

## File Naming Convention

The system automatically extracts the year from filenames containing a 4-digit year (e.g., 2019, 2020, etc.). For best results, ensure your PDF filenames contain the year of the shareholder letter.

## Supported Formats

- **PDF files only**: The system is designed to process PDF documents
- **Text extraction**: Uses PDF parsing to extract text content
- **Automatic chunking**: Divides documents into optimal chunks for vector search

## Processing Details

When you run the ingestion script, it will:

1. **Initialize Pinecone**: Set up the vector database index
2. **Parse PDFs**: Extract text from all PDF files in this directory
3. **Create Chunks**: Split documents into searchable chunks (1500 characters with 200 character overlap)
4. **Generate Embeddings**: Create vector embeddings using OpenAI's text-embedding-ada-002
5. **Store Vectors**: Save embeddings to Pinecone with metadata
6. **Validate Setup**: Test the system with a sample query

## Troubleshooting

**No PDF files found**: Ensure PDF files are directly in this directory, not in subdirectories.

**Permission errors**: Make sure you have read access to the PDF files.

**API errors**: Verify your OpenAI and Pinecone API keys are correctly set in the `.env` file.

**Large files**: Very large PDF files may take longer to process. The system will show progress updates.

## Next Steps

After successful ingestion:
1. Start the development server: `npm run dev`
2. Open the playground at `http://localhost:4111`
3. Test queries about Warren Buffett and Berkshire Hathaway
4. Use the RAG agent for intelligent question-answering