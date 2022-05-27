# Pull node.js image
FROM node:12-alpine as build
WORKDIR /
# Install npm packages and cache this layer
COPY package*.json /
RUN npm install
# Build copy all source files and build React app
COPY ./src /src

COPY ./public /public
RUN echo $(ls -alF /src/Pages/)
RUN npm run build

# Pull NGINX image
FROM nginx:1.15
# Move all build files to NGINX serve folder
COPY --from=build /build /usr/share/nginx/html
# Setup NGINX with config
COPY --from=build /build /var/www
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
