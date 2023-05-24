import { gql } from "apollo-server";

export const typeDefs = gql`
  input UserInput {
    name: String!
    email: String!
    cnpj: String!
    password: String!
    phone: String!
    hour: String!
    hasPCDadapted: Boolean
    cep: String!
    street: String!
    streetNumber: Int!
    neighbornhood: String!
    city: String!
    state: String!
    complement: String
  }

  input LoginInput {
    email: String!
    password: String!
    rememberMe: Boolean!
  }

  input UserInfo {
    id: Int!
  }

  input UsersPagination {
    limit: Int
    offset: Int
  }

  type Address {
    id: Int!
    cep: String!
    street: String!
    streetNumber: Int!
    neighborhood: String!
    city: String!
    state: String!
    complement: String
  }

  type User {
    id: Int
    name: String!
    email: String!
    cnpj: String!
    password: String!
    phone: String!
    hour: String!
    hasPCDadapted: Boolean
    cep: String!
    street: String!
    streetNumber: Int!
    neighborhood: String!
    city: String!
    state: String!
    complement: String
  }

  type Login {
    user: User!
    token: String!
  }

  type UsersList {
    hasPreviousPage: Boolean
    hasNextPage: Boolean
    users: [User]
    totalUsers: Int
  }

  type Query {
    hello: String
    user(data: UserInfo!): User
    users(data: UsersPagination): UsersList
  }

  type Mutation {
    createUser(data: UserInput!): User
    login(data: LoginInput!): Login
  }
`;
