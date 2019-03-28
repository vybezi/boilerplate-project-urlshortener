'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
const dns = require('dns');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;


/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);
 mongoose.connect(process.env.MONGO_URI);



var Schema = mongoose.Schema;

var shortUrlSchema = new Schema({
  url: String
})

var ShortUrl = mongoose.model('ShortUrl', shortUrlSchema)



var createShortUrl = function(url,done){
  var shortUrl = new ShortUrl({url:url})
  shortUrl.save(function(err, data){
    console.log("New Url");
    console.log(shortUrl);
    done(null, data)
  })
}

var findUrlById = function(shortUrlId, done){
  ShortUrl.findById(shortUrlId, function(err, data){
    done(null,data)
  })
}

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


app.post("/api/shorturl/new", function(req,res){
  let url = req.body.url;
  if(!url){
    res.json({error: "invalid URL"})
  }
  
  let urlDns = url.replace(/^(https?:|)\/\//,'')
  
  dns.lookup(urlDns, function(err,result){
    if(err){
      res.json({error: "invalid URL"})
    }else{
      // res.json({test: result})
      createShortUrl(url,function(err, data){
        console.log(data)
        res.json({original_url: url,short_url: data._id})
      })
    }
  })
  
  // res.json({url:url})
})


app.get("/api/shorturl/:id", function(req, res){
  
  let id = req.params.id;
  
  findUrlById(id,function(err,data) {
    if(err){
      throw err
    }else{
      res.redirect(data.url);
    }
  })
  
  
})


app.listen(port, function () {
  console.log('Node.js listening ...');
});
