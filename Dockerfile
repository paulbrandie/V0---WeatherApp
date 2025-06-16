# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json ./

# Install dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy ALL source code (including components/ui)
COPY . .

# Verify components exist before build
RUN ls -la components/ && ls -la components/ui/ || echo "Components check"

# Build the application
RUN npm run build

# Expose port 3023
EXPOSE 3023

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Set port environment variable
ENV PORT=3023

# Start the application
CMD ["npm", "start"]
