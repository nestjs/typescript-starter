FROM node:10.13.0-alpine
# Env
ENV TIME_ZONE=Asia/Hong_Kong
ENV ENV_NAME dev
ENV EGG_SERVER_ENV dev
ENV NODE_ENV dev
ENV NODE_CONFIG_ENV dev


WORKDIR /usr/src/app
COPY package.json .

RUN npm install
ADD . /usr/src/app

EXPOSE 3000
CMD [ "npm", "run", "start" ]