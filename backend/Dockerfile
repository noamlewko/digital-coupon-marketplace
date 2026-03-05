FROM node:20-alpine

WORKDIR /app

# Install deps (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]