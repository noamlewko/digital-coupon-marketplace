FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_API_BASE=http://localhost:3000
ARG VITE_ADMIN_TOKEN=admin-demo-token
ARG VITE_RESELLER_TOKEN=reseller-demo-token

ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_ADMIN_TOKEN=$VITE_ADMIN_TOKEN
ENV VITE_RESELLER_TOKEN=$VITE_RESELLER_TOKEN

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]