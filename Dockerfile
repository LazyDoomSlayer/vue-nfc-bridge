FROM node:18-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

RUN pnpm install --frozen-lockfile

COPY . .

FROM builder AS nfc-handler-build
RUN pnpm turbo run build-only --filter=nfc-handler...

FROM builder AS nfc-reader-build
RUN pnpm turbo run build-only --filter=nfc-reader...

FROM nginx:alpine AS nfc-handler
COPY --from=nfc-handler-build /app/apps/nfc-handler/dist /usr/share/nginx/html
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine AS nfc-reader
COPY --from=nfc-reader-build /app/apps/nfc-reader/dist /usr/share/nginx/html
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
