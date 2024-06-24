require('dotenv').config()
const request = require("supertest")
const baseURL = 'localhost:3000'

describe("POST /incoming", () => {
    it("should return 200", async () => {
        console.log(process.env.SERVER)
        const expectedResponse = `<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Connect><Stream url=\"wss://${process.env.SERVER}/connection\" statusCallback=\"https://${process.env.SERVER}/status\" statusCallbackMethod=\"POST\"/></Connect><Redirect method=\"POST\">/retry</Redirect></Response>`;

        const response = await request(baseURL).post("/incoming");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe(expectedResponse);
    });
});