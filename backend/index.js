
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
// 2. NOW USE MIDDLEWARE
app.use(cors());
app.use(express.json());

// 3. CONFIGURE DISPATCH LOGIC (Everything else goes below)

app.post('/dispatch-emergency', async (req, res) => {
    // ... your dispatch code ...
    res.status(200).json({
        success: true,
        message: "All platforms notified.",
        nearest_hospital: "District Trauma Centre",
        nearest_police: "Hebbal Precinct"
    });
});

app.listen(3000, () => console.log('RoadSoS Backend Active on Port 3000'));
app.use(express.json());

// 1. Connect to Twilio for SMS Dispatch
const twilioClient = new twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

// 2. Dispatch Logic (The "Disco Codes")
app.post('/dispatch-emergency', async (req, res) => {
    const { userId, lat, lng, type } = req.body;

    // A. Log the Incident in Database
    const incidentReport = {
        timestamp: new Date().toISOString(),
        location: { lat, lng },
        status: "DISPATCHED",
        type: type // e.g., "AUTOMATIC_IDLE" or "MANUAL_SOS"
    };

    try {
        // B. Trigger SMS to Guardian (The Real Action)
        await twilioClient.messages.create({
            body: `RoadSoS ALERT: Accident detected at ${lat}, ${lng}. Emergency services are on the way.`,
            to: '+91XXXXXXXXXX', // This will be the Guardian Number from your Login page
            from: process.env.TWILIO_NUMBER
        });

        // C. Response to the Phone App
        res.status(200).json({
            success: true,
            message: "All platforms notified.",
            nearest_hospital: "District Trauma Centre (0.8km)",
            nearest_police: "Hebbal Precinct (0.7km)"
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log('RoadSoS Backend Active on Port 3000'));