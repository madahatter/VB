const cookieParser = require('cookie-parser')
const Nexmo = require('nexmo')

const fs = require('fs')

let registeredUsers = JSON.parse(fs.readFileSync('db/registeredUsers.json'))
let quotesByUser = JSON.parse(fs.readFileSync('db/quotesByUser.json'))
let quotesByMan = JSON.parse(fs.readFileSync('db/quotesByMan.json'))
let allQuotes = JSON.parse(fs.readFileSync('db/allQuotes.json'))
let dealerUsers = JSON.parse(fs.readFileSync('db/dealerUsers.json'))
let bidsByDealer = JSON.parse(fs.readFileSync('db/bidsByDealer.json'))
let bidsByQuote = JSON.parse(fs.readFileSync('db/bidsByQuote.json'))
let allBids = JSON.parse(fs.readFileSync('db/allBids.json'))
let winningBids = JSON.parse(fs.readFileSync('db/winningBids.json'))
//let manufacturers = JSON.parse(fs.readFileSync('db/manufacturers.json'))
let honda = JSON.parse(fs.readFileSync('db/manufacturers/honda.json'))
let acura = JSON.parse(fs.readFileSync('db/manufacturers/acura.json'))


function register(regEmail, regPassword, regFirstName, regLastName, regAddress, regCity, regProvince, regPostalcode, regPhone) {
    //console.log(regPassword, "HERE")
    if (!registeredUsers[regEmail]) {
        registeredUsers[regEmail] = {
            email: regEmail,
            password: regPassword,
            firstName: regFirstName,
            lastName: regLastName,
            address: regAddress,
            city: regCity,
            province: regProvince,
            postalcode: regPostalcode,
            phone: "1" + regPhone,
            isAdmin: "false",
            userID: Math.floor(Math.random() * 1000000000000),
            quotes: []
        }
        fs.writeFileSync('db/registeredUsers.json', JSON.stringify(registeredUsers))
        return ({ success: true, user: registeredUsers[regEmail] })
    }
    else {
        return ({ success: false })
    }
}

function dealerRegister(regEmail, regPassword, regFirstName, regLastName, regDealerName, regAddress, regCity, regProvince, regPostalcode, regPhone, regManufacturer) {
    //console.log(regPassword, "HERE")
    if (!dealerUsers[regEmail]) {
        dealerUsers[regEmail] = {
            email: regEmail,
            password: regPassword,
            firstName: regFirstName,
            lastName: regLastName,
            dealerName: regDealerName,
            address: regAddress,
            city: regCity,
            province: regProvince,
            postalcode: regPostalcode,
            phone: "1" + regPhone,
            manufacturer: regManufacturer,
            activated: "false",
            dealerID: Math.floor(Math.random() * 1000000000000),
            bids: ""
        }
        fs.writeFileSync('db/dealerUsers.json', JSON.stringify(dealerUsers))
        return ({ success: true, user: dealerUsers[regEmail] })
    }
    else {
        return ({ success: false })
    }
}

function login(regEmail, regPassword) {
    if (registeredUsers[regEmail]) {
        if (registeredUsers[regEmail].password === regPassword) {
            return ({ success: true, user: registeredUsers[regEmail] })
        }
        else {
            return ({ success: false })
        }
    }
    else {
        return ({ success: false })
    }
}

function dealerLogin(regEmail, regPassword) {
    if (dealerUsers[regEmail].password === regPassword) {
        return ({ success: true, user: dealerUsers[regEmail] })
    }
    else {
        return ({ success: false })
    }
}



function saveQuotesUser(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp) {
    if (!quotesByUser[email]) {
        quotesByUser[email] = [{ email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, vehicleImage, randomQuoteNumber: randomQuoteNumber, timeStamp }]
    }
    else {
        quotesByUser[email] = quotesByUser[email].concat({ email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, vehicleImage, randomQuoteNumber: randomQuoteNumber, timeStamp })
    }
    fs.writeFileSync('db/quotesByUser.json', JSON.stringify(quotesByUser))
}

function saveQuotesMan(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp) {
    if (!quotesByMan[make]) {
        quotesByMan[make] = [{ email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, vehicleImage, randomQuoteNumber: randomQuoteNumber, timeStamp }]
    }
    else {
        quotesByMan[make] = quotesByMan[make].concat({ email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, vehicleImage, randomQuoteNumber: randomQuoteNumber, timeStamp })
    }
    fs.writeFileSync('db/quotesByMan.json', JSON.stringify(quotesByMan))
}

