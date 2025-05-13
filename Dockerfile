# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy build output from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/src/modules/mailer/templates ./dist/modules/mailer/templates
COPY --from=build /usr/src/app/src/modules/pdf/templates ./dist/modules/pdf/templates
COPY --from=build /usr/src/app/src/modules/i18n/translations ./dist/modules/i18n/translations

# Copy start script and make it executable
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Set user to node for security
USER node

# Run application with start script
CMD ["./start.sh"]