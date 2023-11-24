FROM node:20

WORKDIR /frontend

COPY . .

RUN npm install && npm run build && npm install -g serve

ENTRYPOINT ["serve", "-s", "dist"]
