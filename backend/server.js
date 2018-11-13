const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const leaseBidder = require('./leasebidder')
const cookieParser = require('cookie-parser')
const Nexmo = require('nexmo')

app.use(bodyParser.raw({type: '*/*'}))
app.use(cookieParser())

let sessionInfo = {}

app.get('/quotehistory', (req, res) => {
    let sessionID = req.cookies.session
    let email = req.query.email
    console.log(sessionInfo, " id: ", sessionID)

    if(sessionInfo[sessionID]){
        //console.log(sessionInfo[sessionID].firstName, "SesID")
    res.send(JSON.stringify(leaseBidder.getQuoteHistory(email)));
    }
   else{
   console.log("NO Session info")
    res.send(JSON.stringify({loggedIn: false}))
    }
});

app.get('/viewquoterequests', (req, res) => {
    let email = req.query.email
    res.send(JSON.stringify(leaseBidder.getQuoteRequests(email)));
});

app.post('/sendphonenum', (req, res) => {
    let sessionID = req.cookies.session;
    let parsed = JSON.parse(req.body.toString())
    let NEXMO_TO_NUMBER = parsed.phone
    let nexmo = new Nexmo({apiKey: '02e28309', apiSecret: 'MQdoIwWkZrDrvvD7'});
    let verifyRequestId = null; // use in the check process
    nexmo.verify.request({number: NEXMO_TO_NUMBER, brand: "Vehicle Barn"}, function(err, result) {
        if(err) { 
            console.error(err); 
            res.send(JSON.stringify({success: false}))
        }
        else {
          verifyRequestId = result.request_id;
              sessionInfo[sessionID].requestID = verifyRequestId
          console.log('request_id', verifyRequestId);
          res.send(JSON.stringify({success: true, verifyRequestId}))
        }
    //console.log(parsed)
})

})

app.post('/verifycode', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    let requestId = parsed.requestID
    let code = parsed.userCode
    let nexmo = new Nexmo({apiKey: '02e28309', apiSecret: 'MQdoIwWkZrDrvvD7'});   
    console.log("Code: " + code + " Request ID: " + requestId);
   
    nexmo.verify.check({request_id: requestId, code: code}, (err, result) => {
      if(err) {
        console.log(err);
   
        //Oops! Something went wrong, respond with 500: Server Error
        res.status(500).send(err);
      } else {
        console.log(result)
   
        if(result && result.status == '0') {
          //A status of 0 means success! Respond with 200: OK
          res.send(JSON.stringify({success: true}));
          console.log('Account verified!')
        } else {
          //A status other than 0 means that something is wrong with the request. Respond with 400: Bad Request
          //The rest of the status values can be found here: https://developer.nexmo.com/api/verify#status-values
          res.send(JSON.stringify({success: false}));
          console.log('Error verifying account')
        }
      }
    });
  });



app.post('/register', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    //console.log(parsed)
    res.send(JSON.stringify(leaseBidder.register(parsed.email, parsed.password, parsed.firstName, parsed.lastName, parsed.address, parsed.city, parsed.province, parsed.postalcode, parsed.phone)))
})

app.post('/dealerregister', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    //console.log(parsed)
    res.send(JSON.stringify(leaseBidder.dealerRegister(parsed.email, parsed.password, parsed.firstName, parsed.lastName, parsed.dealerName, parsed.address, parsed.city, parsed.province, parsed.postalcode, parsed.phone, parsed.manufacturer)))
})

app.post('/login', (req, res) => {
    let sessionID = req.cookies.session;
    let parsed = JSON.parse(req.body.toString())
    if(sessionInfo[sessionID]) {
        res.send(JSON.stringify(leaseBidder.login(parsed.email, parsed.password)))
    }
    else{
        sessionInfo[sessionID] = {quotes: {}, firstName: '', lastName: '', requestID: '' }
        res.send(JSON.stringify(leaseBidder.login(parsed.email, parsed.password)))
    }

})

app.post('/dealerlogin', (req, res) => {
    let sessionID = req.cookies.session;
    let parsed = JSON.parse(req.body.toString())
    //console.log(parsed.password)
    res.send(JSON.stringify(leaseBidder.dealerLogin(parsed.email, parsed.password)))
})

app.post('/submitquote', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    console.log(parsed)
    res.send(JSON.stringify(leaseBidder.submitQuote(parsed)))
})

app.post('/savewinningbid', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    //console.log(parsed.bidNumber, "BIDNUMBER")
    res.send(JSON.stringify(leaseBidder.saveWinningBid(parsed.bidNumber)))
})


app.post('/submitbid', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    //console.log(parsed, "submitBid")
    res.send(JSON.stringify(leaseBidder.submitBid(parsed)))
})

app.get('/contactclient', (req, res) => {
    //console.log("FETCH /bids")
    let bidNumber = req.query.bidNumber
    //console.log(quoteNumber)
    res.send(JSON.stringify(leaseBidder.getContactInfo(bidNumber)));
});

//returning undefined for on front end
app.get('/bids', (req, res) => {
    let sessionID = req.cookies.session    
    //console.log("FETCH /bids")
    let quoteNumber = req.query.bids
    //console.log(quoteNumber)
    res.send(JSON.stringify(leaseBidder.getBidsOnQuote(quoteNumber)));
});

app.get('/session', (req, res) => { 
    let sessionID = req.cookies.session
    //console.log(sessionID)
    if (!sessionInfo[sessionID]) {
        sessionID = Math.floor(Math.random() * 100000000)
        sessionInfo[sessionID] = {quotes: {}, firstName: '', lastName: '' };
        console.log(sessionInfo[sessionID], sessionID)
        res.cookie('session', sessionID, { expires: new Date(Date.now() + (1000 * 60 * 60 * 24)) });
    }
    res.send(JSON.stringify({ success: true, sessionID, ...sessionInfo[sessionID] }))
})


app.get('/quotedetails', (req, res) => {
    //console.log("FETCH HERREE")
    let quoteNumber = req.query.quoteNumber
    //console.log("quoteNumber")
    res.send(JSON.stringify(leaseBidder.getQuoteDetails(quoteNumber)));
});

app.get('/currentbids', (req, res) => {
    //console.log("FETCH HERREE")
    let dealerEmail = req.query.dealerEmail
    //console.log("quoteNumber")
    res.send(JSON.stringify(leaseBidder.getCurrentBids(dealerEmail)));
});

app.get('/vehiclemodels', (req, res) => {
    let sessionID = req.cookies.session
    console.log("FETCHh", sessionID)
    let makes = req.query.make  
    res.send(JSON.stringify(leaseBidder.getModels(makes)));
});

app.get('/vehicletrim', (req, res) => {
    //console.log("Trim")
    let make = req.query.make   
    let model = req.query.model
    res.send(JSON.stringify(leaseBidder.getTrim(make, model)));
});

app.post('/reviewquote', (req, res) => {
    let parsed = JSON.parse(req.body.toString())
    let sessionID = req.cookies.session
    //console.log(parsed, "reviewQuote")
    if(sessionInfo[sessionID]){
        sessionInfo[sessionID].quotes = parsed
        console.log(sessionInfo[sessionID], "reviewquote", sessionID)
    }
    
    // res.send(JSON.stringify(leaseBidder.submitBid(parsed)))
})

app.get('/viewquote', (req, res) => {
    let sessionID = req.cookies.session
    console.log(sessionInfo[sessionID], "viewqujote", sessionID)
    if(sessionInfo[sessionID]) {
        res.send(JSON.stringify(sessionInfo[sessionID].quotes))
    }
})

app.listen(3001, function() {
    console.log("Server working")
})