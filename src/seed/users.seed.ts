import { faker } from "@faker-js/faker";
import { dataSource } from "../data-source";
import * as bcrypt from "bcrypt";
import { Address, User } from "../entity";

export async function usersSeed() {
  const users = [];
  const ROUNDS = 10;

  for (let i = 0; i < 25; i++) {
    const user = new User();
    user.name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    user.email = `${faker.internet.email()}`;
    user.birthDate = `${faker.date.birthdate()}`;
    user.password = await bcrypt.hash("1234qwer", ROUNDS);

    const address = new Address();
    address.state = `${faker.address.state()}`;
    address.city = `${faker.address.city()}`;
    address.neighborhood = `${faker.address.country()}`;
    address.cep = `${faker.address.zipCode()}`;
    address.street = `${faker.address.street()}`;
    address.streetNumber = +`${faker.address.buildingNumber()}`;

    user.addresses = [address];
    users.push(user);
  }
  try {
    await dataSource.save(users);
    console.info("Users Created!");
  } catch {
    console.error("Error at create users");
  }
}
