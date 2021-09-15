const express = require('express')
const router = new express.Router()
const Contact = require('../models/contact')
const auth = require('../middleware/auth')

// TODO MANOS maybe add limit and skip GET /contacts?limit=10&skip=0
router.get('/contacts', auth, async (req, res, next) => {
    try {
        const contacts = await Contact.find({owner: req.user._id})
        res.send(contacts)
    } catch(e) {
        next(e);
    }
})

router.get('/contacts/:id', auth, async (req, res, next) => {
    try {
        const _id = req.params.id
        const contact = await Contact.findOne({_id, owner: req.user._id})
        if (!contact) {
            return res.status(404).send()
        }
        res.send(contact)
    } catch(e) {
        next(e);
    }
})

router.post('/contacts', auth, async (req, res, next) => {
    try {
        const contact = new Contact({
            ...req.body,
            owner: req.user._id
        })
        await contact.save()
        res.status(201).send(contact)
    } catch(e) {
        next(e);
    }
})

router.patch('/contacts/:id', auth, async (req, res, next) => {
    try {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['name', 'email', 'address', 'phones', 'owner']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
        if (!isValidOperation) {
            return res.status(400).send({error: 'Invalid updates'})
        }

        const contact = await Contact.findOne({_id: req.params.id, owner: req.user._id})
        if (!contact) {
            return res.status(404).send()
        }

        updates.forEach((update) => contact[update] = req.body[update])
        await contact.save()
        res.send(contact)
    } catch(e) {
        next(e);
    }
})

router.delete('/contacts/:id', auth, async (req, res, next) => {
    try {
        const contact = await Contact.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!contact) {
            return res.status(404).send()
        }
        res.send(contact)
    } catch(e) {
        next(e);
    }
})

module.exports = router