import { dataSource } from "../data-source";
import { Address, User } from "../entity";
import * as bcrypt from "bcrypt";
import { Index } from "typeorm";

interface CreateUserProps {
  name?: string;
  email?: string;
  birthDate?: string;
  password?: string;
  addressess?: AddressProps[];
}

export const defaultAdress = {
  cep: "123456798",
  city: "São Paulo",
  state: "Sp",
  complement: null,
  street: "Luis Grassman",
  streetNumber: 200,
  neighborhood: "Jardim Mirante ZS",
};

export const defaultUser = {
  name: "Samuel Santana",
  email: "Samuelssc5874@gmail.com",
  birthDate: "21/2002",
  password: "1234qwer",
};

export async function CreateUser(props: CreateUserProps) {
  const ROUNDS = 10;
  const passwordHashed = await bcrypt.hash(
    props.password ?? defaultUser.password,
    ROUNDS
  );
  const user = new User();
  user.name = props.name ?? defaultUser.name;
  user.email = props.email ?? defaultUser.email;
  user.birthDate = props.birthDate ?? defaultUser.birthDate;
  user.password = passwordHashed;

  const addressess = [];
  props?.addressess?.map((addressItem) => {
    const address = new Address();
    (address.cep = addressItem.cep), (address.city = addressItem.city);
    address.state = addressItem.state;
    address.complement = addressItem.complement ?? null;
    address.street = addressItem.street;
    address.streetNumber = addressItem.streetNumber;
    address.neighborhood = addressItem.neighborhood;

    addressess.push(address);
  });

  const addressdefault = new Address();
  addressdefault.cep = defaultAdress.cep;
  addressdefault.city = defaultAdress.city;
  addressdefault.state = defaultAdress.state;
  addressdefault.complement = defaultAdress.complement;
  addressdefault.street = defaultAdress.street;
  addressdefault.streetNumber = defaultAdress.streetNumber;
  addressdefault.neighborhood = defaultAdress.neighborhood;
  addressess.push(addressdefault);

  user.addresses = addressess;
  await dataSource.save(user);
}

interface AddressProps {
  cep: string;
  street: string;
  streetNumber: number;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}
