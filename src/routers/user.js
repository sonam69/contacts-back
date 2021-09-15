const express = require('express')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/users', async (req, res, next) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({token})
    } catch(e) {
        if ((e.code && e.code === 11000)) {
            // keeping mongoose error structure
            let error = new Error()
            error.status = 409
            error.errors = {
                "email": {
                    "message": "Email already exists"
                }
            };
            next(error)
        }
        else {
          e.status = 400
          next(e)
        }

    }
})

router.post('/users/login', async (req, res, next) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(201).send({token})
    } catch(e) {
        next(e)
    }
})

router.post('/users/logout', auth, async (req, res, next) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch(e) {
      next(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res, next) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e) {
      next(e)
    }
})

module.exports = router