const accountSid = 'AC2b014082a2d1253c9808521852b78f14';
const authToken = '6b4eed390e4aa2ac52f28c57378caee9';
const client = require('twilio')(accountSid, authToken);
const util = require('util');
const Axios = require('axios');
const Fs = require('fs');
const Path = require('path');
const { DirectLine } = require('botframework-directlinejs');
global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var express = require('express');
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var stackSMSToSend = [];


// console.log(directLine);
// directLine.postActivity({
//   from: { id: 'myUserId', name: 'myUserName' }, // required (from.name is optional)
//   type: 'message',
//   text: 'a message for you, Rudy',
// }).subscribe(
//   id => console.log("Posted activity, assigned ID ", id),
//   error => console.log("Error posting activity", error)
// );
// client.messages
//       .create({
//         body: 'Hello there!',
//         from: 'whatsapp:+14155238886',
//         to: 'whatsapp:+32472848015'
//       })
//       .then(message => console.log(message.sid), console.log(client))
//       .done();



app.get('/', function (req, res) {
   res.send('Hello world');
});
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.post('/clear', function (req, res) {
   res.clearCookie('cookieConversation').send();
});
app.post('/callBackSMS', function (req, res) {
   //console.log(util.inspect(req.body, { showHidden: true, depth: null }));
   console.log('------------');
   console.log(req.body.SmsStatus);
   console.log('------------');
   if (req.body.SmsStatus === 'delivered' || req.body.SmsStatus === 'sent') {
      stackSMSToSend.splice(0, 1);
      console.log('CALLBACK ------------------------->', stackSMSToSend);
      if (stackSMSToSend.length > 0) {
         client.messages.create({
            body: stackSMSToSend[0][0],
            from: stackSMSToSend[0][1],
            to: stackSMSToSend[0][2]
         });
      }
   }
});
app.post('/', urlencodedParser, function (req, res) {
   // res.clearCookie('cookieConversation').send();
   res.type('text/xml');
   console.log(req.cookies);
   var body = req.body.Body;
   console.log('var BODY ->', body);
   var tow = req.body.To;
   console.log('var TOW ->', tow);
   var from = req.body.From;
   console.log('var FROM ->', from);
   console.log('req.body ->', req.body);
   if (req.cookies.cookieConversation !== undefined) {
      console.log('cookie exist');
      const directLine = new DirectLine({
         // token: 'sUoHr7oA_wU.1AjY8FNdwS4F-lVoeXdJdQoTdsAmdhk7IZAFbacmsio',
         secret: 'sUoHr7oA_wU.1AjY8FNdwS4F-lVoeXdJdQoTdsAmdhk7IZAFbacmsio',
         conversationId: req.cookies.cookieConversation.conversationId
      });
      console.log('FROM.ID->>>', tow.concat(from));
      console.log('botAgent ->>>', directLine._botAgent);
      // console.log(directLine);
      if (req.body.MediaUrl0 !== undefined) {
         console.log('jpeg', req.body.MediaUrl0);
         // dlImgTwilio(req.body.MediaUrl0, directLine, tow, from);
         directLine.postActivity({
            from: { id: tow.concat(from) }, // required (from.name is optional)
            type: 'message',
            attachments: [{
               contentType: 'image/jpeg',
               contentUrl: req.body.MediaUrl0,
               name: 'test.jpg'
            }]
         }).subscribe(
            (...args) => console.log("Posted activity, assigned conversation ", ...args),
            error => console.log("Error posting activity", error),
            () => console.log('done'),
         );
      } else {
         directLine.postActivity({
            from: { id: tow.concat(from) }, // required (from.name is optional)
            type: 'message',
            text: body,
         }).subscribe(
            id => {
               console.log(util.inspect(id, { showHidden: true, depth: null }))
            },
            error => console.log("Error posting activity", error),
            () => console.log('done'),
         );
      }
      //console.log(directLine);
      // directLine.activity$
      //    .filter(activity => activity.type === 'message')
      //    .subscribe(
      //       message => {
      //          console.log("received message cookie", util.inspect(message, { showHidden: true, depth: null }));
      //          var msg = '';
      //          if (message.suggestedActions !== undefined) {
      //             console.log(message.suggestedActions);
      //             var actions = '';
      //             for (var i = 0; i < message.suggestedActions.actions.length; i++) {
      //                actions = actions + `${[i + 1]}.${message.suggestedActions.actions[i].value}
      //         `;
      //             }
      //             msg = `${message.text}
      //       ${actions}`;
      //          } else {
      //             msg = message.text;
      //          }
      //          const tabDataSMS = [msg, tow, from];
      //          stackSMSToSend.push(tabDataSMS);
      //          console.log('no callback --->', stackSMSToSend);
      //          if (stackSMSToSend.length == 1) {
      //             client.messages.create({
      //                body: stackSMSToSend[0][0],
      //                from: stackSMSToSend[0][1],
      //                to: stackSMSToSend[0][2]
      //             });
      //          }
      //       }
      //    );
   } else {
      var directLine = new DirectLine({
         secret: 'sUoHr7oA_wU.1AjY8FNdwS4F-lVoeXdJdQoTdsAmdhk7IZAFbacmsio',
      });
      directLine.startConversation;
      directLine.postActivity({
         from: { id: tow.concat(from) }, // required (from.name is optional)
         type: 'message',
         text: 'Username',
      }).subscribe(
         id => {
            console.log("Posted activity, assigned ID ", id);
            var conversationId = id.split('|')[0];
            var cookieConversation = { conversationId: conversationId, To: tow, From: from };
            res.cookie('cookieConversation', cookieConversation, { maxAge: 1000 * 60 }).send();
            console.log(cookieConversation);
         },
         // (...args) => console.log("Posted activity, assigned conversation ", ...args),
         error => console.log("Error posting activity", error),
         () => console.log('done'),
      );
      //console.log(directLine);
      directLine.activity$
         .filter(activity => activity.type === 'message')
         .subscribe(
            // message => {
            //   console.log("received message ", util.inspect(message, { showHidden: true, depth: null }));
            //   client.messages.create({
            //     body: message.text,
            //     from: tow,
            //     to: from,
            //   }).then(console.log)
            // }
            message => {
               console.log("received message PASCOOKIE", util.inspect(message, { showHidden: true, depth: null }));
               var msg = '';
               if (message.suggestedActions !== undefined) {
                  console.log(message.suggestedActions);
                  var actions = '';
                  for (var i = 0; i < message.suggestedActions.actions.length; i++) {
                     actions = actions + `${[i + 1]}.${message.suggestedActions.actions[i].value}
              `;
                  }
                  msg = `${message.text}
            ${actions}`;
               } else {
                  msg = message.text;
               }
               const tabDataSMS = [msg, tow, from];
               stackSMSToSend.push(tabDataSMS);
               console.log('no callback --->', stackSMSToSend);
               // console.log('ok', stackSMSToSend[0][0], stackSMSToSend[0][1], stackSMSToSend[0][2])
               if (stackSMSToSend.length == 1) {
                  client.messages.create({
                     body: stackSMSToSend[0][0],
                     from: stackSMSToSend[0][1],
                     to: stackSMSToSend[0][2]
                  });
               }
            }
         );
   }
   // client.messages
   //   .create({
   //     body: 'Hello there!',
   //     from: tow,
   //     to: from
   //   })
   //   .then(directLine.postActivity({
   //     from: { id: 'myUserId', name: 'myUserName' }, // required (from.name is optional)
   //     type: 'message',
   //     text: 'a message for you, Rudy',
   //   }).subscribe(
   //     id => {
   //       console.log("Posted activity, assigned ID ", id);
   //       var conversationId = id.split('|')[0];
   //       var cookieConversation = { conversationId: conversationId, To: tow, From: from };
   //       res.cookie('cookieConversation', cookieConversation, { maxAge: 1000 * 60 }).send();
   //       console.log(cookieConversation);
   //     },
   //     // (...args) => console.log("Posted activity, assigned conversation ", ...args),
   //     error => console.log("Error posting activity", error),
   //     () => console.log('done'),
   //   ))
   //   .then(message => console.log(message.sid))
   //   // .then(console.log('Message.Sid ->', util.inspect(message.sid, { showHidden: true, depth: null })))
   //   // .then(console.log('Client ->', util.inspect(client, { showHidden: true, depth: null })))
   //   .done();
   // }
   // directLine.startConversation().then(function(response) {
   //   console.log(response.obj.conversationId);
   // });
   // console.log(directLine.startConversation());
   //console.log(directLine.conversationId);
   // directLine.startConversation;
   //var dcid = directLine.getSessionId();
   //console.log(dsc);
   //console.log(util.inspect(dcid));
   // var x = directLine.conversationId;
   // console.log(x);
   //console.log('urlencodedParser ->',urlencodedParser);
   // console.log(bodyParser.urlencoded);
   //console.log('bodyParser.urlencoded ->',bodyParser.urlencoded());
   //console.log('BODY ->', util.inspect(bodyParser.urlencoded()));
   // console.log(req.body.body);
   // console.log(req.body.to);
   // console.log(req.body.from);
   //var cachedEmployees = _.object(_.map(options, function(it) { return [it.option, it.id]; }));
   //res.cookie('cachedEmployees', cachedEmployees, { maxAge: 1000 * 60 * 60 });
   //console.log(req.cookies);
   //console.log(req.cookie);
   // client.messages
   //   .create({
   //     body: 'Hello there!',
   //     from: tow,
   //     to: from
   //   })
   //   .then(directLine.postActivity({
   //     from: { id: 'myUserId', name: 'myUserName' }, // required (from.name is optional)
   //     type: 'message',
   //     text: 'a message for you, Rudy',
   //   }).subscribe(
   //     id => {
   //       console.log("Posted activity, assigned ID ", id);
   //       var conversationId = id.split('|')[0];
   //       var cookieConversation = { conversationId: conversationId, To: tow, From: from };
   //       res.cookie('cookieConversation', cookieConversation, { maxAge: 1000 * 60 }).send();
   //       console.log(cookieConversation);
   //     },
   //     // (...args) => console.log("Posted activity, assigned conversation ", ...args),
   //     error => console.log("Error posting activity", error),
   //     () => console.log('done'),
   //   ))
   //   .then(message => console.log(message.sid))
   //   // .then(console.log('Message.Sid ->', util.inspect(message.sid, { showHidden: true, depth: null })))
   //   // .then(console.log('Client ->', util.inspect(client, { showHidden: true, depth: null })))
   //   .done();
});
// async function dlImgTwilio(url, directLine, tow, from) {
//    console.log(url);
//    const fileName = tow.concat(from);
//    const path = Path.resolve(__dirname, 'files', fileName);
//    const response = await Axios({
//       url: url,
//       method: 'GET',
//       responseType: 'stream'
//    })

//    response.data.pipe(Fs.createWriteStream(path));

//    return new Promise((resolve, reject) => {
//       response.data.on('end', () => {
//          console.log("DownloadSuccessfull");
//          directLine.postMessageWithAttachments({
//             from: { id: tow.concat(from) }, // required (from.name is optional)
//             type: 'message',
//             attachments: [{
//                name: fileName,
//                contentType: 'image/jpeg',
//                contentUrl: x
//             }]
//          })
//          resolve();
//       })
//       response.data.on('error', err => {
//          console.log("ERROR ->>>>>>>>>>>>>>>", err);
//          reject(err);
//       })
//    })
// }

app.listen(3000, function () {
   console.log('Example app listening on port 3000!');
});
