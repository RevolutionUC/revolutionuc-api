# RevolutionUC API

## Description

New API for RevolutionUC written in TypeScript and [Nest](https://docs.nestjs.com/)

## Installation

```bash
$ npm install
```

## Environment Variables

You can either set these manually or by creating a `.env` file in the root directory.

```bash
PRODUCTION=false # used for many checks such as supressing certain logging and most importantly if the database should synchronize (see "Database")
API_KEY=testapikey  # protects routes that use the AdminGuard, to access these routes the `X-API-KEY` header must match this value
DATABASE_URL=postgresql://postgres:password@localhost:5432/revuc  # URL used to connect to database, this variable is automatically set when using Heroku
MAILGUN_API_KEY=test
CRYPTO_KEY=testcryptokey # used to encrypt certain data on the server
WAITLIST_ENABLED=true
```

## Database

You must have a database running and the `DATABASE_URL` environment variable set. If `PRODUCTION == false` then whenever the application is ran the database is initialized with the the correct tables and columns.

> Note: This will wipe and recreate the database schema on every run, make sure to set `PRODUCTION` to true if you don't want data to be permanently erased

See the wonderful [TypeORM documentation](http://typeorm.io/) to learn more how to interact with the database from the application and creating schemas.

### Migrations

When you are in production mode and you need to make a change to the database, you must create a database migration. Thankfully, TypeORM does most of the heavy lifting for you. First, make sure you install TypeORM globally by running `npm install typeorm -g`. Now, we must create a `.ormconfig` file to tell TypeORM how to connect to our production database, see the end of this section for an example of that file.

Now, make the required changes to the schema and run the following command to generate the migration `typeorm migration:generate -n PostRefactoring` (the -n argument is just for reference). TypeORM will generate the migration and place it in the `migration` folder, check the file to make sure all expected actions are done. The TypeORM CLI cannot compile Typescript so you must compile it yourself before running the migration by running `npm run prestart:prod`. Finally, tell TypeORM to run all pending migrations by running `typeorm migration:run`.

For more information look at the [TypeORM documentation](http://typeorm.io/#/migrations)

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
npm run start:prod
```

## Documentation

Swagger docs are automatically generated. You can find them at /docs
