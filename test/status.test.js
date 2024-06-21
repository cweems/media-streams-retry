const request = require("supertest")
const baseURL = "http://localhost:3000"

describe("POST /status", () => {
    const sampleSuccessStatus = {
        AccountSid: 'ACXXX',
        CallSid: 'CAXXX',
        StreamSid: 'MZXXX',
        StreamName: 'MyStream',
        StreamEvent: 'stream-start',
        StreamError: 'Detailed error message',
        Timestamp: 'ISO-TIMESTAMP'

    }
    
    const sampleErrorStatus = {
        AccountSid: 'ACXXX',
        CallSid: 'CAXXX',
        StreamSid: 'MZXXX',
        StreamName: 'MyStream',
        StreamEvent: 'stream-error',
        StreamError: 'Detailed error message',
        Timestamp: 'ISO-TIMESTAMP'

    }

    it("should return 200", async () => {
        const response = await request(baseURL).post("/status").send(sampleSuccessStatus);
        expect(response.statusCode).toBe(200);
    });

    it("should return 201 in error case", async () => {
        const response = await request(baseURL).post("/status").send(sampleErrorStatus);
        expect(response.statusCode).toBe(201);
    })
});