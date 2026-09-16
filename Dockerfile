# Build static pages
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve the same-origin API and production build
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server.mjs ./server.mjs
COPY config ./config
RUN mkdir -p /app/data/uploads && chown -R node:node /app
USER node
EXPOSE 8787
VOLUME ["/app/data"]
CMD ["npm", "start"]
