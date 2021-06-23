const express = require('express');
const router = express.Router();
const RankData = require('../models/RankData')
const RankDataHero = require('../models/RankDataHero')


isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/',
  isLoggedIn,
  async (req, res, next) => {
      res.locals.rankData = await RankData.find({})
      res.render('rankData');
});

router.get('/:heroId',
  isLoggedIn,
  async (req, res, next) => {
      const heroId = req.params.heroId
      res.locals.rank = await RankData.findOne({_id:heroId})
      res.locals.rankings = await RankDataHero.find({heroId:heroId})
      res.render('rankData2');
});

router.get('/remove/:heroId',
  isLoggedIn,
  async (req,res,next) => {
      await RankData.remove({_id:req.params.heroId})
      await RankData.remove({heroId:req.params.heroId})
      res.redirect('/rank')
})



router.post('/',
  isLoggedIn,
  async (req, res, next) => {
      const rank = new RankData(
        {heroname:req.body.heroname,
         createdAt: new Date(),
         ownerId: req.user._id,
        })
      await rank.save();
      res.redirect('/rank')
});

router.post('/addRanking/:heroId',
  isLoggedIn,
  async (req, res, next) => {
      const rankdata =
      {rank:req.body.ranking,
       heroId:req.params.heroId,
       createdAt: new Date(),
       ownerId: req.user._id,
      }
      console.log("rankdata = ")
      console.dir(rankdata)
      const rankdata2 = new RankDataHero(rankdata)
      await rankdata2.save();
      res.redirect('/rank/'+req.params.heroId)
});

module.exports = router;
