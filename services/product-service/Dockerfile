FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libssl3

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .

EXPOSE 3002

# Copy and set up startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
