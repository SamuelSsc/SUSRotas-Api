import { ClearDb, dataSource } from "../data-source";
import { expect } from "chai";
import * as jwt from "jsonwebtoken";
import axios from "axios";
import { usersSeed } from "../seed/users.seed";
import { User } from "../entity";

describe("Query Users", () => {
  let users: User[];
  beforeEach(async () => {
    await usersSeed();
    users = await dataSource.find(User);
  });

  afterEach(async function () {
    await ClearDb();
  });

  const urlDB = "http://localhost:4000//graphql";
  const query = `
    query users($data:UsersPagination){
        users(data: $data){
          users{
            id
            name
            addresses{
              id
            }
          }
          hasNextPage
          hasPreviousPage
          totalUsers
        }
    }
  `;
  let input: { limit: number; offset: number };

  it("should return first page users", async () => {
    const token = jwt.sign({ userId: users[0].id }, process.env.TOKEN_KEY);
    input = {
      limit: 10,
      offset: 0,
    };

    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: query,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const expectedResponse = await dataSource.find(User, {
      order: {
        name: "ASC",
      },
      take: input.limit,
      skip: input.offset,
      relations: { addresses: true },
      select: { id: true, name: true, addresses: { id: true } },
    });
    expect(response.data.data.users.users).to.be.deep.eq(expectedResponse);
    expect(response.status).to.eq(200);
    expect(response.data.data.users.totalUsers).to.eq(25);
    expect(response.data.data.users.hasPreviousPage).to.eq(false);
    expect(response.data.data.users.hasNextPage).to.eq(true);
  });

  it("should return midlle page users", async () => {
    const token = jwt.sign({ userId: users[0].id }, process.env.TOKEN_KEY);
    input = {
      limit: 10,
      offset: 10,
    };

    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: query,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const expectedResponse = await dataSource.find(User, {
      order: {
        name: "ASC",
      },
      take: input.limit,
      skip: input.offset,
      relations: { addresses: true },
      select: { id: true, name: true, addresses: { id: true } },
    });
    expect(response.data.data.users.users).to.be.deep.eq(expectedResponse);
    expect(response.status).to.eq(200);
    expect(response.data.data.users.totalUsers).to.eq(25);
    expect(response.data.data.users.hasPreviousPage).to.eq(true);
    expect(response.data.data.users.hasNextPage).to.eq(true);
  });

  it("should return last page users", async () => {
    const token = jwt.sign({ userId: users[0].id }, process.env.TOKEN_KEY);
    input = {
      limit: 10,
      offset: 20,
    };

    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: query,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const expectedResponse = await dataSource.find(User, {
      order: {
        name: "ASC",
      },
      take: input.limit,
      skip: input.offset,
      relations: { addresses: true },
      select: { id: true, name: true, addresses: { id: true } },
    });
    expect(response.data.data.users.users).to.be.deep.eq(expectedResponse);
    expect(response.status).to.eq(200);
    expect(response.data.data.users.totalUsers).to.eq(25);
    expect(response.data.data.users.hasPreviousPage).to.eq(true);
    expect(response.data.data.users.hasNextPage).to.eq(false);
  });

  it("should return not found more users", async () => {
    const token = jwt.sign({ userId: users[0].id }, process.env.TOKEN_KEY);
    input = {
      limit: 10,
      offset: 25,
    };

    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: query,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    const expectedResponse = {
      message: "Não há mais usuarios a serem listados",
      code: 404,
    };
    expect(response.data.errors[0].extensions.exception.code).to.be.deep.eq(
      expectedResponse.code
    );
    expect(response.data.errors[0].message).to.be.deep.eq(
      expectedResponse.message
    );
  });

  it("should return invalid or not found token - Token Invalid", async () => {
    const response = await axios.post(
      urlDB,
      {
        variables: {
          data: input,
        },
        query: query,
      },
      {
        headers: {
          Authorization: "TokenInvalid",
        },
      }
    );

    const expectedResponse = {
      message:
        "Token invalido ou não encontrado, você não possui permissão para ver a lista de usuários.",
      code: 401,
    };
    expect(response.data.errors[0].extensions.exception.code).to.be.deep.eq(
      expectedResponse.code
    );
    expect(response.data.errors[0].message).to.be.deep.eq(
      expectedResponse.message
    );
  });

  it("should return invalid or not found token - dont send token", async () => {
    const response = await axios.post(urlDB, {
      variables: {
        data: input,
      },
      query: query,
    });

    const expectedResponse = {
      message:
        "Token invalido ou não encontrado, você não possui permissão para ver a lista de usuários.",
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
