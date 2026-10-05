# ====================================================================
# EXPORTRACE FRONTEND - MULTI-STAGE DOCKERFILE (NODE 20 + NGINX ALPINE)
# ====================================================================

# Step 1: Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept API Base URL at build time (or default to /api or localhost)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install dependencies (utilizing Docker layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and generate static production bundle
COPY . .
RUN npm run build

# Step 2: Production Nginx stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx welcome assets
RUN rm -rf ./*

# Copy build artifacts from previous stage
COPY --from=build /app/dist ./

# Copy custom Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
