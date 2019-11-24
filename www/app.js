const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const port = 8000

const mgd = new MongoClient('mongodb://localhost:27017')

mgd.connect(function() {
    console.log("Connected to local db");
    const db = mgd.db("carma");
    var cursor = db.collection('test').find().limit(1);
    data = cursor.toArray()
    payload = JSON.stringify(data)
    app.listen(port);
    mgd.close();
});
    
app.use('/', function(req,res,next) {
    console.log(req.path);
    next();
});

app.use('/', express.static('static'));

app.use('/data',function(req,res,next) {
    console.log(data);
    console.log(payload);
    res.send(data);
});
