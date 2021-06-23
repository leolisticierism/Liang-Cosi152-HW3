
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var rankDataSchema = Schema( {
  ownerId: ObjectId,
  heroname: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'RankData', rankDataSchema );
