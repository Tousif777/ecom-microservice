FROM node:18-alpine

# Install OpenSSL for potential SSL connections
RUN apk add --no-cache openssl libssl3

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
