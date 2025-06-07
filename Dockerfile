# Sử dụng Node.js chính thức để tạo môi trường phát triển
FROM harbor.vpa.com.vn/docker.io/library/node:18 as builder

ARG REGISTRY_PROXY

WORKDIR /usr/app

COPY . .

RUN npm config set proxy ${REGISTRY_PROXY}

RUN yarn && yarn build

FROM harbor.vpa.com.vn/docker.io/nginxinc/nginx-unprivileged:1.25.4 AS runner

WORKDIR /usr/share/nginx

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /usr/app/build/ /usr/share/nginx/html/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
