FROM node:20

WORKDIR /backend

COPY . .

RUN npm install && npm run build
# && npx prisma db push

ENTRYPOINT ["npm", "run", "start"]
