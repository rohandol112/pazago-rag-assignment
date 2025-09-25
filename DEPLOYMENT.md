# Deployment Guide - Berkshire Intelligence

This guide covers multiple deployment options for your RAG application.

## Option 1: Vercel + Render (Recommended for Simplicity)

### Frontend (React) on Vercel
1. **Prepare the frontend**:
   ```bash
   cd berkshire-frontend
   npm run build
   ```

2. **Deploy to Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in the frontend directory
   - Follow the prompts
   - Set environment variables in Vercel dashboard

3. **Environment Variables for Vercel**:
   - `REACT_APP_API_URL`: Your backend URL (will be Railway URL)

### Backend (Mastra) on Render
1. **Prepare backend for Render**:
   - Create `render.yaml` in pazego-rag directory (✅ Already created)
   - Ensure your start script is correct

2. **Deploy to Render**:
   - Visit render.com
   - Connect your GitHub repository
   - Select the pazego-rag folder as root directory
   - Add environment variables

3. **Environment Variables for Render**:
   ```
   OPENAI_API_KEY=your_openai_key
   PINECONE_API_KEY=your_pinecone_key
   PINECONE_INDEX_NAME=your_index_name
   PORT=4111
   NODE_ENV=production
   ```

### Alternative: Backend on Railway
- Follow the same process using `railway.toml` configuration
- Railway also offers excellent free tier and auto-deploy

## Option 2: DigitalOcean App Platform

### Full Stack Deployment
1. **Create app.yaml**:
   ```yaml
   name: berkshire-intelligence
   services:
   - name: backend
     source_dir: /pazego-rag
     github:
       repo: your-username/your-repo
       branch: main
     run_command: npm run dev
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: OPENAI_API_KEY
       value: your_key
     - key: PINECONE_API_KEY
       value: your_key
   - name: frontend
     source_dir: /berkshire-frontend
     github:
       repo: your-username/your-repo
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
   ```

## Option 3: AWS (Production Ready)

### Backend on AWS Lambda + API Gateway
1. **Install Serverless Framework**:
   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml**:
   ```yaml
   service: berkshire-intelligence-api
   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
   functions:
     api:
       handler: dist/index.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
   ```

### Frontend on AWS S3 + CloudFront
1. **Build and deploy**:
   ```bash
   cd berkshire-frontend
   npm run build
   aws s3 sync build/ s3://your-bucket-name
   ```

## Option 4: Docker + Cloud Run/ECS

### Create Dockerfiles

**Backend Dockerfile** (`pazego-rag/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4111
CMD ["npm", "run", "start"]
```

**Frontend Dockerfile** (`berkshire-frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Google Cloud Run Deployment
```bash
# Backend
cd pazego-rag
gcloud run deploy berkshire-api --source . --platform managed --region us-central1

# Frontend
cd berkshire-frontend
gcloud run deploy berkshire-frontend --source . --platform managed --region us-central1
```

## Option 5: Traditional VPS (DigitalOcean Droplet)

### Server Setup
1. **Create Ubuntu droplet**
2. **Install dependencies**:
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. **Deploy application**:
   ```bash
   # Clone your repo
   git clone your-repo-url
   
   # Install backend dependencies
   cd pazego-rag
   npm install
   npm run build
   
   # Install frontend dependencies
   cd ../berkshire-frontend
   npm install
   npm run build
   ```

4. **Configure Nginx**:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/berkshire-frontend/build;
           try_files $uri /index.html;
       }
       
       # Backend API
       location /api/ {
           proxy_pass http://localhost:4111;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   cd pazego-rag
   pm2 start npm --name "berkshire-api" -- run start
   pm2 startup
   pm2 save
   ```

## Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] Database (Pinecone) accessible from deployment environment
- [ ] API endpoints updated in frontend
- [ ] CORS configured for production domains

### Security Considerations
- [ ] API keys stored securely (not in code)
- [ ] HTTPS enabled
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Environment variables secured

### Performance Optimization
- [ ] Frontend built for production
- [ ] Gzip compression enabled
- [ ] CDN configured (if needed)
- [ ] Database queries optimized
- [ ] Caching strategy implemented

## Recommended Quick Start: Vercel + Render

For the fastest deployment with minimal configuration:

1. **Frontend on Vercel** (5 minutes):
   - Push code to GitHub
   - Import project to Vercel
   - Deploy automatically

2. **Backend on Render** (5 minutes):
   - Connect GitHub repo to Render
   - Select pazego-rag as root directory
   - Add environment variables
   - Deploy with one click

3. **Update API URL**:
   - Get Render backend URL (e.g., https://yourapp.onrender.com)
   - Update frontend to use production API URL

**See detailed guide**: `RENDER_DEPLOY.md`

## Cost Considerations

- **Vercel + Render**: $0-7/month (generous free tiers, Render starts at $7 for paid)
- **Vercel + Railway**: $0-20/month (generous free tiers)
- **DigitalOcean**: $5-10/month (droplet + app platform)
- **AWS**: $10-50/month (depending on usage)
- **Google Cloud**: $10-30/month (Cloud Run is cost-effective)

## Next Steps

Choose your preferred deployment option and follow the specific steps. The Vercel + Railway combination is recommended for getting started quickly with minimal cost and configuration.