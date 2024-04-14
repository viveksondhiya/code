const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const port = 3000;

// Replace these placeholders with your actual URLs and token
const pickyAssistConnectorUrl = "https://pickyassist.com/app/url/afd5b4c0705dbb4a4df681cf59ce61fe99ff2fc1";
const pushApiUrl = "https://pickyassist.com/app/api/v2/push";
const token = "05441c807d74cc9db31a0ef8a8f88db9f3aa87c5"; // Replace with your actual token

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("connected");
})

// Route to handle incoming webhook events from Picky Assist
app.post("/pickyassist-webhook", async (req, res) => {
    try {
        const webhookData = req.body;
        console.log("Received webhook event:", webhookData);

        // Extract necessary information from the webhook event
        const { number, "message-in": text } = webhookData;
        console.log("msg :",message)

        // Check if the message is valid
        if (number && text) {
            // Send response to Picky Assist
            await sendResponseToPickyAssist("Test Instant Reply Back", number);

            // Send response to the user
            await sendResponseToUser("Test Instant Reply Back", number);

            // Send acknowledgment response in the correct format
            res.json({ "message-out": "this is an automatic reply", "delay": 0 });
        } else {
            console.error("Invalid message received from Picky Assist:", webhookData);
            res.status(400).send("Invalid message received from Picky Assist");
        }
    } catch (error) {
        console.error("Error handling webhook event:", error.message);
        res.status(500).send("Internal Server Error");
    }
});


// Function to send response to Picky Assist
async function sendResponseToPickyAssist(message, to) {
    try {
        const response = await axios.post(pickyAssistConnectorUrl, {
            token,
            application: 1, // Replace with your application ID
            data: [{
                number: to,
                message
            }]
        });
        console.log("Response sent successfully to Picky Assist:", response.data);
    } catch (error) {
        console.error("Error sending response to Picky Assist:", error.message);
        throw error;
    }
}

// Function to send response to user
async function sendResponseToUser(message, to) {
    try {
        const response = await axios.post(pushApiUrl, {
            token,
            application: 10, // WhatsApp Web Automation
            data: [{
                number: to,
                message
            }]
        });
        console.log("Response sent successfully to user:", response.data);
    } catch (error) {
        console.error("Error sending response to user:", error.message);
        throw error;
    }
}

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
