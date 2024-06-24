# Media Stream Retry Example

When using Twilio Media Streams, your server might occaisionally drop a connection with a `31921` error. This can happen for all sorts of reasons, for example a reboot on your hosting provider that closes the stream.

## How it Works

This sample app shows an approach to re-trying media stream connections when an error occurs. The entire app is contained in `app.js`. The steps it follows are:

1. Create an initial `<Stream>` TwiML with a statusCallback and `<Redirect>`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="wss://my.app/connection" statusCallback="https://my.app/status" statusCallbackMethod="POST"/>
    </Connect>
    <Redirect method="POST">/retry</Redirect>
</Response>
```

2. The app receives status events at `/status`. If the event is a `stream-error` event we store the call SID so that we know to retry the call.

Why don't we just update the call when we handle `/status`? This could create a race condition where the call is town down by Twilio since there would be no further TwiML to handle. Instead we wait for the `<Redirect>` to be hit.

3. The `<Redirect>` TwiML is reached and we send a request to `/retry`. This endpoint checks if the call experienced a stream error (stored from step 2). If there was an error, it re-issues the TwiML from step 1 and the stream starts again. If there was no error it will hang up the call.

## Running Locally

1. Clone the app
2. Run `npm install`
3. Run `npm run dev` to start the server
4. Start a tunneling service like `ngrok`: `ngrok http 3000`
5. Update your phone number's voice Webhook to be `https://[my-ngrok-url]/incoming`
6. Place a call to your phone number.

You should see a log of media streams interrupted and restarting every 5 seconds.