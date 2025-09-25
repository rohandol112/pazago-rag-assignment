#!/bin/bash

# Deployment script for Berkshire Intelligence
# This script helps deploy to various platforms

echo "Berkshire Intelligence Deployment Script"
echo "========================================"

# Function to deploy to Vercel + Railway
deploy_vercel_railway() {
    echo "Deploying to Vercel + Railway..."
    
    # Check if required tools are installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy frontend to Vercel
    echo "Deploying frontend to Vercel..."
    cd berkshire-frontend
    vercel --prod
    cd ..
    
    echo "Frontend deployed! Now deploy backend to Railway:"
    echo "1. Go to railway.app"
    echo "2. Connect your GitHub repository"
    echo "3. Select the pazego-rag folder"
    echo "4. Add these environment variables:"
    echo "   - OPENAI_API_KEY"
    echo "   - PINECONE_API_KEY"
    echo "   - PINECONE_INDEX_NAME"
    echo "   - PORT=4111"
    echo "5. Update .env.production with your Railway backend URL"
}

# Function to build for Docker
build_docker() {
    echo "Building Docker images..."
    
    # Build backend
    cd pazego-rag
    docker build -t berkshire-backend .
    cd ..
    
    # Build frontend
    cd berkshire-frontend
    docker build -t berkshire-frontend .
    cd ..
    
    echo "Docker images built successfully!"
    echo "Run with: docker run -p 4111:4111 berkshire-backend"
    echo "          docker run -p 3000:80 berkshire-frontend"
}

# Function to prepare for manual deployment
prepare_manual() {
    echo "Preparing for manual deployment..."
    
    # Build frontend
    cd berkshire-frontend
    npm run build
    cd ..
    
    # Build backend
    cd pazego-rag
    npm run build
    cd ..
    
    echo "Manual deployment files ready!"
    echo "Frontend build: berkshire-frontend/build/"
    echo "Backend built files ready for deployment"
}

# Main menu
echo "Choose deployment option:"
echo "1. Vercel + Railway (Recommended)"
echo "2. Docker containers"
echo "3. Prepare for manual deployment"
echo "4. Exit"

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        deploy_vercel_railway
        ;;
    2)
        build_docker
        ;;
    3)
        prepare_manual
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac