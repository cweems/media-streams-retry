require('dotenv').config();
const request = require("supertest")
const baseURL = `http://${process.env.SERVER}`;

describe("POST /retry", () => { 
    const sampleErrorStatus = {
        AccountSid: 'ACXXX',
        CallSid: 'CA123',
        StreamSid: 'MZXXX',
        StreamName: 'MyStream',
        StreamEvent: 'stream-error',
        StreamError: 'Detailed error message',
        Timestamp: 'ISO-TIMESTAMP'
    }

    const sampleSuccessStatus = {
        AccountSid: 'ACXXX',
        CallSid: 'CA123',
        StreamSid: 'MZXXX',
        StreamName: 'MyStream',
        StreamEvent: 'no-error',
        StreamError: 'Detailed error message',
        Timestamp: 'ISO-TIMESTAMP'
    }

    const sampleCallWebhook = {
        CallSid: 'CA123'
    }

    it("should return hangup if no error", async () => {

        await request(baseURL).post("/status").send(sampleSuccessStatus);
        const response = await request(baseURL).post("/retry").send(sampleCallWebhook);
 
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Hangup/></Response>");
    });

    it("should return stream if error", async () => {

        await request(baseURL).post("/status").send(sampleErrorStatus);
        const response = await request(baseURL).post("/retry").send(sampleCallWebhook);
 
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Connect><Stream url=\"wss://http://localhost:3000/connection\" statusCallback=\"http://http://localhost:3000/status\"/></Connect><Redirect method=\"POST\">http://localhost:3000/retry</Redirect></Response>");

        const response2 = await request(baseURL).post("/retry").send(sampleCallWebhook);
        expect(response2.statusCode).toBe(200);
        expect(response2.text).toBe("<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Hangup/></Response>")
    });
});