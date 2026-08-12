FROM node:18-slim

# Install system dependencies (Python3, curl, and ffmpeg are required by yt-dlp)
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    curl \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Download and install the latest yt-dlp binary globally
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Create work directory
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
ENV YTDLP_PATH=yt-dlp

# Expose backend port
EXPOSE 3001

# Boot server
CMD ["node", "src/server.js"]
