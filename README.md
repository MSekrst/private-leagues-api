# Private Leagues API

JSON API for [Private Leagues project](https://github.com/MSekrst/sofascore-academy-2020/tree/master/project), which is part of "SofaScore Frontend Academy 2020".

API can be accessed on `https://private-leagues-api.herokuapp.com`

## Table of contents

API USERS

- [API description](#api-description)
- [API playground](#api-playground)
- [API endpoints](#api-endpoints)

API DEVELOPERS

- [Project startup](#project-startup)
- [Available scripts](#available-scripts)

## API Description

API can only understand JSON requests so `Content-Type` header must be set to `application/json` for all requests with payload.
API will always respond with valid JSON, event when client error ocurred (4\*\* range).

API is secured with [JWT tokens](https://jwt.io/). Tokens secure all routes except user login and registration.

### Authentication

Majority of routes can only be accessed with valid JWT token issued on login. JWT tokens can expire. Token must be set in each request header to allow access. Bearer Authentication is used: token must be set in `Authorization` header, as `Bearer <token>` (`Authorization: Bearer <token>`).

### Authorization

Some resources are APP specific ans should not be available to any app. Those resources are available for requests with `X-App-Key` header set to valid `<app_key>`.
App keys will be distributed to App developers.

## API Playground

Users and developers can use [Postman](https://www.postman.com/downloads/) to preview routes, access payload info and get live response.

### Postman

Project uses Postman teams feature, so make sure that your Postman application is v7 as teams are introduced in that version. Link to project will be provided via Slack.

When you get access to postman via link it will open documentation in browser. This documentation is useful but using postman directly has much more benefits, so feel free to login to open Postman app.

Once you have opened Postman switch to team called `SFA 2020`. Now you should be able to see `Collections` tab. In this tab you will find grouped routes. Feel free to explore routes. Clicking on route will open request in middle portion od Postman. Notice how route is weird as it contains `{{HOST}}`. This is variable and instead of `{{HOST}}` postman will insert URL stored in variable. Variables are mostly bound to `Environment` so you must pick correct environment. Users will pick `Prod` environment, while `Dev` will be useful for API developers.

[Postman Interface image](https://imgur.com/xS2JDV4)

When environment is picked you can send request and receive response.

## Project Startup

This chapter will explain how to setup and run API locally.

Pre requirements:

- [Node.js](https://nodejs.org/en/)
- [NPM](https://nodejs.org/en/) or [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/download-center/community)
- Added custom `.env` file, see `.env.example` file for guidelines

Once all requirements are fulfilled project can be started.

### Steps:

1. `yarn` - install dependencies (or `npm i`)
2. Start `mongod` if not running (make sure to add correct URI to `.env`)
   2.1. `yarn dev-database` will start local mongo instance on port 27017 and store data in project, into `data` directory (create it manually).
3. `yarn watch` - start node server in watch mode -> it will restart on change

## Available scripts

Available scripts can be found in `package.json`.

## API endpoints

Basic list of API endpoints. `<other>` means that any fields provided will be saved.
If response is marked as `-`, that indicates `204` response code (Ok, no content).

**Note**: All routes must be prefixed with `/api`.

| Endpoint       | Method | Body                              | Response          | Token | App-Key |
| -------------- | :----: | --------------------------------- | ----------------- | :---: | :-----: |
| `/login`       |  POST  | `{ username, password }`          | User data & token |  No   |   No    |
| `/register`    |  POST  | `{ username, password, <other> }` | User ID           |  No   |   No    |
| `/check-token` |  POST  | `{ token }`                       | -                 |  No   |   No    |
| `/user/:id`    |  GET   | -                                 | Public user data  |  Yes  |   No    |
| `/user/me`     |  GET   | -                                 | Current user data |  Yes  |   No    |
| `/user/me`     | DELETE | -                                 | -                 |  Yes  |   No    |
| `/user/me`     | PATCH  | `{ <any user data> }`             | -                 |  Yes  |   No    |
| `/leagues`     |  GET   | -                                 | List of leagues   |  Yes  |   Yes   |
| `/leagues`     |  POST  | `{ name, <other> }`               | League ID         |  Yes  |   Yes   |
| `/leagues/:id` | PATCH  | `{ <any league data> }`           | -                 |  Yes  |   Yes   |
| `/leagues/:id` | DELETE |                                   | -                 |  Yes  |   Yes   |
