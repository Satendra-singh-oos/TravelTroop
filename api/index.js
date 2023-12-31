const express = require('express')
const cors = require('cors')
const { default: mongoose } = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const User = require('./models/User.js')
const Booking = require('./models/Booking.js')
const Place = require('./models/Place.js')
const imageDownloader = require('image-downloader')
const multer = require('multer')
const fs = require('fs')

require('dotenv').config()
const app = express()

const bcryptSalt = bcrypt.genSaltSync(10);


app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(cors({
    credentials: true,
    origin: 'http://127.0.0.1:5173'
}))


const getUserDataFromReq = (req) => {
    return new Promise((resolve, reject) => {
        jwt.verify(req.cookies.token, process.env.JWT_SECRET, {}, async (err, userData) => {
            if (err) throw err;
            resolve(userData);
        });
    });
}

mongoose.connect(process.env.MONGO_URL)

app.get('/test', (req, res) => {
    res.json("test Okay")
})

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body
    try {
        const newUser = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        })
        res.json(newUser)
    } catch (err) {
        res.status(422).json(err)
    }

})


app.post('/login', async (req, res) => {
    mongoose.connect(process.env.MONGO_URL)

    const { email, password } = req.body
    const userDoc = await User.findOne({ email })

    if (userDoc) {
        const passOk = bcrypt.compareSync(password, userDoc.password)
        if (passOk) {
            jwt.sign({
                email: userDoc.email,
                id: userDoc._id
            }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userDoc)
            })
        }
        else {
            res.status(422).json("password Wrong")
        }
    } else {
        res.json('notFound')
    }
})


app.get('/profile', (req, res) => {
    const { token } = req.cookies
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
            if (err) throw err;
            const { name, email, _id } = await User.findById(userData.id)
            res.json({ name, email, _id })

        })
    } else {
        res.json(null)
    }

})


app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true)
})


app.post('/upload-by-link', async (req, res) => {
    const { link } = req.body;
    const newName = "photo" + Date.now() + '.jpg'
    await imageDownloader.image({
        url: link,
        dest: __dirname + '/uploads/' + newName,
    })
    // .then(({ filename }) => {
    //     console.log('Saved to', filename); // saved to __direname/uploads/newName
    // })
    //     .catch((err) => console.error(err));;

    res.json(newName)

})


const photosMiddleware = multer({ dest: 'uploads/' })
app.post('/upload', photosMiddleware.array('photos', 100), async (req, res) => {
    const uploadedFiles = []
    for (let i = 0; i < req.files.length; i++) {
        const { path, originalname } = req.files[i];
        const parts = originalname.split('.')
        const ext = parts[parts.length - 1]
        const newPath = path + '.' + ext;
        fs.renameSync(path, newPath)
        // uploadedFiles.push(newPath.replace('uploads/', ''))
        uploadedFiles.push(newPath.replace('uploads\\', ''))

    }
    // console.log(req.files);
    res.json(uploadedFiles)
})


app.post('/places', async (req, res) => {
    // mongoose.connect(process.env.MONGO_URL);
    const { token } = req.cookies
    const {
        title, address, addedPhotos, description, price,
        perks, extraInfo, checkIn, checkOut, maxGuests,
    } = req.body;

    //grabing user id from tokken
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.create({
            owner: userData.id,
            title, address, photos: addedPhotos, description, price,
            perks, extraInfo, checkIn, checkOut, maxGuests,

        })
        res.json(placeDoc)

    })

})


app.get('/user-places', (req, res) => {

    const { token } = req.cookies
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
        if (err) throw err;
        const { id } = userData;
        res.json(await Place.find({ owner: id }))
    })

})

app.get("/places/:id", async (req, res) => {
    const { id } = req.params;
    res.json(await Place.findById(id))
})

app.put('/places', async (req, res) => {

    const { token } = req.cookies
    const {
        id, title, address, addedPhotos, description, price,
        perks, extraInfo, checkIn, checkOut, maxGuests,
    } = req.body;


    // Grab the owner if this is the owener of the place
    jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
        if (err) throw err;
        const placeDoc = await Place.findById(id)
        if (userData.id === placeDoc.owner.toString()) {
            placeDoc.set({
                title, address, photos: addedPhotos, description, price,
                perks, extraInfo, checkIn, checkOut, maxGuests,
            })
            await placeDoc.save()
            res.json('Update the info')
        }
    })
})

app.get('/places', async (req, res) => {
    res.json(await Place.find())
})

app.post('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req)
    const { place, checkIn, checkOut, numberOfGuests, name, phone, price } = req.body
    Booking.create({
        place, checkIn, checkOut, numberOfGuests, name, phone, price,
        user: userData.id
    }).then((doc) => {

        res.json(doc)
    }).catch((err) => {
        throw err;
    })
})


app.get('/bookings', async (req, res) => {
    const userData = await getUserDataFromReq(req)

    res.json(await Booking.find({ user: userData.id }).populate('place'))

})

app.listen(4000)
