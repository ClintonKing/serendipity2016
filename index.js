'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('NPR: Let Us Know')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'letusknow') {
        res.status(200).send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

//Messenger API endpoint
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text
            if (text === 'NPR'){
              sendNPRCarousel(sender)
              continue
            } else if (text === "space"){
              sendSpaceCarousel(sender)
              continue
            } else if (text === "cute"){
              sendCuteCarousel(sender)
              continue
            } else if (text === "trump"){
              sendElectionCarousel(sender)
              continue
            } else if (text === "hillary clinton"){
              sendElectionCarousel(sender)
              continue
            }
            sendTextMessage(sender, "I heard: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})

const token = "EAAKfoECHuicBAJR0yZC16innQaC74xprrH3GhWrERehxcc0LnKNP0Dp9YXHJEAOW8L4SREdLhZC6hcZBwzF6AzwpAZCVUhgzuKWoRTGnQaTWdM14I0DxFwByj71zpOabIwac9CwiAcFmHJjtt9vyfd3yZCUA7Rsxn1ROoSrcCTAZDZD"

//Performs the actual sending of message
function callSendAPI(messageData){
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
    method: 'POST',
    json: messageData
  }, function (error, response, body){
    if (!error && response.statusCode == 200){
      let recipientId = body.recipient_id
      let messageId = body.message_id

      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId)
    } else {
      console.error("Unable to send message")
      console.error(response)
      console.error(error)
    }
  })
}

//Send an echo message
function sendTextMessage(recipient, text) {
    let messageData = {
      recipient: {
        id: recipient
      },
      message: {
        text: text
      }
    }

    callSendAPI(messageData)

}

function sendNPRCarousel(recipient){
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "NPR Home",
            subtitle: "Where news is at",
            item_url: "http://npr.org",
            image_url: "http://i.imgur.com/DMgmYeQ.jpg",
            buttons: [{
              type: "web_url",
              url: "http://npr.org",
              title: "Go to NPR"
            }]
          },{
            title: "Get More NPR",
            subtitle: "Where news is at",
            item_url: "http://npr.org",
            image_url: "http://i.imgur.com/DMgmYeQ.jpg",
            buttons: [{
              type: "web_url",
              url: "http://npr.org",
              title: "More NPR"
            }]
          }, {
            title: "Not enough?",
            subtitle: "Where news is at",
            item_url: "http://npr.org",
            image_url: "http://i.imgur.com/DMgmYeQ.jpg",
            buttons: [{
              type: "web_url",
              url: "http://npr.org",
              title: " Yet MORE NPR"
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData);
}

function sendSpaceCarousel(recipient){
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Mars Lander May Have Exploded",
            subtitle: "Crazy, right?",
            item_url: "http://www.npr.org/sections/thetwo-way/2016/10/21/498861588/schiaparelli-mars-lander-seems-to-have-crashed-on-impact-european-agency-says",
            image_url: "http://i.imgur.com/gIHN8V5.png",
            buttons: [{
              type: "web_url",
              url: "http://www.npr.org/sections/thetwo-way/2016/10/21/498861588/schiaparelli-mars-lander-seems-to-have-crashed-on-impact-european-agency-says",
              title: "Read More"
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData);
}

function sendCuteCarousel(recipient){
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "2016 Comedy Wildlife Photo Finalists",
            subtitle: "So cute!",
            item_url: "http://www.npr.org/sections/thetwo-way/2016/10/21/498598369/photos-finalists-for-the-2016-comedy-wildlife-photography-awards",
            image_url: "http://i.imgur.com/MlbszHP.png",
            buttons: [{
              type: "web_url",
              url: "http://www.npr.org/sections/thetwo-way/2016/10/21/498598369/photos-finalists-for-the-2016-comedy-wildlife-photography-awards",
              title: "Read More"
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData);
}

function sendElectionCarousel(recipient){
  var messageData = {
    recipient: {
      id: recipient
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Trump Turns Roast Into Fire",
            subtitle: "This guy...",
            item_url: "http://www.npr.org/2016/10/21/498804666/clinton-trump-trade-barbs-at-al-smith-dinner",
            image_url: "http://i.imgur.com/RDoOPrN.png",
            buttons: [{
              type: "web_url",
              url: "http://www.npr.org/2016/10/21/498804666/clinton-trump-trade-barbs-at-al-smith-dinner",
              title: "Read More"
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData);
}
