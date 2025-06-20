FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libssl3

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
