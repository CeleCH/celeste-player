FROM node:18-alpine

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy backend source files
COPY src/ ./src/

# Default environment configurations for production
ENV PORT=3001
ENV NODE_ENV=production

# Expose backend port
EXPOSE 3001

# Boot server
CMD ["node", "src/server.js"]
