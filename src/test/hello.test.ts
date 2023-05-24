import axios from "axios";
import { expect } from "chai";

describe("Query hello", () => {
  const urlDB = "http://localhost:4000//graphql";
  const query = `
        query Hello {
          hello
        }
      `;
  it("should return hello word", async () => {
    const response = await axios.post(urlDB, {
      query,
    });

    const expectedResponse = { data: { hello: "Hello Word!" } };
    expect(response.status).to.equal(200);
    expect(response.data).to.be.deep.eq(expectedResponse);
  });
});
