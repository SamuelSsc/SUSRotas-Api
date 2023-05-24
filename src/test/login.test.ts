import axios from "axios";
import { User } from "../entity";
import { ClearDb, dataSource } from "../data-source";
import { expect } from "chai";
import { CreateUser } from "../utils/create-user";

describe("Mutation Login", () => {
  afterEach(async function () {
    await ClearDb();
  });

  beforeEach(async function () {
    await CreateUser({});
  });

  const mutation = `mutation login($data:LoginInput!){
  login(data:$data){
    user{
          id
          name
          email
          birthDate
      }
      token
    }
  }`;

  let input: {
    email: string;
    password: string;
    rememberMe: boolean;
  };

  const urlDB = "http://localhost:4000/graphql";

  it("should return login", async () => {
    input = {
      email: "Samuelssc5874@gmail.com",
      password: "1234qwer",
      rememberMe: true,
    };

    const userDB = await dataSource.findOneBy(User, {
      email: input.email,
    });
    const response = await axios.post(urlDB, {
      variables: {
        data: input,
      },
      query: mutation,
    });

    const expectedResponse = {
      id: userDB.id,
      name: userDB.name,
      email: userDB.email,
      birthDate: userDB.birthDate,
    };
    expect(response.status).to.be.deep.eq(200);
    expect(response.data.data.login.user).to.be.deep.eq(expectedResponse);
  });

  it("should return invalid credentials - password incorrect", async () => {
    input.password = "SenhaErrada";

    const response = await axios.post(urlDB, {
      variables: {
        data: input,
      },
      query: mutation,
    });

    const expectedResponse = {
      message: "Credenciais invalidas, por favor verifique email e senha.",
      code: 401,
    };
    expect(response.data.errors[0].extensions.exception.code).to.be.deep.eq(
      expectedResponse.code
    );
    expect(response.data.errors[0].message).to.be.deep.eq(
      expectedResponse.message
    );
  });

  it("should return invalid credentials - email incorrect", async () => {
    input.password = "1234qwer";
    input.email = "emailerrado@gmail.com";

    const response = await axios.post(urlDB, {
      variables: {
        data: input,
      },
      query: mutation,
    });

    const expectedResponse = {
      message: "Credenciais invalidas, por favor verifique email e senha.",
      code: 401,
    };
    expect(response.data.errors[0].extensions.exception.code).to.be.deep.eq(
      expectedResponse.code
    );
    expect(response.data.errors[0].message).to.be.deep.eq(
      expectedResponse.message
    );
  });
});
