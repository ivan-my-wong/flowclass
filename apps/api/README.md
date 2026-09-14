<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description 
This READ ME will walks you through first up-and-running process, setup environment, and start your server locally or deploy it on a remote server
prerequisites: Node 18 or above, yarn, PostgresSQL: latest, Docker
If you have any problem with install PostgreSQL, or connect database, skip section Installation and Running the app
And go to Docker section


## First : 
use cp command in section Installation to copy environment variables from .env.example
to target env file for each build scenario
If you done care about production build or staging build, just simply use: 
```bash
cp .env.example .env
```

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ cp .env.example .env.stage.dev
$ cp .env.example .env.stage.stg
$ cp .env.example .env.stage.prod
```
Note: if you're on Windows replace cp with copy

Run yarn install to get needed npm library
```bash
$ yarn install
```

## Running the app
Before you can run the app on local machine, make sure you already have latest version of PostgresSQL database installed on your machine
And nodejs 18, the database was created with appropriate name, and the database host, database port, database name, user name, password was set into .env file
for most case database host will be: localhost and port is 5432, default user name is postgres and password is postgres. But you are free to set your own value for them
when you install PostgreSQL. After all DB prepare is done, run:

```bash
# development
$ yarn run start

# watch mode (use this if you want enable auto rebuild when code change)
$ yarn run start:dev

# production mode
$ yarn run start:prod
```
If there is no error during the build server will online at localhost:5000


If you struggling with any local environment set up, go to Docker option below
## Docker
Make sure you are have docker installed, Docker Service is running. 
On windows: Look for "Docker Desktop Service" on Services, notice that status is running. 
Or you can open Docker Desktop app to check, if the app can successfully start, you're good to go.

On Linux: use this command to check
```bash 
sudo systemctl status docker
```
if there is no error you'll see the information about docker.service

Run command below to build project's docker image and run docker container
replace env_file_name with your target env file (ex: .env)
(dont for get to prepare your env file at the "First start" step)
```bash
# run development
$ docker compose --env-file <env_file_name> -f docker-compose.dev.yml up --build

```
after docker compose finish running, run migration script to update database to latest version 

```bash
# run migration
$ docker exec -it develop_flowclass_api yarn migration:up
```
After done migration, you are good to go. 
Server will online at localhost:5000
Go to localhost:5000/api to see swagger api page

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## GIT

```bash
# create branch
$ git checkout develop && git pull origin develop && git chekcout -b feature/flow-1

# before commit code format code and rebase with origin develop
$ yarn format
$ git pull --rebase origin develop

# commit and create pullrequest
$ git add ...
$ git commit -m 'message commit'
```
