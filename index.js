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
            } else if (text === 'story me'){
              sendStory(sender)
            }
            sendTextMessage(sender, "I heard: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})

const token = "EAAKfoECHuicBANGrXz02ZAffyw3t7p92w1ZBCGp3ZAx5HsEKNS2wYHZCtXd8NGZCPctvQAr6qbMiRE2C0xGk0WmY0vy7omao1NITRF5rgIz3Rd46UGKnG2DegmVjj0rMUpKvPrIdavMdRl0Yke7SC2lfAw0EYZCihnU34eZAjucawZDZD"

const nprKey = "MDI5MTA5MjQ3MDE0ODE4MTU1NTM5ZWNkMQ000"

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

function sendStory(recipient){
  request({
    uri: 'http://api.npr.org/query?id=505630205&output=json&apiKey=MDI5MTA5MjQ3MDE0ODE4MTkxMTIwZTgyYQ000',
    method: 'GET',
  }, function (error, response, body){
    if(error){
      console.log("SOMETHING BROKE HERE")
    } else{
    let thisStory = JSON.parse(body)
    let storyLink = thisStory.list.story.link[0].$text
    let storyTitle = thisStory.list.story.title.$text
    let storyTeaser = thisStory.list.story.teaser.$text

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
              title: storyTitle,
              subtitle: storyTeaser,
              item_url: storyLink,
              buttons: [{
                type: "web_url",
                url: storyLink,
                title: "Read More"
              }]
            }]
          }
        }
      }
    }

    callSendAPI(messageData)

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
