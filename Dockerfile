FROM node:9.4.0-alpine

MAINTAINER devicehive

LABEL org.label-schema.url="https://devicehive.com" \
      org.label-schema.vendor="DeviceHive" \
      org.label-schema.vcs-url="https://github.com/devicehive/devicehive-plugin-kinesis-node" \
      org.label-schema.name="devicehive-plugin-kinesis-node" \
      org.label-schema.version="development"

ENV WORK_DIR=/usr/src/app/
RUN mkdir -p ${WORK_DIR}

WORKDIR ${WORK_DIR}

COPY . .

RUN apk update \
    && apk add --no-cache --virtual .gyp python make g++ \
    && npm i \
    && npm cache clean --force \
    && apk del .gyp

VOLUME ["/usr/src/app/kinesisConfig"]

CMD ["npm", "start"]