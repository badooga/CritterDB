
//Get mongoose model
var PublishedBestiary = require('../models/publishedBestiary');
var jwt = require("jsonwebtoken");
var config = require("../config");

var authenticateBestiaryByOwner = function(req, bestiary, callback){
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
        jwt.verify(token,config.secret,function(err,decoded){
            if(err)
                callback("Failed to authenticate token.");
            else{
                if(decoded._doc._id != bestiary.ownerId)
                    callback("Not authorized for access.");
                else
                    callback(null);
            }
        });
    }
    else{
        callback("No token provided.");
    }
}

exports.findById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    PublishedBestiary.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.errmsg);
        }
        else if(doc){
            //Do not authenticate by owner because this is public
            res.send(doc);
        }
        else{
            res.status(400).send("Bestiary not found.");
        }
    });
};

exports.findAll = function(req, res) {
    PublishedBestiary.find({}, function(err, docs) {
        if(err){
            res.status(400).send(err.errmsg);
        }
        else{
            res.send(docs);
        }
    });
};

exports.create = function(req, res) {
    var publishedBestiary = new PublishedBestiary(req.body);

    authenticateBestiaryByOwner(req, publishedBestiary, function(err){
        if(err)
            res.status(400).send(err);
        else{
            publishedBestiary.save(function (err, doc) {
                if(err) {
                    res.status(400).send(err.errmsg);
                }
                else {
                    res.send(doc);
                }
            });
        }
    });
}

exports.updateById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};
    var publishedBestiary = new PublishedBestiary(req.body);
    var options = {
        upsert: true,       //creates if not found
        new: true           //retrieves new object from database and returns that as doc
    }

    PublishedBestiary.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.errmsg);
        }
        else if(doc){
            authenticateBestiaryByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    PublishedBestiary.findOneAndUpdate(query, publishedBestiary, options, function(err, doc){
                        if(err)
                            res.status(400).send(err.errmsg);
                        else
                            res.send(doc);
                    });
                }
            });
        }
        else{
            res.status(400).send("Bestiary not found.");
        }
    });
}

exports.deleteById = function(req, res) {
    var id = req.params.id;
    var query = {'_id':id};

    PublishedBestiary.findOne(query, function (err, doc) {
        if(err) {
            res.status(400).send(err.errmsg);
        }
        else if(doc){
            authenticateBestiaryByOwner(req, doc, function(err){
                if(err)
                    res.status(400).send(err);
                else{
                    PublishedBestiary.findByIdAndRemove(query, function(err, doc, result){
                        if(err)
                            res.status(400).send(err.errmsg);
                        else
                            res.send(doc);
                    });
                }
            });
        }
        else{
            res.status(400).send("Bestiary not found.");
        }
    });
}