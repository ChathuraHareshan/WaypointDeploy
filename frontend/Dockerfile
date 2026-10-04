FROM node:20 AS b

WORKDIR /a

COPY . .

RUN npm i && npm run build


FROM nginx:alpine

COPY --from=b /a/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf