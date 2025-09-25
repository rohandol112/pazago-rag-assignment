# 🔧 Docker Build Troubleshooting Guide

## Fixed: Dependency Conflict Issue

The error you encountered is a common npm peer dependency conflict between `dotenv` versions in LangChain packages.

### ✅ What We Fixed:

1. **Updated dotenv version** to match peer requirements (`^16.4.5`)
2. **Added .npmrc file** with `legacy-peer-deps=true`
3. **Updated Dockerfile** to use `npm install` instead of `npm ci`
4. **Added package.json overrides** to force dotenv version

### 🔧 Files Modified:

#### 1. `.npmrc`
```
legacy-peer-deps=true
fund=false
audit=false
```

#### 2. `package.json`
```json
{
  "dependencies": {
    "dotenv": "^16.4.5"  // Changed from ^17.2.2
  },
  "overrides": {
    "dotenv": "^16.4.5"  // Forces this version
  }
}
```

#### 3. `Dockerfile`
```dockerfile
# Copy npm config
COPY .npmrc ./

# Use npm install with legacy peer deps
RUN npm install --legacy-peer-deps
```

## 🚀 Testing the Fix

### Local Test:
```bash
cd pazego-rag

# Clean install locally
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Build Docker image
docker build -t berkshire-api .

# Run container
docker run -p 4111:4111 \
  -e OPENAI_API_KEY=your_key \
  -e PINECONE_API_KEY=your_key \
  -e PINECONE_INDEX_NAME=berkshire-hathaway-rag \
  berkshire-api
```

### Deploy to Render:
1. Push changes to GitHub
2. Render will automatically rebuild with fixed Dockerfile
3. Build should complete successfully

## 🐛 Common Docker Issues & Solutions

### Issue 1: Peer Dependency Conflicts
**Error**: `npm error peer dependency conflict`
**Solution**: Use `--legacy-peer-deps` flag

### Issue 2: Package Lock Conflicts  
**Error**: `package-lock.json conflicts`
**Solution**: Use `npm install` instead of `npm ci` in Docker

### Issue 3: Build Cache Issues
**Error**: Cached layers causing problems
**Solution**: 
```bash
# Force rebuild without cache
docker build --no-cache -t berkshire-api .
```

### Issue 4: Permission Errors
**Error**: Permission denied in container
**Solution**: Already fixed with non-root user in Dockerfile

### Issue 5: Port Binding Issues
**Error**: Container can't bind to port
**Solution**: Ensure app uses `process.env.PORT` (Mastra handles this)

## 🎯 Alternative Approaches

### Option 1: Yarn Instead of NPM
If npm continues to have issues:

```dockerfile
# Install Yarn
RUN npm install -g yarn

# Use Yarn for dependencies
RUN yarn install
RUN yarn build
```

### Option 2: Multi-Stage Build
For smaller final image:

```dockerfile
# Build stage
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage  
FROM node:20-alpine
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci --only=production --legacy-peer-deps
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src ./src
USER node
CMD ["npm", "start"]
```

### Option 3: Ignore Peer Dependencies
Last resort (not recommended):

```dockerfile
RUN npm install --force
```

## ✅ Verification Steps

After deployment, verify everything works:

1. **Check Render logs** for successful startup
2. **Test API endpoint**:
   ```bash
   curl https://your-app.onrender.com/api/agents/ragAgent/generate \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Test"}]}'
   ```
3. **Monitor resource usage** in Render dashboard
4. **Test with frontend** by updating API URL

## 🚀 Deploy Now!

With these fixes, your Docker build should work perfectly on Render:

1. **Commit changes**:
   ```bash
   git add .
   git commit -m "Fix Docker dependency conflicts"
   git push origin master
   ```

2. **Deploy on Render**:
   - Go to render.com
   - New Web Service → Docker
   - Connect repository
   - Select pazego-rag folder
   - Add environment variables
   - Deploy!

Your Berkshire Intelligence backend will be running in a secure Docker container! 🎉