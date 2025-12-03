# Build stage
FROM node:20
WORKDIR /var/www/html/documentSPA
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 4001
CMD ["npm", "run", "dev"]
