const request = require("supertest")
const baseURL = 'localhost:3000'

describe("POST /status", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules() // Most important - it clears the cache
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });


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
        process.env.SERVER = 'localhost:3000'

        const response = await request(baseURL).post("/status").send(sampleSuccessStatus);
        expect(response.statusCode).toBe(200);
    });

    it("should return 201 in error case", async () => {
        process.env.SERVER = 'localhost:3000'
        
        const response = await request(baseURL).post("/status").send(sampleErrorStatus);
        expect(response.statusCode).toBe(201);
    })
});