# 兩段式：先用 node 跑 build 合成 dist/，再用 nginx 端出靜態檔。
# Northflank 用這個 Dockerfile 建服務，對外 port 8080。
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json build.js ./
COPY src ./src
COPY audio ./audio
COPY img ./img
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
