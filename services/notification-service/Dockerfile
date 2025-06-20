FROM node:18-alpine

# Install OpenSSL for Prisma (if needed by dependencies)
RUN apk add --no-cache openssl libssl3

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3005

CMD ["npm", "start"]
