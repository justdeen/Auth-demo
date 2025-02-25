const express = require('express')
const app = express();
const User = require('./models/user')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const session = require('express-session')

mongoose.connect('mongodb://127.0.0.1:27017/authdemo')
.then(() => {
    console.log('CONNECTION OPEN')
})
.catch(err => {
    console.log('CONNECTION ERROR')
    console.log(err)
})

app.use(express.urlencoded({extended: true}))
app.use(session({
    secret: 'notagoodsecret',
    resave: false, 
    saveUninitialized: false
}))

app.set('view engine', 'ejs')
app.set('views', 'views')

const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        return res.redirect('/login')
    }
    next();
}



app.get('/', (req, res) => {
    res.send('Home page')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const {username, password} = req.body
    const user = new User({username, password})
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/secret')
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body
    const user = await User.findAndValidate({username, password})
    // res.redirect('/')
    if(user){
        req.session.user_id = user._id;
        res.redirect('/secret')
    }else{
        res.redirect('/login')
    }
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/checkdb', async (req, res) => {
    // const done = await User.deleteMany({})
    // console.log(done)
    // const data = await User.find({})
    // console.log(data)
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null
    req.session.destroy();
    res.redirect('/login')
})

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret')
})

app.get('/topsecret', requireLogin, (req, res) => {
    res.send('top secret')
})

app.listen(3000, () => {
    console.log('SERVING ON PORT 3000')
})