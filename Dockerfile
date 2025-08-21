# Multi-stage build: build Angular app, then serve with Nginx

# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci || npm install

# Copy the rest and build
COPY . ./
RUN npm run build

# 2) Runtime stage
FROM nginx:1.27-alpine AS runtime

# Copy SPA-friendly Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from Angular build
COPY --from=builder /app/dist/notety /usr/share/nginx/html

# Install openssl to optionally generate a self-signed cert when none is mounted
RUN apk add --no-cache openssl

# Provide an entrypoint that ensures certs exist (DEV fallback) and starts Nginx
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80 443

CMD ["/entrypoint.sh"]
