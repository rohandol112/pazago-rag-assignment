FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies for smaller image
RUN npm ci --only=production && npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mastra -u 1001

# Change ownership of the app directory
RUN chown -R mastra:nodejs /app
USER mastra

# Expose port (Render will use PORT environment variable)
EXPOSE $PORT

# Start the application
CMD ["npm", "run", "start"]