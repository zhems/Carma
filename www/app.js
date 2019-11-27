const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const port = 8000

const mgd = new MongoClient('mongodb://localhost:27017')

var data;

app.listen(port)
    
app.use('/', function(req,res,next) {
    console.log(req.path);
    next();
});

app.use('/', express.static('static'));

app.use('/data/:zip/:genre',function(req,res,next) {
    mgd.connect(function() {
        console.log("Connected to local db");
        const db = mgd.db("carma");
        var cursor;
        console.log(req.params.genre);
        if (req.params.genre == "offroad") {
            cursor = db.collection('test').find({"build.make" : "Nissan"})
        } else {
            cursor = db.collection('test').find()
        }
        data = cursor.toArray();
        data.then(function(data) {
            payload = {"listings": data};
            res.json(payload);
        }, function(err) {
            console.log("Error " + err)
        });
    });
});
