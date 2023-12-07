FROM node:20

WORKDIR /backend

COPY . .

RUN npm install && npm run build

ENTRYPOINT ["npm", "run", "start"]
