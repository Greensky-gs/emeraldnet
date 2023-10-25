# Emerald.net

Node.js package to help you build APIs

This package only works with mysql databases

## Documentation

First you want to install the package :

`npm install emerald.net`
`yarn add emerald.net`
`pnpm add emerald.net`

### Get started

Create an Emerald application

```js
const { EmeraldApp } = require('emerald.net');

const app = new EmeraldApp({
    port: '8081',
    mysql: {
        user: 'greensky',
        password: '1324',
        database: 'grensky_api',
        host: '127.0.0.1'
    },
    logs: true,
    hashAlgorithm: 'sha256'
})

app.loginEndpoint('/login', (req, res, reason) => {
    reason.send({
        ok: reason === 'logged',
        reason
    })
})

app.start();
```

#### Starting

Call the start method only when you defined all the routes, statics and methods you need, otherwise the application will start without the routes you defined after

#### Algorithm

You should not change the `hashAlgorithm` property, because if you do, all the hashes in the database will be incorrect and users can't log in anymore

### Users

You can get the users manager by calling the `app.users` property

### Application

As the application uses express, you can of course get the express application

Use `app.app` to define your routes

## Contact

If you need any help or support, contact me via [instagram](https://instagram.com/draverindustries), [discord](https://discord.gg/fHyN5w84g6) or mail : `draver.industries@proton.me`
