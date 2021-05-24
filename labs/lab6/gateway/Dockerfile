FROM node:14

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --quiet

COPY . .

EXPOSE 3001

CMD ["node" , "app.js"]