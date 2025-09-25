# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine

# Create user first (before copying files)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mastra -u 1001 -G nodejs

# Set working directory and change ownership
WORKDIR /app
RUN chown mastra:nodejs /app

# Switch to non-root user EARLY
USER mastra

# Copy package files as non-root user
COPY --chown=mastra:nodejs package*.json .npmrc ./

# Install dependencies (this takes the most time)
RUN npm install --legacy-peer-deps

# Copy source code as non-root user
COPY --chown=mastra:nodejs . .

# Build the application
RUN npm run build

# Clean up to reduce image size (optional, but faster without)
# RUN npm prune --omit=dev --legacy-peer-deps && npm cache clean --force

# Expose port
EXPOSE 4111

# Start the application
CMD ["npm", "start"]