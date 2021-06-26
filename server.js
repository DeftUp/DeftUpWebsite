if (process.env.NODE_ENV != 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

// const MongoClient = require('mongodb').MongoClient;
// const url = 'mongodb://localhost:27017';
// const dbName = 'defterdb';
// const client = new MongoClient(url);
// client.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected successfully to server");
//     const db = client.db(dbName);
//     // db.createCollection("defters", function(err, res) {
//     //     if (err) throw err;
//     //     console.log("Collection created!")
//     //     client.close();
//     // });
//     // client.close();
// });

const passport = require('passport')
const initializePassport = require('./passport-config')
initializePassport(
    passport,
        email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
// app.set('views', _dirname + '/views')
app.use(express.static("views"))
app.use(express.urlencoded({ extended: false}))
app.set('layout', './layouts/layout.ejs')
app.use(expressLayouts)
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false /*don't save empty values in session*/
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', {name: req.user.name})
})

app.get('/test', checkAuthenticated, (req, res) => {
    res.render('test.ejs', {name: req.user.name})
})

app.get('/DeftUpPro', checkNotAuthenticated, (req, res) => {
    res.render('DeftUpPro.ejs')
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/Register', checkNotAuthenticated, (req, res) => {
    res.render('Register.ejs')
})

app.post('/Register', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            firstname: req.body.first,
            lastname: req.body.last,
            email: req.body.email,
            password: hashedPassword
        })
        client.connect(function(err) {
            if (err) throw err;
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            let myobj = { lastname: req.body.last, firstname: req.body.first, phone: req.body.phone, gender: req.body.gender, email: req.body.email, address: req.body.address, password: hashedPassword };
            db.collection("defters").insertOne(myobj, function(err, res) {
                if (err) throw err;
                console.log("1 document inserted");
                // client.close();
            });
        });
        res.redirect('/DeftUpPro')
    } catch {
        res.redirect('/Register')
    }
    console.log(users)
})

app.get('/DefterAccount', checkNotAuthenticated, (req, res) => {
    res.render('DefterAccount.ejs')
})

app.get('/CustomerAccount', checkNotAuthenticated, (req, res) => {
    res.render('CustomerAccount.ejs')
})

app.get('/Categories', checkNotAuthenticated, (req, res) => {
    res.render('Categories.ejs')
})

app.get('/AboutUs', checkNotAuthenticated, (req, res) => {
    res.render('AboutUs.ejs')
})

app.get('/Help', checkNotAuthenticated, (req, res) => {
    res.render('Help.ejs')
})

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(process.env.PORT ||3000)