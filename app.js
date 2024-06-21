require('dotenv').config();

const express = require('express');
const ExpressWs = require('express-ws');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
ExpressWs(app);

const PORT = process.env.PORT || 3000;

// Simple storage to track calls with failed
// media streams.
const storage = new Map();

const VoiceResponse = require('twilio').twiml.VoiceResponse;

// Responds with the initial <Stream /> TwiML
// It also sets a stream status callback so that
// we get an event if the media stream fails.
app.post('/incoming', (req, res) => {
    try {
        const response = new VoiceResponse();
        const connect = response.connect();
        connect.stream({
            url: `wss://${process.env.SERVER}/connection`,
            statusCallback: `http://${process.env.SERVER}/status`
        });

        // This redirect will get called after the stream ends.
        // We'll use it to see if the stream ended due to an error.
        response.redirect({ method: 'POST' }, `${process.env.SERVER}/retry`)
    
        res.type('text/xml');
        res.end(response.toString());
    } catch (err) {
        console.log(err);
    }
});

// Handles status events and checks for stream errors
// If there's an error, we store the call SID.
app.post('/status', (req, res) => {
    const { CallSid, StreamEvent } = req.body;

    if (StreamEvent === 'stream-error') {
        storage.set(CallSid, null);
        res.status(201)
        res.send('Error acknowledged');
        return;
    }

    res.end();
})

// Retry will be called by our <Redirect />
// If the stream ended due to an error, we'll start another stream,
// otherwise we can just hang up the call.
app.post('/retry', (req, res) => {
    const { CallSid } = req.body;
    const response = new VoiceResponse();

    if (storage.has(CallSid)) {
        const connect = response.connect();
        connect.stream({
            url: `wss://${process.env.SERVER}/connection`,
            statusCallback: `http://${process.env.SERVER}/status`
        });
        response.redirect({ method: 'POST' }, `${process.env.SERVER}/retry`)
    
        storage.delete(CallSid);
        res.type('text/xml');
        res.end(response.toString());
        
        return;
    }

    response.hangup();

    res.type('text/xml');
    res.end(response.toString());
})

app.ws('/connection', (ws) => {
    ws.on('message', (data) => {
        const msg = JSON.parse(data);

        if (msg.event === 'start') {
            console.log('This media stream will self-destruct in 5...')
            setTimeout(() => {
                console.log('4..')
            }, 1000);
    
            setTimeout(() => {
                console.log('3..')
            }, 1000)
    
            setTimeout(() => {
                console.log('2..')
            }, 1000)
    
            setTimeout(() => {
                console.log('1..')
            }, 1000)

            throw new Error('Cloudflare naptime ;-)');
        } else if (msg.event === 'media') {
            console.log(msg.media.payload)
        }
    });
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
