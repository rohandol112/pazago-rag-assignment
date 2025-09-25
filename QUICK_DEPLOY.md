# Quick Deployment Guide

## Fastest Option: Vercel + Render (5-10 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

### Step 2: Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select `berkshire-frontend` folder
5. Click "Deploy"
6. Done! Your frontend is live.

### Step 3: Deploy Backend (Render) - **RECOMMENDED**
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Root Directory: pazego-rag
   Build Command: npm install
   Start Command: npm run dev
   ```
5. Add environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX_NAME=your_pinecone_index
   PORT=4111
   NODE_ENV=production
   ```
6. Click "Create Web Service"

### Alternative: Deploy Backend (Railway)
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose `pazego-rag` as root directory
5. Add the same environment variables
6. Deploy!

### Step 4: Connect Frontend to Backend
1. Copy your Render backend URL (e.g., `https://yourapp.onrender.com`)
2. In Vercel dashboard, go to your project settings
3. Add environment variable:
   ```
   REACT_APP_API_URL=https://yourapp.onrender.com
   ```
4. Redeploy frontend

## Alternative: One-Click Deploy Buttons

### Deploy Backend to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/rohandol112/pazago-rag-assignment)

### Deploy Frontend to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/rohandol112/pazago-rag-assignment)

### Alternative: Deploy to Railway
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/rohandol112/pazago-rag-assignment)

## Manual Deployment Checklist

- [ ] Backend deployed and running
- [ ] Environment variables configured
- [ ] Frontend built for production
- [ ] Frontend API URL updated to backend
- [ ] CORS configured for production domain
- [ ] HTTPS enabled
- [ ] Domain configured (optional)

## Cost Estimate
- **Vercel**: Free tier (Hobby plan)
- **Render**: Free tier 750hrs/month ($7/month for paid starter plan)
- **Railway**: Free tier ($5/month after free credits)
- **Total**: $0-7/month for small to medium usage

**Render is recommended** for its simplicity and generous free tier.

## Support
If you encounter issues:
1. Check environment variables are set correctly
2. Verify API keys are valid
3. Ensure Pinecone index exists and has data
4. Check CORS settings for production domains

Your Berkshire Intelligence app will be live and accessible worldwide!