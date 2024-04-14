const twilio = require('twilio');
const responseService = require('../services/connecter');

// Handle incoming messages
exports.handleMessage = (req, res) => {
    const twiml = new twilio.twiml.MessagingResponse();
    const message = req.body.Body;

    // Generate response
    const response = responseService.generateResponse(message);

    // Sending response back to the user
    twiml.message(response);
    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
};