function saveQuotes(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp) {
    if (!allQuotes[randomQuoteNumber]) {
        allQuotes[randomQuoteNumber] = { email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, vehicleImage, randomQuoteNumber: randomQuoteNumber, timeStamp }
    }
    fs.writeFileSync('db/allQuotes.json', JSON.stringify(allQuotes))
}

function submitQuote(parsed) {
    let email = parsed.email
    let make = parsed.make
    let model = parsed.model
    let trim = parsed.trim
    let color = parsed.color
    let financeTerm = parsed.financeTerm
    let financeType = parsed.financeType
    let annualMileage = parsed.annualMileage
    let cashDown = parsed.cashDown
    let clientNotes = parsed.clientNotes
    let vehicleImage = parsed.vehicleImage
    let timeStamp = Date.now()
    if (!email) {
        return ({ success: false })
    }
    //duplicate entry in quotesby user when making first quote
    if (email) {
        let randomQuoteNumber = (Math.floor(Math.random() * 1000000000 + 1))
        if (!registeredUsers[email].quotes) {
            registeredUsers[email].quotes = randomQuoteNumber
            saveQuotesUser(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp)
            saveQuotesMan(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp)
            saveQuotes(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp)
        }
        else {
            registeredUsers[email].quotes = registeredUsers[email].quotes.concat(randomQuoteNumber)
            saveQuotesUser(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp)
            saveQuotesMan(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp)
            saveQuotes(email, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, randomQuoteNumber, vehicleImage, timeStamp)
            //console.log(randomQuoteNumber)
        }
    }
    fs.writeFileSync('db/registeredUsers.json', JSON.stringify(registeredUsers))
    return ({ success: true })
}

function saveBidsDealer(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber) {
    if (!bidsByDealer[dealerEmail]) {
        bidsByDealer[dealerEmail] = [{ dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber }]
    }
    else {
        bidsByDealer[dealerEmail] = bidsByDealer[dealerEmail].concat({ dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber })
    }
    fs.writeFileSync('db/bidsByDealer.json', JSON.stringify(bidsByDealer))
}

function saveBidsQuote(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber) {
    if (!bidsByQuote[quoteNumber]) {
        bidsByQuote[quoteNumber] = [{ dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber }]
    }
    else {
        bidsByQuote[quoteNumber] = bidsByQuote[quoteNumber].concat({ dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber })
    }
    fs.writeFileSync('db/bidsByQuote.json', JSON.stringify(bidsByQuote))
}

function saveBids(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber) {
    if (!allBids[bidNumber]) {
        allBids[bidNumber] = { dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber }
    }
    fs.writeFileSync('db/allBids.json', JSON.stringify(allBids))

}


function submitBid(parsed) {
    let dealerEmail = parsed.dealerEmail
    let quoteNumber = parsed.quoteNumber
    let make = parsed.make
    let model = parsed.model
    let trim = parsed.trim
    let color = parsed.color
    let financeTerm = parsed.financeTerm
    let financeType = parsed.financeType
    let annualMileage = parsed.annualMileage
    let cashDown = parsed.cashDown
    let clientNotes = parsed.clientNotes
    let bidNotes = parsed.bidNotes
    let dueOnDelivery = parsed.dueOnDelivery
    let vehicleImage = parsed.vehicleImage
    let monthlyPayment = parsed.monthlyPayment
    if (!dealerEmail) {
        return ({ success: false })
    }
    if (dealerEmail) {
        let bidNumber = (Math.floor(Math.random() * 1000000000000 + 1))
        if (!dealerUsers[dealerEmail].bids) {
            dealerUsers[dealerEmail].bids = bidNumber
            saveBidsDealer(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber)
            saveBidsQuote(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber)
            saveBids(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber)
        }
        else {
            dealerUsers[dealerEmail].bids = dealerUsers[dealerEmail].bids.concat(bidNumber)
            saveBidsDealer(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber)
            saveBidsUser(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber)
            saveBids(dealerEmail, quoteNumber, make, model, trim, color, financeTerm, financeType, annualMileage, cashDown, clientNotes, bidNotes, dueOnDelivery, vehicleImage, monthlyPayment, bidNumber)
            //console.log(randomQuoteNumber)
        }
    }
    fs.writeFileSync('db/registeredUsers.json', JSON.stringify(registeredUsers))
    return ({ success: true })
}

