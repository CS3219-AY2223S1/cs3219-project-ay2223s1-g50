# Collaboration Service

## Setup for development

- Install all deps

```sh
yarn
```

- Starting dev server

```sh
yarn dev
```

- Swagger documentation endpoint `localhost:8000/docs/` for swagger ui with playground

## Run with Docker

- Docker compose consists of one container
  1. Container for node project

```bash
# build docker image
docker build . -t <your_docker_username>/<service-name>

# run docker compose in background
# to run in foreground, remove -d flag
docker-compose up -d

# stop docker image, doesn't kill or remove containers
# can be restarted with docker-compose start
docker-compose stop

# stops, kills and delete docker containers, networks, volumes and images created by up
docker-compose down
```

## Setup for production

- Output build to `./build` directory

```sh
yarn build
```

- Run `index.js` from `./build/src/index.js`

```sh
yarn start
```
