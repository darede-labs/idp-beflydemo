FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev
COPY src ./src
EXPOSE 3000
USER node
CMD ["npm", "start"]
