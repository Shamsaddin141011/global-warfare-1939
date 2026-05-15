FROM node:20-alpine

WORKDIR /app

# Copy workspace manifests first for layer caching
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/
COPY shared/package*.json ./shared/

# Install ALL deps including devDependencies (needed for tsc + vite)
RUN npm install --include=dev

# Copy source
COPY . .

# Build: shared → client → server
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