function getQuoteHistory(email) {
    if (quotesByUser[email]) {
        return ({ success: true, quotes: quotesByUser[email], quotesToShow: true, loggedIn: true })
    }
    return ({ quotesToShow: false, loggedIn: true })
}

function getQuoteRequests(email) {
    let quoteManufacturer = dealerUsers[email].manufacturer
    //console.log(quoteManufacturer)
    if (quotesByMan[quoteManufacturer]) {
        if (bidsByDealer[email]) {
            let dealerQuotes = bidsByDealer[email].map(bid => bid.quoteNumber)
            return ({ success: true, quotes: quotesByMan[quoteManufacturer], alreadyQuoted: dealerQuotes })
        }
        return ({ success: true, quotes: quotesByMan[quoteManufacturer] })
    }
    return ({ success: false })
}

function getQuoteDetails(quoteNumber) {
    if (allQuotes[quoteNumber]) {
        //console.log(allQuotes[quoteNumber])
        return ({ success: true, quoteDetails: allQuotes[quoteNumber] })
    }
}

function getBidsOnQuote(quoteNumber) {
    //let quoteNum = quoteNumber
    //if(bidsByQuote[quoteNumber]) {
    //console.log(bidsByQuote[quoteNumber], "getBids")
    if (bidsByQuote[quoteNumber]) {
        return ({ success: true, bids: bidsByQuote[quoteNumber], winnerSelected: allQuotes[quoteNumber].winnerSelected, winningBid: allQuotes[quoteNumber].winningBid })
    }
    return ({ success: false })
    //}
}

function getCurrentBids(dealerEmail) {
    if (bidsByDealer[dealerEmail]) {
        return ({ success: true, bids: bidsByDealer[dealerEmail], winningBids })
    }
    return ({ success: false })
}

function saveWinningBid(bidNumber) {
    //console.log(bidNumber, "Winning Bid")
    let winningBid = bidNumber
    let quoteNumber = allBids[winningBid].quoteNumber
    //let winningDealer = allBids[winningBid].dealerEmail
    console.log(quoteNumber, "quotenumber")
    allQuotes[quoteNumber].winnerSelected = true,
        allQuotes[quoteNumber].winningBid = winningBid,
        winningBids[quoteNumber] = winningBid
    console.log(winningBids)
    //allBids[winningBid].isWinner = true
    fs.writeFileSync('db/allQuotes.json', JSON.stringify(allQuotes))
    fs.writeFileSync('db/winningBids.json', JSON.stringify(winningBids))

    return ({ success: true, winnerSelected: allQuotes[quoteNumber].winnerSelected, winningBid: allQuotes[quoteNumber].winningBid })
}

function getContactInfo(bidNumber) {
    let quoteNumber = allBids[bidNumber].quoteNumber
    let clientEmail = allQuotes[quoteNumber].email
    return ({ success: true, clientInfo: registeredUsers[clientEmail] })
}

function getModels(make) {
    // let temp = [make].toLowerCase()
    //  console.log(Object.values(honda))
    //    console.log(manufacturers[make])
    if (make === 'honda') {
        //console.log("TRUE")
        return ({ models: Object.values(honda) })
    }
    if (make === 'acura') {
        //console.log("TRUE")
        return ({ models: Object.values(acura) })
    }
    return ({ success: false })
}

function getTrim(make, model) {
    //   return({models : manufacturers[make]})
    //     return manufacturers[make].filter((vehicle, i, arr) => {
    //         // console.log(vehicle.model + "&&" + [model])
    //         if(vehicle.model == [models]){
    //         return({model: vehicle})
    //         }
    //     }
    // )
    if (make === 'honda') {
        //console.log(honda[model], "Model", model, "Make", make)
        return ({ options: honda[model] })
    }

    if (make === 'acura') {
        //console.log(honda[model], "Model", model, "Make", make)
        return ({ options: acura[model] })
    }

}

module.exports = {
    register,
    login,
    submitQuote,
    getQuoteHistory,
    dealerLogin,
    dealerRegister,
    getQuoteRequests,
    getQuoteDetails,
    submitBid,
    getBidsOnQuote,
    saveWinningBid,
    getCurrentBids,
    getContactInfo,
    getModels,
    getTrim
}