import { AppDataSource } from "../data-source";
import { app, setup } from "../setup";

before(async () => {
  await setup();
});

after(async () => {
  await AppDataSource.destroy();
  app.stop();
  console.info("Connection with server closed!");
});

require("./hello.test");
require("./create-user.test");
require("./login.test");
require("./user.test");
require("./users.test");
