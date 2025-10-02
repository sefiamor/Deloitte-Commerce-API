FROM node:16-bullseye-slim

ENV DELOITTE_COMMERCE_API_PORT=3333
ENV DELOITTE_COMMERCE_API_SECRET_KEY=Deloitte-Pass
ENV MONGODB_HOST=mongo-db
ENV MONGODB_PORT=27017
ENV MONGODB_DATABASE=deloitte
ENV MONGODB_USERNAME=deloitte-commerce-api
ENV MONGODB_PASSWORD=Deloitte-Pass

ENV NODE_ENV=production

WORKDIR /app
RUN npm install -g npm@8

COPY . /app
RUN npm install

CMD ["node", "index.js"]