# CS3219-AY22-23-Project-Skeleton

This is a template repository for CS3219 project.

## Installing dependencies

```bash
# from project root
npm run installAll
```

## Running all services and frontend

```bash
# from project root
npm run dev
```

## Running all services in Docker

```bash
# from project root
docker-compose up --build
```

## User and Question Service
1. Rename `.env.sample` file to `.env`.
2. Create a Cloud DB URL using Mongo Atlas.
3. Enter the DB URL created as `DB_CLOUD_URI` in `.env` file.
4. Install npm packages using `npm i`.
5. Run User Service using `npm run dev`.

## Collaboration, Chat and Matching Service
1. Copy `.env.sample` and rename it to `.env`
2. Install packages with yarn, `yarn`
3. Start services with `yarn dev`

## Frontend
1. Install npm packages using `npm i`.
2. Run Frontend using `npm start`.
