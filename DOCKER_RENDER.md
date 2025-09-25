# 🐳 Deploy Backend with Docker on Render

Docker deployment on Render gives you more control and often better performance than the native Node.js runtime. Here's how to deploy your Berkshire Intelligence backend using Docker.

## 🌟 Benefits of Docker on Render

- **Consistent Environment**: Same environment locally and in production
- **Better Performance**: Optimized container with exact dependencies
- **More Control**: Full control over the runtime environment
- **Security**: Non-root user execution
- **Faster Builds**: Cached layers speed up deployments

## 📋 Prerequisites

- [x] Docker files created (✅ Done!)
- [x] Code pushed to GitHub 
- [ ] Render account
- [ ] Your API keys ready

## 🚀 Docker Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize repository access

### Step 2: Deploy with Docker
1. **Click "New +"** → **"Web Service"**

2. **Connect Repository:**
   - Search for: `pazago-rag-assignment`
   - Click "Connect"

3. **Configure Docker Service:**
   ```
   Name: berkshire-intelligence-api
   Region: Oregon (US West) or closest
   Branch: master
   Root Directory: pazego-rag
   Environment: Docker
   Dockerfile Path: ./Dockerfile (auto-detected)
   ```

4. **Docker Build Settings:**
   - Render automatically detects your Dockerfile
   - Build context: `/pazego-rag`
   - No additional build commands needed

5. **Select Plan:**
   - Choose "Free" (0$/month)
   - 512 MB RAM, 0.1 CPU, 750 hours/month

### Step 3: Environment Variables
Add these in Render dashboard:

```bash
NODE_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=berkshire-hathaway-rag
PINECONE_ENVIRONMENT=us-east-1-aws
```

**Note**: Render automatically sets the `PORT` environment variable

### Step 4: Deploy!
1. Click "Create Web Service"
2. Render will:
   - Build your Docker image
   - Install dependencies
   - Create optimized container
   - Deploy and provide URL

## 🔧 Docker Configuration Files

### Dockerfile (Optimized)
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Remove dev dependencies
RUN npm ci --only=production && npm cache clean --force

# Security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mastra -u 1001
RUN chown -R mastra:nodejs /app
USER mastra

# Expose port
EXPOSE $PORT

# Start application
CMD ["npm", "run", "start"]
```

### .dockerignore (Security & Performance)
- Excludes `.env` files (security)
- Excludes `node_modules` (installed in container)
- Excludes documentation and test files
- Reduces build context size

## 🎯 Advantages vs Native Node.js Runtime

| Feature | Docker | Native Node.js |
|---------|--------|---------------|
| **Build Speed** | Faster (cached layers) | Slower |
| **Environment Control** | Full control | Limited |
| **Security** | Non-root user | Default user |
| **Dependencies** | Exact versions | Platform dependent |
| **Debugging** | Container logs | Service logs |
| **Customization** | Full customization | Limited |

## 🔍 Testing Your Docker Deployment

### Local Testing (Optional)
Test your Docker setup locally before deploying:

```bash
# Build the image
cd pazego-rag
docker build -t berkshire-api .

# Run locally
docker run -p 4111:4111 \
  -e OPENAI_API_KEY=your_key \
  -e PINECONE_API_KEY=your_key \
  -e PINECONE_INDEX_NAME=berkshire-hathaway-rag \
  -e PORT=4111 \
  berkshire-api

# Test the API
curl http://localhost:4111/api/agents/ragAgent/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is value investing?"}]}'
```

### Production Testing
Once deployed on Render:

```bash
# Test health endpoint
curl https://your-app.onrender.com/

# Test RAG API
curl https://your-app.onrender.com/api/agents/ragAgent/generate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What is Warren Buffett'\''s investment philosophy?"}]}'
```

## 📊 Monitoring Docker Container

### Render Dashboard
- **Logs**: Real-time container logs
- **Metrics**: CPU, memory, network usage
- **Events**: Deployment and restart events
- **Shell Access**: Connect to running container (paid plans)

### Container Logs
Your application logs will appear in Render's log viewer:
```bash
# Your console.log statements appear here
# Mastra framework logs
# Container startup logs
# Error logs and stack traces
```

## 🚨 Troubleshooting Docker Deployment

### Build Fails
**Issue**: Docker build fails
**Solution**:
- Check Dockerfile syntax
- Verify package.json scripts exist
- Check .dockerignore isn't excluding necessary files
- Review build logs in Render dashboard

### Container Won't Start
**Issue**: Container exits immediately
**Solution**:
- Check `npm run start` command works
- Verify PORT environment variable usage
- Check for missing environment variables
- Review container logs for error details

### Memory Issues
**Issue**: Container killed due to memory
**Solution**:
- Free tier has 512MB limit
- Optimize dependencies (remove unused packages)
- Use `npm ci --only=production`
- Consider upgrading to paid plan

### Port Binding Issues
**Issue**: Service not accessible
**Solution**:
- Ensure app listens on `process.env.PORT`
- Don't hardcode port 4111 in production
- Check EXPOSE instruction in Dockerfile

## 🔧 Docker Optimizations

### Multi-stage Build (Advanced)
For even smaller images:

```dockerfile
# Build stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine as production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
USER node
EXPOSE $PORT
CMD ["npm", "run", "start"]
```

### Health Check
Add health check to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1
```

## 💰 Cost Comparison

### Free Tier Limits (Same for Docker & Native)
- **750 hours/month** (24/7 operation possible)
- **512 MB RAM**
- **0.1 CPU**
- **100 GB bandwidth**
- **Automatic sleep** after 15 minutes inactivity

### When to Upgrade
Upgrade to paid plan ($7/month starter) if you need:
- No sleep (always-on service)
- More memory (1 GB RAM)
- Better performance (0.5 CPU)
- Custom domains
- Faster builds

## 🎯 Production Checklist

Before going live with Docker:
- [ ] Dockerfile optimized (non-root user, minimal image)
- [ ] .dockerignore configured (excludes sensitive files)  
- [ ] Environment variables set in Render
- [ ] Local Docker testing completed
- [ ] Frontend updated with new backend URL
- [ ] Health checks configured
- [ ] Logging configured for debugging

## 🆚 Docker vs Node.js Runtime Decision

**Choose Docker if:**
- You want maximum control
- You need specific system dependencies  
- You want consistent local/production environments
- You plan to use other deployment platforms later

**Choose Native Node.js if:**
- You want simplest setup
- You don't need custom system configuration
- You prefer platform-managed runtime

**Recommendation**: Use Docker - it's more professional and flexible! 🐳

Your Berkshire Intelligence backend will be running in an optimized, secure Docker container within minutes! 🚀