# Frontend Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package.json ./

RUN npm install

COPY src ./src
COPY public ./public
COPY tailwind.config.js ./

RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
