import { dataSource } from "../data-source";
import * as bcrypt from "bcrypt";
import { CustomError } from "../errors";
import * as jwt from "jsonwebtoken";
import { User } from "../entity";

export const resolvers = {
  Query: {
    hello: () => "Hello Word!",
    user: async (
      parent,
      args: { data: { id: number } },
      context: { token: string }
    ) => {
      jwt.verify(context.token, process.env.TOKEN_KEY, function (err) {
        if (!!err) {
          throw new CustomError(
            "Token invalido ou não encontrado, você não possui permissão para ver as informações do usuario.",
            401
          );
        }
      });
      const user = await dataSource.findOne(User, {
        relations: { addresses: true },
        where: { id: args.data.id },
      });

      if (user === null) {
        throw new CustomError("Usuario não encontrado verifique o id", 404);
      }

      return user;
    },

    users: async (
      parent,
      args: { data: { limit: number; offset: number } },
      context: { token: string }
    ) => {
      jwt.verify(context.token, process.env.TOKEN_KEY, function (err) {
        if (!!err) {
          throw new CustomError(
            "Token invalido ou não encontrado, você não possui permissão para ver a lista de usuários.",
            401
          );
        }
      });

      const DEFAULT_VALUES = {
        limit: 10,
        offset: 0,
      };
      const limit = args?.data?.limit ?? DEFAULT_VALUES.limit;
      const offset = args?.data?.offset ?? DEFAULT_VALUES.offset;

      const users = await dataSource.find(User, {
        order: {
          name: "ASC",
        },
        take: limit,
        skip: offset,
        relations: { addresses: true },
      });
      const totalUsers = await dataSource.count(User);
      const totalPages = Math.ceil(totalUsers / limit);
      const FIRST_PAGE = 1;

      if (offset >= totalUsers)
        throw new CustomError("Não há mais usuarios a serem listados", 404);

      const usersOutput = {
        hasPreviousPage: offset > 0,
        hasNextPage: !(limit * (totalPages - FIRST_PAGE) === offset),
        users: users,
        totalUsers: totalUsers,
      };
      return usersOutput;
    },
  },

  Mutation: {
    createUser: async (
      parent,
      args: {
        data: {
          name: string;
          email: string;
          password: string;
          birthDate: string;
        };
      },
      context: { token: string }
    ) => {
      jwt.verify(context.token, process.env.TOKEN_KEY, function (err) {
        if (!!err) {
          throw new CustomError(
            "Token invalido ou não encontrado, por favor refaça o Login para ter permissão de criar um novo usuário.",
            401
          );
        }
      });
      const regex = /^((?=\S*?[a-z,A-Z])(?=\S*?[0-9]).{6,})\S/;
      if (!regex.test(args.data.password))
        throw new CustomError(
          "A senha deve possuir ao menos 6 caracteres, com 1 letra e 1 numero",
          400
        );

      const isEmailAlreadyExist = await dataSource.findBy(User, {
        email: args.data.email,
      });
      if (!!isEmailAlreadyExist.length)
        throw new CustomError("Este email já esta cadastrado", 409);

      const ROUNDS = 10;
      const passwordHashed = await bcrypt.hash(args.data.password, ROUNDS);

      const user = new User();
      user.name = args.data.name;
      user.email = args.data.email;
      user.birthDate = args.data.birthDate;
      user.password = passwordHashed;
      await dataSource.save(user);

      return user;
    },

    login: async (
      parent,
      args: {
        data: {
          email: string;
          password: string;
          rememberMe: boolean;
        };
      }
    ) => {
      const userLogin = new User();
      userLogin.email = args.data.email;
      userLogin.password = args.data.password;
      const isRememberMe = args.data.rememberMe;
      const UnauthorizedError = {
        message: "Credenciais invalidas, por favor verifique email e senha.",
        code: 401,
      };

      const user = await dataSource.findOneBy(User, {
        email: args.data.email,
      });
      if (user === null)
        throw new CustomError(
          UnauthorizedError.message,
          UnauthorizedError.code
        );

      const isUserPassword = await bcrypt.compare(
        userLogin.password,
        user.password
      );
      let token: string;
      if (isUserPassword) {
        token = jwt.sign({ userId: user.id }, process.env.TOKEN_KEY, {
          expiresIn: isRememberMe ? "7d" : "3h",
        });
      } else {
        throw new CustomError(
          UnauthorizedError.message,
          UnauthorizedError.code
        );
      }

      return { user, token };
    },
  },
};
