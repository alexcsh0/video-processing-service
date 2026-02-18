FROM node:18

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y ffmpeg
RUN npm install

COPY . .

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 3000

# Run the compiled JavaScript
CMD ["node", "dist/index.js"]