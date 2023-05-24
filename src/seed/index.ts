import { createConnection } from "../data-source";
import { usersSeed } from "./users.seed";

export async function generateSeed() {
  await createConnection();
  await usersSeed();
}

generateSeed();
