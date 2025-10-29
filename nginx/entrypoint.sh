#!/bin/sh

# envsubst가 아래 변수들을 실제 값으로 채워줍니다.
envsubst '${SERVER_NAME} ${SSL_CERT_PATH} ${SSL_KEY_PATH} ${APP_HOST} ${APP_PORT}' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Nginx를 포그라운드에서 실행
nginx -g 'daemon off;'