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

app.use('/data/:zip/',function(req,res,next) {
    mgd.connect(function() {
        console.log("Connected to local db");
        const db = mgd.db("carma");
        console.log("Looking for listings near " + req.params.zip);
        var latlong = db.collection("zips").find({Zip:parseInt(req.params.zip)}).toArray()
        var y_dist
        var x_dist
        latlong.then(function(latlong) {
            try {
                var lat = latlong[0].Latitude;
                var long_ = latlong[0].Longitude;
                y_dist = [parseFloat(lat) - 0.5, parseFloat(lat) + 0.5];
                x_dist = [parseFloat(long_) - 0.5, parseFloat(long_) + 0.5];
                var cursor;
                cursor = db.collection('prod').find({$and: [{lat: {$gt: y_dist[0]}}, 
                                                    {lat: {$lt: y_dist[1]}},
                                                    {long: {$gt: x_dist[0]}},
                                                    {long: {$lt: x_dist[1]}}
                                                ]}).limit(100)
                var data = cursor.toArray();
                data.then(function(data) {
                    payload = {"listings": data};
                    res.json(payload);
                }, function(err) {
                    console.log("Error " + err)
                });
            }
            catch(error) {
                console.log("Zip not found")
                payload = {"listings" : []};
                res.json(payload);
            }
        }, function(err) {
            console.log("Zip not found")
            payload = {"listings" : []};
            res.json(payload);
        });
    });
});
