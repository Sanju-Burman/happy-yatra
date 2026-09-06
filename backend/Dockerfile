# syntax=docker/dockerfile:1
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Security & Optimization
ENV NODE_ENV=production
ENV PORT=9000

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy application source code
COPY . .

# Run container as unprivileged user
USER node

EXPOSE 9000

CMD ["node", "src/server.js"]
