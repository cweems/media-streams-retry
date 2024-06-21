const request = require("supertest")
const baseURL = "http://localhost:3000"

describe("POST /incoming", () => {
    it("should return 200", async () => {
        const expectedResponse = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Response><Connect><Stream url=\"wss://http://localhost:3000/connection\" statusCallback=\"http://http://localhost:3000/status\"/></Connect><Redirect method=\"POST\">http://localhost:3000/retry</Redirect></Response>";

        const response = await request(baseURL).post("/incoming");
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe(expectedResponse);
    });
});