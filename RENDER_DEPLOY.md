# 🚀 Deploy to Render - Step by Step Guide

Render is an excellent platform for deploying your Berkshire Intelligence backend. It's free for small projects and easier to set up than many alternatives.

## 🌟 Why Render?

- **Free Tier**: 750 hours/month free (enough for most projects)
- **Auto-Deploy**: Automatically deploys from GitHub
- **Easy Setup**: No complex configuration needed
- **HTTPS**: Automatic SSL certificates
- **Logs**: Built-in logging and monitoring

## 📋 Prerequisites

- [x] Your code pushed to GitHub (✅ Done!)
- [ ] Render account (free at render.com)
- [ ] Your API keys ready (OpenAI & Pinecone)

## 🚀 Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Authorize Render to access your repositories

### Step 2: Deploy Backend
1. **Click "New +"** → **"Web Service"**

2. **Connect Repository:**
   - Search for: `pazago-rag-assignment`
   - Click "Connect"

3. **Configure Service:**
   ```
   Name: berkshire-intelligence-api
   Region: Oregon (US West) or closest to you
   Branch: master
   Root Directory: pazego-rag
   Runtime: Node
   Build Command: npm install
   Start Command: npm run dev
   ```

4. **Select Plan:**
   - Choose "Free" (0$/month)
   - Free tier includes: 512 MB RAM, 0.1 CPU, 750 hours/month

### Step 3: Add Environment Variables
In the Render dashboard, add these environment variables:

```bash
NODE_ENV=production
PORT=4111
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=berkshire-hathaway-rag
PINECONE_ENVIRONMENT=us-east-1-aws
```

### Step 4: Deploy!
1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your application
   - Provide you with a URL

## 🔗 Your Backend URL

After deployment, you'll get a URL like:
```
https://berkshire-intelligence-api.onrender.com
```

## 🌐 Update Frontend

Update your frontend to use the new backend URL:

### Option A: Update Vercel Environment Variable
1. Go to Vercel dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Update `REACT_APP_API_URL` to your Render URL

### Option B: Update .env.production
```bash
# berkshire-frontend/.env.production
REACT_APP_API_URL=https://berkshire-intelligence-api.onrender.com
```

## 🛠️ Render Configuration Files

I've created `render.yaml` in your pazego-rag folder for Infrastructure as Code:

```yaml
version: "1"
services:
  - type: web
    name: berkshire-intelligence-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm run dev
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4111
```

## 🔍 Testing Your Deployment

Once deployed, test your API:

```bash
# Test the health endpoint
curl https://your-app.onrender.com/

# Test the RAG agent
curl -X POST https://your-app.onrender.com/api/agents/ragAgent/generate \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is value investing?"}]}'
```

## 📊 Monitoring & Logs

### View Logs
1. Go to your service in Render dashboard
2. Click "Logs" tab
3. See real-time logs and errors

### Monitor Performance
1. Check "Metrics" tab for:
   - Response times
   - Memory usage
   - CPU usage
   - Request volume

## 🚨 Troubleshooting

### Common Issues & Solutions

**Build Failed:**
- Check Node.js version in package.json
- Verify all dependencies are in package.json
- Check build logs for specific errors

**App Not Starting:**
- Verify start command is correct: `npm run dev`
- Check environment variables are set
- Look at service logs for startup errors

**API Not Responding:**
- Ensure PORT environment variable is set to 4111
- Check if Mastra is binding to the correct port
- Verify CORS settings for your frontend domain

**Database Connection Issues:**
- Verify Pinecone API key and index name
- Check if index exists and has data
- Test API keys in Pinecone console

### Cold Start Warning
Free tier services "sleep" after 15 minutes of inactivity. First request after sleep may take 30-60 seconds to wake up.

## 💰 Cost Breakdown

### Free Tier Limits:
- **Monthly Hours**: 750 hours (enough for 24/7 if you have only this service)
- **Memory**: 512 MB RAM
- **CPU**: 0.1 CPU units
- **Bandwidth**: 100 GB/month
- **Build Time**: 500 minutes/month

### Paid Plans (if you need more):
- **Starter**: $7/month - 1 GB RAM, 0.5 CPU
- **Standard**: $25/month - 2 GB RAM, 1 CPU
- **Pro**: $85/month - 4 GB RAM, 2 CPU

## 🔄 Auto-Deploy Setup

Render automatically deploys when you push to your connected branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Render automatically detects changes
4. Rebuilds and redeploys your service
5. New version is live in 2-3 minutes

## 🎯 Performance Tips

### Optimize for Render Free Tier:
1. **Keep services warm**: Use a service like UptimeRobot to ping your API every 5 minutes
2. **Efficient dependencies**: Only include necessary packages
3. **Environment variables**: Use Render's environment variable system
4. **Logging**: Use console.log for debugging (appears in Render logs)

## 🚀 Production Checklist

Before going live:
- [ ] Environment variables configured
- [ ] API keys are fresh and secure
- [ ] Frontend updated with backend URL
- [ ] CORS configured for your frontend domain
- [ ] Error handling implemented
- [ ] Logging configured for debugging

## 📞 Support

If you need help:
1. **Render Docs**: [render.com/docs](https://render.com/docs)
2. **Community Forum**: [community.render.com](https://community.render.com)
3. **Status Page**: [status.render.com](https://status.render.com)

Your Berkshire Intelligence backend will be live and globally accessible within minutes! 🌎