const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { NlpManager } = require("node-nlp");
const manager = new NlpManager({ languages: ["en"] });

const app = express();
const port = 3000;

// Replace these placeholders with your actual URLs and token
const pickyAssistConnectorUrl = "https://pickyassist.com/app/url/44f1cc54ff9e6623aa3bddeb27879606ca5d9c70";
const pushApiUrl = "https://pickyassist.com/app/api/v2/push";
const token = "e824176ffed0459b5313cd622f145a6a5d883191"; // Replace with your actual token

app.use(bodyParser.json());
app.get('/',(req,res)=>{
    res.send("connected");
})

// Function to handle incoming webhook events
async function handleEvent(webhookEvent) {
    try {
        // Extract necessary information from the webhook event
        const { data } = webhookEvent;

        // Iterate over each message in the data array
        for (const message of data) {
            const { number, message: text } = message;

            // Check if the message is valid
            if (number && text) {
                const response = await manager.process("en", text);

                // Send response to Picky Assist
                await sendMessageToPickyAssist(number, response.answer);
                await sendResponseToUser(number, response.answer);
            } else {
                console.error("Invalid message:", message);
            }
        }

        return true;
    } catch (error) {
        console.error("Error handling webhook event:", error.message);
        throw error;
    }
}

// Function to send message to Picky Assist
async function sendMessageToPickyAssist(to, text) {
    try {
        const response = await axios.post(pickyAssistConnectorUrl, {
            token,
            application: 10, // WhatsApp Web Automation
            data: [{
                number: to,
                message: text
            }]
        });
        console.log("Message sent successfully to Picky Assist:", response.data);
    } catch (error) {
        console.error("Error sending message to Picky Assist:", error.message);
        throw error;
    }
}

// Function to send response to user
async function sendResponseToUser(userNumber, message) {
    try {
        console.log("Sending response to user:", message);
      //  message="Hello chatBot";
        const pushMessage = {
            token,
            application: 10, // WhatsApp Web Automation
            data: [{
                number: userNumber,
                message
            }]
        };
        const pushApiResponse = await axios.post(pushApiUrl, pushMessage);
        console.log("Response sent to user successfully using Push API:", pushApiResponse.data);
    } catch (error) {
        console.error("Error sending response to user using Push API:", error.message);
        throw error;
    }
}

// Route to handle incoming webhook events
app.post("/webhook", async (req, res) => {
    try {
        const webhookEvent = req.body;
        await handleEvent(webhookEvent); // Handle the incoming webhook event
        res.sendStatus(200); // Send success response
    } catch (error) {
        res.status(500).send("Internal Server Error"); // Send error response
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
