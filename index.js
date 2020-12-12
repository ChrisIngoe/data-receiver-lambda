'use strict';

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = process.env.MONGODB_URI; // or Atlas connection string

let cachedDb = null;

function connectToDatabase(uri) {
	console.log('=> connect to database');
	if (cachedDb) {
		console.log('=> using cached database instance');
		return Promise.resolve(cachedDb);
	}
	return MongoClient.connect(uri)
		.then(db => {
			cachedDb = db; //For mongo client before v3
			cachedDb = db.db("items"); //For mongo client v3,item is db i creted
			return cachedDb;
		});
}

function connectToDatabase (uri) {
    console.log('=> connect to database');
    if (cachedDb) {
        console.log('=> using cached database instance');
        return Promise.resolve(cachedDb);
    }
    return MongoClient.connect(uri, { useUnifiedTopology: true })
        .then(db => {
            cachedDb = db;
			cachedDb = db.db('db-nw');
            return cachedDb;
        })
        .catch(err => {
            console.log(JSON.stringify(err))
        });
}

function queryDatabase (db) {
    console.log('=> query database');
    return db.collection('coll-ipad').find({}).toArray()
        .catch(err => {
            console.log('=> an error occurred: ', err);
            return 'error' ;
        });
}

exports.handler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log('event: ', event);
    connectToDatabase(MONGODB_URI)
            .then(db => queryDatabase(db))
            .then(result => {
              console.log('=> returning results: ', result);
              return callback(null, {statusCode: 200, body: result});
            })
        .catch(err => {
            return callback({statusCode: 400, body: err});
        });
};