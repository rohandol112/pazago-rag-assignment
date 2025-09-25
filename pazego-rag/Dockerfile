# Optimized Dockerfile for Render deployment
FROM node:20-alpine

WORKDIR /app

# Copy package files and npm config for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy source code with proper ownership
COPY --chown=mastra:nodejs . .

# Build the application
RUN npm run build

# Clean up dev dependencies and npm cache for smaller image
RUN npm prune --production --legacy-peer-deps && \
    npm cache clean --force

# Create non-root user for security best practices
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mastra -u 1001 -G nodejs

# Switch to non-root user
USER mastra

# Expose port for the application (Render will set PORT env var)
EXPOSE 4111

# Start the application
CMD ["npm", "run", "start"]