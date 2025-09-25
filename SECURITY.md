# 🔐 Security Guide - API Key Management

## ⚠️ CRITICAL: Protecting Your API Keys

Your API keys are like passwords - they should NEVER be committed to GitHub or shared publicly.

## ✅ What's Already Protected

Your `.gitignore` files are configured to prevent committing:
- `.env` files (contains real API keys)
- `.env.local` files
- Database files
- Build artifacts
- Node modules

## 🔧 Environment Setup Guide

### Backend Setup (pazego-rag)
1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit .env file** with your real API keys:
   ```bash
   OPENAI_API_KEY=your_actual_openai_key
   PINECONE_API_KEY=your_actual_pinecone_key
   PINECONE_INDEX_NAME=berkshire-hathaway-rag
   ```

### Frontend Setup (berkshire-frontend)
1. **For local development**:
   ```bash
   cp .env.example .env.local
   ```
   
2. **For production deployment**, update `.env.production`:
   ```bash
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

## 🚨 If You Accidentally Commit API Keys

If you ever accidentally commit real API keys to GitHub:

1. **Immediately regenerate your API keys**:
   - OpenAI: Go to platform.openai.com → API Keys → Create new key
   - Pinecone: Go to app.pinecone.io → API Keys → Create new key

2. **Remove the commit** (if not yet pushed):
   ```bash
   git reset --soft HEAD~1
   git reset HEAD .env
   ```

3. **If already pushed to GitHub**:
   ```bash
   # Remove from history (USE WITH CAUTION)
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch .env" \
   --prune-empty --tag-name-filter cat -- --all
   
   git push --force --all
   ```

## 🛡️ Deployment Security

### For Vercel (Frontend)
- Add environment variables in Vercel dashboard
- Never put API keys in frontend code
- Use `REACT_APP_` prefix for public variables only

### For Railway (Backend)  
- Add environment variables in Railway dashboard
- Use Railway's secret management
- Never hardcode keys in source code

### For Docker
- Use Docker secrets or environment variables
- Never build keys into the image
- Use `.dockerignore` to exclude `.env` files

## 📋 Security Checklist

Before deploying:
- [ ] Real `.env` files are in `.gitignore`
- [ ] Example files (`.env.example`) are committed
- [ ] No API keys in source code
- [ ] Environment variables configured in deployment platform
- [ ] API keys are fresh (not shared or exposed)

## 🔍 Quick Security Check

Run this command to check for potential API key leaks:
```bash
# Check for potential API key patterns
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "pcsk_" . --exclude-dir=node_modules --exclude-dir=.git
```

If these commands return results in committed files, you may have a security issue.

## 💡 Best Practices

1. **Use different API keys for development and production**
2. **Rotate API keys regularly**
3. **Set up API key usage alerts**
4. **Use environment-specific configuration**
5. **Never share `.env` files via email, chat, or other channels**

## 📞 Need Help?

If you suspect your API keys have been compromised:
1. Immediately regenerate all API keys
2. Check your OpenAI and Pinecone usage for suspicious activity
3. Update all deployment environments with new keys
4. Consider enabling additional security features (IP restrictions, etc.)

Remember: **When in doubt, regenerate your API keys. It's better to be safe than sorry!**