# syntax=docker/dockerfile:1

# Rootless nginx with the built marketing page in it. The workflow runs
# `npm run build:www` first and builds this image from the repository root,
# so www-dist/ exists. .dockerignore keeps the context to deploy/ and www-dist/.
FROM nginxinc/nginx-unprivileged:1.31-alpine

LABEL org.opencontainers.image.source=https://github.com/NederlandseDigitaleDienst/design-system
LABEL org.opencontainers.image.description="Website van het NLDD Designsysteem"
LABEL org.opencontainers.image.licenses=EUPL-1.2

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/security-headers.conf /etc/nginx/security-headers.conf
COPY www-dist/ /usr/share/nginx/html/

EXPOSE 8080
