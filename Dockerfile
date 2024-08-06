FROM node:20-alpine

WORKDIR /app

COPY app /app/app/
COPY config /app/config/
COPY lib /app/lib/
COPY public /app/public/
COPY *.js /app/
COPY *.json /app/

VOLUME [ "/app/data" ]

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm install -g bower
RUN npm install && \
    cd public && \
    bower install --allow-root && \
    cd .. && \
    npm run build && \
    mkdir -p /var/log/anchr

ENTRYPOINT ["npm", "run", "production"]


