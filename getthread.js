'use strict';

//module to parse BBCodes in a post. This is not my code, I merely customised
  //code I found here: *******
var bbtest = require('./10_bbparse');

//custom module to convert time to a human-readable form.
var timeConvert = require('./11_time-convert');

var seneca = require('seneca')()

seneca.listen(10103) //requests from Hapi REST

var thread = {};

//discovery
seneca.add({cmd:'config'}, function (msg, response) {
  msg.data.forEach(function (item) {
    if (item.name === 'Directory') {
      seneca.client({host:item.address, port:10101});
    }
  })
  response(null, msg.data);
});


seneca.add({role:"get",cmd:"thread"}, function( msg, respond) {
//console.log('get thread request', msg);

  //I don't need to do things this way. I should work more directly with the
    //data entity and do some of this 'logic' in angular.
  thread.threadid = msg.id;

  seneca.act({role:"find",cmd:"thread",id:msg.id},function(err, result) {
  //  console.log('find thread request');
  //  console.log(result);

    thread.threadtitle = result.thread.title;
    thread.titles = [];
    thread.postids = result.thread.postids.split(",");
    thread.authors = [];
    thread.timestamps = [];
    thread.contents = [];
    thread.parentid = result.thread.parentid;

  //  console.log('find section', result);
    seneca.act({role:"find",cmd:"section",id:result.thread.parentid}, function (err, result) {
      thread.parenttitle = result.section.title;
      thread.role = result.section.role;
    })

    thread.postids.forEach(function (postid,i) {

    //  console.log('find post', postid)
      seneca.act({role:"find",cmd:"post",id:postid},function(err, result) {
        thread.timestamps[i] = timeConvert(result.post.when);

        thread.contents[i] = decodeURI(result.post.content);
        thread.contents[i] = bbtest.bbcodeToHtml(thread.contents[i]);

        thread.contents[i] = encodeURI(thread.contents[i]);

        thread.titles[i] = result.post.title;

        thread.authors[i] = result.post.author;
      //    finished getting all posts?
          if (i === thread.postids.length-1) {
            respond ( null, thread);
          }
        //});
      });
    });
  })
  //
})
