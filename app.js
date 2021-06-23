const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const axios = require('axios')
const layouts = require("express-ejs-layouts");
//const auth = require('./config/auth.js');


const mongoose = require( 'mongoose' );
//mongoose.connect( `mongodb+srv://${auth.atlasAuth.username}:${auth.atlasAuth.password}@cluster0-yjamu.mongodb.net/authdemo?retryWrites=true&w=majority`);
mongoose.connect( 'mongodb://localhost/authDemo');
//const mongoDB_URI = process.env.MONGODB_URI
//mongoose.connect(mongoDB_URI)

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we are connected!!!")
});

const authRouter = require('./routes/authentication');
const isLoggedIn = authRouter.isLoggedIn
const loggingRouter = require('./routes/logging');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const rankDataRouter = require('./routes/rankData');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(layouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authRouter)
app.use(loggingRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/rank',rankDataRouter);


const myLogger = (req,res,next) => {
  console.log('inside a route!')
  next()
}
app.get('/demo',(req,res) => {
  res.render('demo')
})

app.get('/about',(req,res) => {
  res.render('about')
})

app.get("/survey",
  myLogger,
  isLoggedIn,
  (req,res) => {
  res.render("survey")
})

app.post('/formdata', (req,res) => {
  res.locals.fullname = req.body.fullname
  res.locals.emailaddress = req.body.emailaddress
  const birthday = req.body.birthday
  const age = 2021-birthday
  res.locals.age = age
  res.locals.occupation = req.body.occupation
  res.locals.bio = req.body.bio
  res.locals.hearthstone = req.body.hearthstone
  res.locals.feedback = req.body.feedback
  res.render('showformdata')
})

app.get('/cards', (req,res) => {
  res.render('cards')
})

app.post("/getCards",
  async (req,res,next) => {
    try {
      const language = req.body.language
      const country = req.body.country
      const url = "https://api.hearthstonejson.com/v1/25770/"+language+country+"/cards.collectible.json"
      const result = await axios.get(url)
      res.locals.result = result.data
      res.locals.url = url
      res.render('showCards')
    } catch(error){
      next(error)
    }
})

app.get("/score",
  myLogger,
  isLoggedIn,
  (req,res) => {
  res.render("score")
})

app.post('/calcScore', (req,res) => {
  const a = parseFloat(req.body.a)
  const aa = parseFloat(req.body.aa)
  const b = parseFloat(req.body.b)
  const bb = parseFloat(req.body.bb)
  const c = parseFloat(req.body.c)
  const cc = parseFloat(req.body.cc)
  const d = parseFloat(req.body.d)
  const dd = parseFloat(req.body.dd)
  const e = parseFloat(req.body.e)
  const ee = parseFloat(req.body.ee)
  const score = (45-(aa+bb+cc+dd+ee))*2.5
  const bonus = (a+b+c+d+e-5)*2
  const finalscore = score+bonus
  res.locals.a = a
  res.locals.aa = aa
  res.locals.b = b
  res.locals.bb = bb
  res.locals.c = c
  res.locals.cc = cc
  res.locals.d = d
  res.locals.dd = dd
  res.locals.e = e
  res.locals.ee = ee
  res.locals.score = score
  res.locals.bonus = bonus
  res.locals.finalscore = finalscore
  res.render('showScore')
})

app.get('/profiles',
    isLoggedIn,
    async (req,res,next) => {
      try {
        res.locals.profiles = await User.find({})
        res.render('profiles')
      }
      catch(e){
        next(e)
      }
    }
  )

app.use('/publicprofile/:userId',
    async (req,res,next) => {
      try {
        let userId = req.params.userId
        res.locals.profile = await User.findOne({_id:userId})
        res.render('publicprofile')
      }
      catch(e){
        console.log("Error in /profile/userId:")
        next(e)
      }
    }
)


app.get('/profile',
    isLoggedIn,
    (req,res) => {
      res.render('profile')
    })

app.get('/editProfile',
    isLoggedIn,
    (req,res) => res.render('editProfile'))

app.post('/editProfile',
    isLoggedIn,
    async (req,res,next) => {
      try {
        let username = req.body.username
        let age = req.body.age
        req.user.username = username
        req.user.age = age
        req.user.imageURL = req.body.imageURL
        await req.user.save()
        res.redirect('/profile')
      } catch (error) {
        next(error)
      }

    })


app.use('/daTa',(req,res) => {
  res.json([{a:1,b:2},{a:5,b:3}]);
})

const User = require('./models/User');

app.get("/test",async (req,res,next) => {
  try{
    const u = await User.find({})
    console.log("found u "+u)
  }catch(e){
    next(e)
  }

})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
