# App Architecture

## Overview:

```sh
~/ ❯ tree -L 1
├── Dockerfile # contains docker settings
├── build # contains build files after running build
├── docker-compose.yml # contains docker-compose stuff
├── nodemon.json # nodemon settings
├── package.json # package.json settings
├── src # all src files
├── test # just for show... jk
├── tsconfig.json # ts compiler settings
├── tsoa.json # tsoa settings
└── yarn.lock # allows next person to have same deps
```

```sh
~/src ❯ tree -L 1
.
├── app.ts # contains all middleware and application dependencies
├── index.ts # starts database and server
├── middleware # contains middleware
├── mongo # contains all mongo models
├── routes # contains all routes
└── utils # contains all util methods
```

## Adding a new route

- Each route directory inside `~/src/routes` contains at least three files
  - `name.model.ts`
    - contains models used by the endpoint
  - `name.controller.ts`
    - contains controller pointing to necessary services
      and declaration of request and response types
  - `name.service.ts`
    - contains service which runs the file
  - `name.provider.ts` (optional)
    - contains interface to which service should adhere to in order to, in the case service
      can have multiple implementations
    - i.e. provider used in authentication since auth can have multiple vendors
- Each directory should match up to the name of the route

## Adding a new Mongo model

- Add the Mongoose model inside of `~/src/mongo`
- For more complex models, create a separate directory with the structure below:
- Name all models in **plural** form

```sh
mongo
└── your_new_models
    ├── index.ts
    └── your_new_models.model.ts
```

- Add model to `~/src/mongo/index.ts`

```ts
// ~/src/mongo/index.ts
// ...
export const models = {
  your_new_models,
}
```

## Glossary

`~`: Refers to project root
