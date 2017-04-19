FROM node:5.10.1

#Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
COPY index.js /usr/src/app/
COPY settings.json /usr/src/app/
COPY triage.js /usr/src/app/
RUN npm install

CMD [ "npm", "start" ]
