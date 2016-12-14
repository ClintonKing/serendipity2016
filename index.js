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
            getUserInfo(sender, text)
            // if (text === 'NPR'){
            //   sendNPRCarousel(sender)
            //   continue
            // }
        }
    }
    res.sendStatus(200)
})

const token = "EAAKfoECHuicBACDODZBdjr1mPSuDJDBLCZCx69BDaWItKqcK5ULGYSBzYQ535gHWkgj4W4G0zjWjoLvYrI2hlMpjZBK1Ft63j4GegXit1QjeOaUqFesmTb5HM1bekKIap8ZCiR4PAaHcl8DBisZCajsls4HfgvCD2YWzNzCDLhQZDZD"

//Performs the actual sending of message
function callSendAPI(messageData){
  request({
    method: 'POST',
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:token},
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

//Get info about the user
function getUserInfo(sender){
  request({
    method: 'GET',
    url: 'https://graph.facebook.com/v2.6/${sender}',
    qs: {fields: 'first_name,last_name,profile_pic,locale,timezone,gender', access_token: token},
    json: true
  }, function (error, response, body){
      let firstName = body.first_name
      let lastName = body.last_name
      let profilePic = body.profile_pic
      sendTextMessage(sender, "Hi " + firstName + " " + lastName + ", I heard: " + text.substring(0, 200))
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

function _getQs (qs) {
  if (typeof qs === 'undefined') {
    qs = {}
  }
  qs['access_token'] = token

  if (this.debug) {
    qs['debug'] = this.debug
  }

  return qs
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
