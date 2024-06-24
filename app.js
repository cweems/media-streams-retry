require('dotenv').config();

const express = require('express');
const ExpressWs = require('express-ws');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
ExpressWs(app);

const PORT = process.env.PORT || 3000;

// Simple storage to track calls with failed
// media streams.
const storage = new Map();

const VoiceResponse = require('twilio').twiml.VoiceResponse;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Respond with the initial <Stream /> TwiML
// It also sets a stream status callback so that
// we get an event if the media stream fails.
app.post('/incoming', (req, res) => {
    console.log('incoming')
    try {
        const response = new VoiceResponse();
        const connect = response.connect();
        connect.stream({
            url: `wss://${process.env.SERVER}/connection`,
            statusCallback: `https://${process.env.SERVER}/status`,
            statusCallbackMethod: 'POST'
        });

        // This redirect will get called after the stream ends.
        // We'll use it to see if the stream ended due to an error.
        response.redirect({ method: 'POST' }, '/retry')
    
        res.type('text/xml');
        res.end(response.toString());
    } catch (err) {
        console.log(err);
    }
});

// 2. Handle status events and checks for stream errors
// If there's an error, we store the call SID so that we
// know to restart it.
app.post('/status', (req, res) => {
    console.log('Received status...')
    const { CallSid, StreamEvent } = req.body;
    console.log(req.body);
    if (StreamEvent === 'stream-error') {
        storage.set(CallSid, null);
        res.status(201)
        res.send('Websocket disconnect acknowledged');
        return;
    }

    console.log('Status endpoint - nothing to do');
    res.status(200)
    res.end();
})

// 3. Retry will be called by our <Redirect /> from step 1
// If the stream ended due to an error, we'll start another stream,
// otherwise we can just hang up the call.
app.post('/retry', async (req, res) => {
    const { CallSid } = req.body;
    const response = new VoiceResponse();

    // Wait in case webhook is late to arrive
    // This could be improved with a polling or evented
    // approach to check storage
    await sleep(2000)
    
    if (callErrored) {
        const connect = response.connect();
        connect.stream({
            url: `wss://${process.env.SERVER}/connection`,
            statusCallback: `https://${process.env.SERVER}/status`,
            statusCallbackMethod: 'POST'
        });
        response.redirect({ method: 'POST' }, '/retry');
    
        storage.delete(CallSid);
        res.type('text/xml');
        res.end(response.toString());
        
        return;
    }

    response.hangup();

    res.type('text/xml');
    res.end(response.toString());
})

// Handle websockets - dummy implementation
// Will terminate connection after 5 seconds
app.ws('/connection', (ws) => {
    ws.on('message', async (data) => {
        const msg = JSON.parse(data);

        if (msg.event === 'start') {
            console.log('This media stream will self-destruct in 5 seconds...')
            await sleep(5000)
            ws.terminate()
            console.log('Websocket closed...')
        } else if (msg.event === 'media') {
            console.log(msg)
        }
    });
});

app.listen(PORT);
console.log(`Server running on port ${PORT}`);
