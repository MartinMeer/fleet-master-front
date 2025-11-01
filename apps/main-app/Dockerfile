# Base stage - shared dependencies
FROM node:20-alpine AS base

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install --legacy-peer-deps

# Development stage
FROM base AS development

# Copy source code
COPY . .

# Expose development port
EXPOSE 3001

# Set environment
ENV NODE_ENV=development

# Run development server with hot reload
CMD ["npm", "run", "dev"]

# Build stage for production
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Add security headers
RUN echo 'server_tokens off;' > /etc/nginx/conf.d/security.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

