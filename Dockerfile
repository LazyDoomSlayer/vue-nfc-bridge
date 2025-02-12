FROM node:18-alpine AS base
WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm turbo run build-only --filter=nfc-handler...
RUN pnpm turbo run build-only --filter=nfc-reader...

FROM nginx:alpine AS nfc-handler
COPY --from=base /app/apps/nfc-handler/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

FROM nginx:alpine AS nfc-reader
COPY --from=base /app/apps/nfc-reader/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
