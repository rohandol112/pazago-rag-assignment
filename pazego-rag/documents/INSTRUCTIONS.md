# 📄 Berkshire Hathaway PDF Documents

## 🎯 Instructions:

1. **Download Berkshire Hathaway shareholder letters** from:
   - Official site: https://www.berkshirehathaway.com/letters/letters.html
   - Years 2019-2024 recommended

2. **Name your PDF files** with the year for automatic processing:
   - `2024-berkshire-letter.pdf`
   - `2023-berkshire-letter.pdf` 
   - `2022-berkshire-letter.pdf`
   - etc.

3. **Place PDF files** in this folder

4. **Run the processing script**:
   ```bash
   node setup-pdfs.js
   ```

## 📚 Recommended PDFs:

- **2024 Letter**: Latest investment insights
- **2023 Letter**: Post-pandemic market views  
- **2022 Letter**: Inflation and market volatility
- **2021 Letter**: Economic recovery perspectives
- **2020 Letter**: Pandemic impact analysis
- **2019 Letter**: Long-term investment principles

## 🔄 Processing Flow:

1. **PDF Loading**: Extracts text from each PDF
2. **Text Chunking**: Splits into manageable pieces (1000 chars)
3. **Embedding Generation**: Creates vectors using OpenAI API
4. **Pinecone Storage**: Stores embeddings for semantic search
5. **RAG Integration**: Available for question answering

## ✅ After Processing:

Your RAG system will be able to answer questions like:
- "What did Buffett say about inflation in 2022?"
- "How did the pandemic affect Berkshire's investments?"
- "What are Buffett's thoughts on cryptocurrency?"

**The more PDFs you add, the richer your knowledge base becomes!**