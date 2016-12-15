'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()
const numbers = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]

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
          if (event.message.quick_reply){
            let payload = event.message.quick_reply.payload
            if (payload === 'story me'){
              sendStory(sender)
              continue
            }
          }
          let text = event.message.text
          sendTextMessage(sender)
        }
        if (event.postback && event.postback.payload){
          let payload = event.postback.payload
          if (payload === 'new user'){
            getStarted(sender)
            continue
          }
        }
    }
    res.sendStatus(200)
})

const token = "EAAKfoECHuicBANGrXz02ZAffyw3t7p92w1ZBCGp3ZAx5HsEKNS2wYHZCtXd8NGZCPctvQAr6qbMiRE2C0xGk0WmY0vy7omao1NITRF5rgIz3Rd46UGKnG2DegmVjj0rMUpKvPrIdavMdRl0Yke7SC2lfAw0EYZCihnU34eZAjucawZDZD"

const nprKey = "MDI5MTA5MjQ3MDE0ODE4MTkxMTIwZTgyYQ000"

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

//Performs the actual sending of message
function setThreadSettings(){
  request({
    uri: 'https://graph.facebook.com/v2.6/me/thread_settings',
    qs: {access_token:token},
    method: 'POST',
    json: {
      setting_type:"call_to_actions",
      thread_state:"new_thread",
      call_to_actions:[
        {
          payload:"new user"
        }
      ]
    }
  }, function (error, response, body){

  })
}
setThreadSettings()

function getStarted(recipient){
  let messageData = {
    recipient: {
      id: recipient
    },
    message: {
      text: "Hi there! Let me know if you'd like to read a new story from NPR.org",
      quick_replies:[
      {
        content_type:"text",
        title:"Send me a new story.",
        payload:"story me"
      }
      ]
    }
  }
  callSendAPI(messageData)
}

function sendStory(recipient){
  var rando = numbers[Math.floor(Math.random() * numbers.length)]
  request({
    uri: 'http://api.npr.org/query',
    qs:{
      output:"json",
      numResults:25,
      apiKey:nprKey
    },
    method: 'GET',
  }, function (error, response, body){
    if(error){
      console.log("SOMETHING BROKE HERE")
    } else{
    let thisStory = JSON.parse(body)
    let storyLink = thisStory.list.story[rando].link[0].$text
    let storyTitle = thisStory.list.story[rando].title.$text
    let storyTeaser = thisStory.list.story[rando].teaser.$text

    let messageData = {
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
        },
        quick_replies:[
        {
          content_type:"text",
          title:"Send me a new story.",
          payload:"story me"
        }
        ]
      }
    }

    callSendAPI(messageData)

    }
  })
}

//Send an echo message
function sendTextMessage(recipient) {
    let messageData = {
      recipient: {
        id: recipient
      },
      message: {
        text: "Sorry, please use the buttons to respond",
        quick_replies:[
        {
          content_type:"text",
          title:"Send me a new story.",
          payload:"story me"
        }
        ]
      }
    }

    callSendAPI(messageData)

}

// function getUserInfo(userId){
//   request({
//     uri: 'http://api.npr.org/query?output=json&numResults=25&apiKey=MDI5MTA5MjQ3MDE0ODE4MTkxMTIwZTgyYQ000',
//     qs:{
//       output:"json",
//       numResults:25,
//       apiKey:nprKey
//     },
//     method: 'GET',
//   }, function (error, response, body){
//
//   })
// }
