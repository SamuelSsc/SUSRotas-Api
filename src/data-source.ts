import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Address, User } from "./entity";

const isTest = process.env.TEST;
dotenv.config(isTest && { path: __dirname + "/../test.env" });

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  url: process.env.DB_URL,
  synchronize: true,
  logging: false,
  entities: [User, Address],
  migrations: [],
  subscribers: [],
});

export async function createConnection() {
  await AppDataSource.initialize();
}

export const dataSource = AppDataSource.manager;

export async function ClearDb() {
  await dataSource.query('TRUNCATE TABLE "user" RESTART IDENTITY CASCADE');
}
