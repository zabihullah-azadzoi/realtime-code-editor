# Realtime Code Editor and compiler

## Description

This is a realtime code editor and compiler primarily used for code collaboration and group programming:

* features:
  * Node provides the backend environment for this application
  * Express middleware is used to handle requests, routes
  * React for displaying UI components
  * Websockets and Socket.io library is used to handle realtime code sharing
  * Using Jungo0 Api for compiling and executing the code
 
  




## Setup

```
 Create .env file in the root directory that includes:

  * REACT_APP_RAPID_API_URL="https://judge0-ce.p.rapidapi.com/submissions"
  * REACT_APP_RAPID_API_HOST="judge0-ce.p.rapidapi.com"
  * REACT_APP_RAPID_API_SECRET=                        // get your own after singing in and subscribing to the jungo0 Api in Rapid  (https://rapidapi.com/judge0-official/api/judge0-ce)
  * REACT_APP_SERVER_URL=REACT_APP_API_URL="http://localhost:8000"
  * CLIENT_SIDE_URL="http://localhost:3000"
  * SERVER_PORT=5000
  
```


## Start development for client side

```
$ npm run start
```

## Start development for server side in a separate terminal 

```
$ npm run start:sever
```

## Simple build for production in client

```
$ npm run build
```



## Languages & tools

- [Node](https://nodejs.org/en/)

- [Express](https://expressjs.com/)

- [React](https://reactjs.org/)

- [Webpack](https://webpack.js.org/)



