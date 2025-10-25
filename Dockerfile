# Multi-stage Dockerfile for Node.js application with Alpine Linux

# Stage 1: Base image with common dependencies
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling and other necessary packages
RUN apk add --no-cache \
  dumb-init \
  && addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files for dependency resolution
COPY package*.json ./

# Stage 2: Dependencies stage
FROM base AS dependencies

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev && npm cache clean --force

# Stage 3: Build stage
FROM dependencies AS builder

# Copy source code and configuration files
COPY tsconfig.json ./
COPY src/ ./src/
COPY prisma/ ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 4: Production dependencies stage
FROM base AS production-deps

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 5: Production stage
FROM base AS production

# Copy production dependencies
COPY --from=production-deps /app/node_modules ./node_modules

# Copy built application and Prisma artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Copy package.json for runtime (needed for some modules)
COPY package*.json ./

# Change ownership of the app directory to nodejs user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check (assuming you have a health endpoint)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/entry-point.js"]