# ufinity-education-portal-node

## Introduction

This project is intended for Ufinity Technical Assessment (Node.js).

It is a NODE.js SwaggerExpress app that provides some REST APIs for a mock education portal.

This repository consists of 3 sub-projects:

* __uep-server__ - Node.js RESTful Server (Back-end)


## Requirements
This Node.js application requires the following software:

* [node.js v12.18.2](https://nodejs.org/en/download/) installed in the server.
* [swagger (optional)](https://github.com/swagger-api/swagger-node/) to use visual swagger REST schema editor for node.js

Installing packages via NPM:

```
# development use
npm i -g nodemon        # to run "npm run dev" that uses nodemon
npm i -g swagger        # to use "swagger project edit"
npm i -g eslint         # for development code linting use
```


## MySQL Server Setup

* Go to:  [database/](/database/)


## Project Setup

* Clone this repository, navigate to the desired folder path in command prompt and enter:

```
git clone https://github.com/zhuhang-jasper/ufinity-education-portal-node.git
```


### Method 1: Auto using Batch scripts (Windows only)

* __0.init_projects.bat__ -> installs npm packages for the project
    - run after first time git checkout.
    - run every time package.json is modified.
* __1.start nodejs server.bat__ -> start Node.js server


### Method 2: Manual using NPM Commands

* To start Node.js RESTful app - In the repo folder, open CMD and run the following commands:
* After started, API doc can be accessed via: [http://localhost:4300/api-docs](http://localhost:4300/api-docs)

```
cd uep-server
npm install
npm run dev       #dev
npm run prod      #prod
```


## Git Commit Message Prefix

* __[Task]__   - Task / Features
* __[Bug]__    - Bug fixes
* __[Enha]__   - Enhancements / UI Tweaks / Performance / Security
* __[Infra]__  - Infrastructure / Deployment & Environment config
* __[Opt]__    - Optimizations / Code cleaning
* __[Doc]__    - Documentation / Code comments
* __[Dev]__    - Developer / Debugging commits
* __[Misc]__   - _(Deprecated) Miscellaneous / Uncategorised items_
