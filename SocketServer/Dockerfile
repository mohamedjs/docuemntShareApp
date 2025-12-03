FROM node:20-alpine
WORKDIR /var/www/html/SocketServer

# Copy package files
COPY package*.json ./
RUN npm i

# Copy application code
COPY . .

EXPOSE 6002
CMD ["node", "server.js"]
