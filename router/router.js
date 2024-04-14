// Define your routes here
const express = require("express");
const axios = require("axios");

const router = express.Router();

// Your chatbot logic function
const chatbotLogic = (message) => {
    let response;

    // Convert the message to lowercase for case-insensitive matching
    const lowerCaseMessage = message.toLowerCase();

    if (lowerCaseMessage.includes("hii") || lowerCaseMessage.includes("hi")) {
        response = "Hello!";
    } else if (lowerCaseMessage.includes("help")) {
        response = "Sure, how can I assist you?";
    } else {
        response = "I'm sorry, I didn't understand that.";
    }

    return response;
};

// Function to send message using Picky Assist Push API
const sendMessage = async (number, message) => {
    try {
        const response = await axios.post("https://pickyassist.com/app/api/v2/push", {
            token: "YOUR_API_TOKEN", // Replace with your actual API token
            data: [
                {
                    number: number,
                    message: message,
                },
            ],
        });
        console.log("Message sent successfully:", response.data);
    } catch (error) {
        console.error("Error sending message:", error.message);
    }
};

// Route to handle incoming webhook events
router.post("/webhook", async (req, res) => {
    try {
        const { body } = req;
        const { token, data } = body; // Extract token and data from request body

        if (!token || !data || !data.length) {
            return res.status(400).send("Invalid request data");
        }

        // Prepare the response data object
        const responseData = {
            status: 100,
            push_id: "7478630",
            message: "Success",
            data: [],
        };

        // Iterate over each message in the data array
        for (const message of data) {
            const { number, message: text } = message;

            // Process the message using chatbot logic
            const response = chatbotLogic(text);

            // Prepare the data object for the response
            const responseDataItem = {
                msg_id: Math.floor(Math.random() * 10000000).toString(), // Generate a random msg_id
                number: number,
                credit: "0.005", // Assuming a fixed credit value for each message
            };

            // Push the responseDataItem to the responseData array
            responseData.data.push(responseDataItem);

            // Send the response back to Picky Assist
            await sendMessage(number, response);
        }

        // Send the response data
        res.status(200).json(responseData);
    } catch (error) {
        console.error("Error processing messages:", error.message);
        res.status(500).json({ error: "Failed to process messages" });
    }
});

// Route to handle sending messages from Picky Assist Push API
router.post("/send-message", async (req, res) => {
    try {
        const { number, message } = req.body; // Extract recipient number and message from request body

        // Send the message using Picky Assist Push API
        await sendMessage(number, message);

        res.status(200).send("Message sent successfully");
    } catch (error) {
        console.error("Error sending message:", error.message);
        res.status(500).json({ error: "Failed to send message" });
    }
});

module.exports = router;
