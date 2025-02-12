FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm turbo run build-only

FROM nginx:alpine AS server

COPY ~/certs/public.crt /etc/ssl/certs/public.crt
COPY ~/certs/private.key /etc/ssl/private/private.key

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /app/apps/nfc-handler/dist /usr/share/nginx/html/nfc-handler
COPY --from=builder /app/apps/nfc-reader/dist /usr/share/nginx/html/nfc-reader

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
