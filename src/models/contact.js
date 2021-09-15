const mongoose = require('mongoose')
//Στα βασικά στοιχεία θα είναι η Επωνυμία και το Email  ως υποχρεωτικά πεδία και η Διεύθυνση της επαφής ως προαιρετικό. 
//Επίσης, κάθε επαφή θα έχει τη δυνατότητα προσθήκης ενός ή περισσοτέρων στοιχείων τηλεφώνου.

const contactSchema = new mongoose.Schema({ 
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/, 'Invalid email address']
    },
    address: {
        type: String,
        trim: true
    },
    phones: [
        {
            prefix: {
                type: String,
                trim: true,
                match: [/^\+[0-9]{1,4}$/, 'Invalid phone prefix']
            },
            number: {
                type: String,
                trim: true,
                match: [/^\d(?: ?\d){9,14}$/, 'Invalid phone number']
            }
        }
    ],
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
});

// remove empty entries of phone numbers
contactSchema.pre('save', function(next) {
    this.phones = this.phones.filter(phone => phone.prefix.length && phone.number.length)
    next();
})

const Contact = mongoose.model('Contacts', contactSchema);

module.exports = Contact