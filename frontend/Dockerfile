FROM node:20-alpine AS builder

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_SERVICE_ROLE_KEY
ARG VITE_API_URL

RUN npm run build

FROM nginx:alpine

EXPOSE 80

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /frontend/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]