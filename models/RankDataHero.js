
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var rankDataHeroSchema = Schema( {
  ownerId: ObjectId,
  heroId: ObjectId,
  rank: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'RankDataHero', rankDataHeroSchema );
