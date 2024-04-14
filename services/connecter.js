const axios = require("axios");
const { NlpManager } = require("node-nlp");
console.log("Starting Chatbot ...");

const manager = new NlpManager({ languages: ["en"] });
manager.load();

// This function sends messages to the Picky Assist API
async function sendMessage(message) {
    try {
        const response = await axios.post("https://pickyassist.com/app/url/4495f44f28fd5dff04a521c3a23e139ce6c3668e", message);
        console.log("Connector Connected Successfully:", response.data);
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
}

// Handle incoming webhook events
async function handleEvent(event) {
    // Extract the incoming message from the event
    const incomingMessage = event.message;

    // Process the incoming message using the NLP manager
    const response = await manager.process("en", incomingMessage.text);

    // Construct the outgoing message
    const outgoingMessage = {
        to: event.from,
        from: event.to,
        text: response.answer
    };

    // Send the outgoing message
    await sendMessage(outgoingMessage);
}

// Simulate an incoming webhook event (replace this with actual webhook integration)
const webhookEvent = {
    from: "whatsapp:+1234567890", // Sender's WhatsApp number
    to: "whatsapp:+0987654321",   // Your WhatsApp number
    message: {
        text: "Hello"  // Incoming message text
    }
};

// Handle the webhook event
handleEvent(webhookEvent);