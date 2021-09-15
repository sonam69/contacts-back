const express = require('express')
const mongoose = require('mongoose')
const config = require('../config')
const contactRouter = require('./routers/contact')
const userRouter = require('./routers/user')
mongoose.connect(config.MONGODB_URI, {})

const app = express()

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.FRONTEND_URL);
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, PATCH, POST, DELETE, GET')
    return res.status(200).json({})
  }
  next();
});

app.use(express.json())
app.use(userRouter)
app.use(contactRouter)

app.use((req, res, next) => {
    let error = new Error("Not found");
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    if (res.status == 500) {
      res.send()
    }
    else if (error.errors) {
      res.json({
        errors: error.errors
      })
    }
    else {
      res.json({
        error: {
          message: error.message,
        }
      })
    }
})

app.listen(config.PORT, () => {
    console.log('Server is up on port ' + config.PORT)
})