# Full-Stack Dockerfile (Frontend + Backend + yt-dlp) for Free Render.com Hosting
FROM node:20-bookworm-slim

# Install python3, curl, ca-certificates, and latest yt-dlp binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    curl \
    ca-certificates \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Build React Frontend
COPY frontend/package*.json ./frontend/
RUN npm install --prefix frontend
COPY frontend/ ./frontend/
RUN npm run build --prefix frontend

# 2. Install Express Backend
COPY backend/package*.json ./backend/
RUN npm install --omit=dev --prefix backend
COPY backend/ ./backend/

WORKDIR /app/backend
ENV PORT=5000
EXPOSE 5000

CMD ["node", "server.js"]

