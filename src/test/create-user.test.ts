import axios from "axios";
import { expect } from "chai";
import { ClearDb, dataSource } from "../data-source";
import { User } from "../entity";
import * as bcrypt from "bcrypt";
import { CreateUser } from "../utils/create-user";
import * as jwt from "jsonwebtoken";

describe("Mutation createUser", () => {
  afterEach(async function () {
    await ClearDb();
  });

  beforeEach(async function () {
    input = {
      name: "Samuel Satana",
      email: "SamuelTeste1@gmail.com",
      birthDate: "21/02/2002",
      password: "1234qwer",
    };
  });

  const mutation = `mutation CreateUser($data: UserInput!) {
        createUser(data: $data) {
          id
          email
          name
          birthDate
        }
      }
      `;
  let input: {
    name: string;
    email: string;
    birthDate: string;
    password: string;
  };
  const urlDB = "http://localhost:4000/graphql";
  const token = jwt.sign({ userId: 1 }, process.env.TOKEN_KEY);

  it("should return createUser", async () => {
    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: mutation,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    const userDb = await dataSource.findOneBy(User, {
      email: input.email,
    });
    const passwordCompare = await bcrypt.compare(
      input.password,
      userDb.password
    );

    const expectedResponse = {
      data: {
        createUser: {
          id: userDb.id,
          email: input.email,
          name: input.name,
          birthDate: input.birthDate,
        },
      },
    };
    expect(response.status).to.eq(200);
    expect(response.data).to.be.deep.eq(expectedResponse);
    expect({
      id: userDb.id,
      email: userDb.email,
      name: userDb.name,
      birthDate: userDb.birthDate,
    }).to.be.deep.eq(expectedResponse.data.createUser);
    expect(passwordCompare).to.eq(true);
  });

  it("should return email already exist", async () => {
    await CreateUser(input);

    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: mutation,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const expectedResponse = {
      message: "Este email já esta cadastrado",
      code: 409,
    };
    expect(response.data.errors[0].message).to.eq(expectedResponse.message);
    expect(response.data.errors[0].extensions.exception.code).to.eq(
      expectedResponse.code
    );
  });

  it("should return invalid or not found token", async () => {
    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: mutation,
      },
      {
        headers: {
          Authorization: "InvalidToken",
        },
      }
    );

    const espectedResponse = {
      message:
        "Token invalido ou não encontrado, por favor refaça o Login para ter permissão de criar um novo usuário.",
      code: 401,
    };
    expect(response.data.errors[0].extensions.exception.code).to.be.deep.eq(
      espectedResponse.code
    );
    expect(response.data.errors[0].message).to.be.deep.eq(
      espectedResponse.message
    );
  });

  it("should return invalid password format", async () => {
    input.password = "123";

    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: mutation,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const expectedResponse = {
      message:
        "A senha deve possuir ao menos 6 caracteres, com 1 letra e 1 numero",
      code: 400,
    };
    expect(response.data.errors[0].message).to.eq(expectedResponse.message);
    expect(response.data.errors[0].extensions.exception.code).to.eq(
      expectedResponse.code
    );
  });
});
