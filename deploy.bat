@echo off
REM Deployment script for Berkshire Intelligence (Windows)

echo Berkshire Intelligence Deployment Script
echo ========================================

echo Choose deployment option:
echo 1. Vercel + Railway (Recommended)
echo 2. Docker containers  
echo 3. Prepare for manual deployment
echo 4. Exit

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto vercel_railway
if "%choice%"=="2" goto docker_build
if "%choice%"=="3" goto manual_prep
if "%choice%"=="4" goto exit
goto invalid

:vercel_railway
echo Deploying to Vercel + Railway...

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    npm install -g vercel
)

REM Deploy frontend to Vercel
echo Deploying frontend to Vercel...
cd berkshire-frontend
vercel --prod
cd ..

echo Frontend deployed! Now deploy backend to Railway:
echo 1. Go to railway.app
echo 2. Connect your GitHub repository  
echo 3. Select the pazego-rag folder
echo 4. Add these environment variables:
echo    - OPENAI_API_KEY
echo    - PINECONE_API_KEY
echo    - PINECONE_INDEX_NAME
echo    - PORT=4111
echo 5. Update .env.production with your Railway backend URL
goto end

:docker_build
echo Building Docker images...

REM Build backend
cd pazego-rag
docker build -t berkshire-backend .
cd ..

REM Build frontend
cd berkshire-frontend
docker build -t berkshire-frontend .
cd ..

echo Docker images built successfully!
echo Run with: docker run -p 4111:4111 berkshire-backend
echo           docker run -p 3000:80 berkshire-frontend
goto end

:manual_prep
echo Preparing for manual deployment...

REM Build frontend
cd berkshire-frontend
npm run build
cd ..

REM Build backend  
cd pazego-rag
npm run build
cd ..

echo Manual deployment files ready!
echo Frontend build: berkshire-frontend\build\
echo Backend built files ready for deployment
goto end

:invalid
echo Invalid choice
goto end

:exit
echo Exiting...
goto end

:end
pause