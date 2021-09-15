const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../../config')
//Στα βασικά στοιχεία θα είναι η Επωνυμία και το Email  ως υποχρεωτικά πεδία και η Διεύθυνση της επαφής ως προαιρετικό. 
//Επίσης, κάθε επαφή θα έχει τη δυνατότητα προσθήκης ενός ή περισσοτέρων στοιχείων τηλεφώνου.

const userSchema = new mongoose.Schema({ 
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/, 'Invalid email address']
    },
    password: {
        type: String,
        required: true,
        trim: true,
        // match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/, 'password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit and have 8-20 characters']
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.virtual('contacts', {
    ref: 'Contact',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.pre('save', async function(next) {
    let user = this;
    if (user.isModified('password')) {
        // Moved password validation here because if i put it on schema it will
        // produce error because hashed password does not match the regex
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(user.password)) {
            let error = new Error();
            error.errors = {
                "errors": {
                    "password": {
                        "message": "password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit and have 8-20 characters"
                    }
                }
            }
            throw error
        }
        user.password = await bcrypt.hash(user.password, 8)
    }
    next();
})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString(), email: user.email}, config.JWT_SECRET, {expiresIn: '10h'})
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user) {
        let error = new Error("Wrong email or password")
        error.status = 401
        throw error
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        let error = new Error("Wrong email or password")
        error.status = 401
        throw error
    }

    return user
}

const User = mongoose.model('User', userSchema);

module.exports = User