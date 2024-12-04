import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import browser from 'browser-detect';
import { v4 as uuid } from 'uuid';
import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { User, UserTC, UserDocument } from '../models/User';
import { Client, ClientDocument } from '../models/Client';
import { ShopCart, ShopCartDocument } from '../models/Shopcart';
import { PromoCode, PromoCodeDocument } from '../models/PromoCode';
import { resetPasswordEmail, welcomeEmail } from '../lib/emailHelper';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const mailchimp = require('@mailchimp/mailchimp_marketing/src/index');
//
export const signIn = schemaComposer.createResolver<
  any,
  {
    email: string;
    password: string;
  }
>({
  name: 'signIn',
  type: `type SignInResponse { token: String }`,
  description: 'Login for a existing user in the db',
  kind: 'mutation',
  args: {
    email: 'String!',
    password: 'String!',
  },
  resolve: async ({ args }) => {
    const { email, password } = args;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApolloError('El usuario no existe');
    }
    const comparePassword = await bcrypt.compare(password, user.password);
    if (comparePassword) {
      const token = jwt.sign(
        {
          id: user._id,
          privilege: user.privilege,
          emission: new Date().toISOString(),
        },
        process.env.SECRET
      );

      return { token };
    }
    throw new ApolloError('Las contraseñas no coinciden');
  },
});

export const signUp = schemaComposer.createResolver<
  any,
  {
    name: string;
    email: string;
    password: string;
    dni?: string;
    dniType?: number;
    privilege: number;
    commission?: number;
    phone?: string;
    newsLetter?: boolean;
  }
>({
  name: 'signUp',
  type: `type SignUpResponse { token: String }`,
  description: 'Sign Up for a new user in the db',
  kind: 'mutation',
  args: {
    name: 'String!',
    email: 'String!',
    password: 'String!',
    dni: 'String',
    dniType: 'Int',
    privilege: 'Int',
    commission: 'Float',
    phone: 'String',
    newsLetter: 'Boolean',
  },
  resolve: async ({ args }) => {
    const { email } = args;
    const userFromDB = await User.findOne({ email });
    if (userFromDB) {
      throw new ApolloError('Este correo ya esta registrado');
    }
    let user = await User.create({
      name: args.name,
      email: args.email.toLowerCase(),
      password: args.password,
      // dni: args.dni,
      // dniType: String(args.dniType),
      privilege: args.privilege,
      commission: args.commission || 0,
    });
    if (user.privilege === 0) {
      // create a client an set the relationship
      const client = new Client({ user: user._id, phone: args.phone });
      const shopCart = new ShopCart({
        client: client._id,
        items: [],
      });
      const promoCode = new PromoCode({
        name: `WELCOME-${user?.email}`,
        code: `${user?.email}`,
        discount: 5,
        active: true,
        fixed: false,
        percentage: true,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      client.shopCart = shopCart._id;
      [, , user] = (await Promise.all([
        client.save(),
        shopCart.save(),
        User.findOneAndUpdate(
          { _id: user._id },
          { client: client._id },
          { new: true, runValidators: true }
        ).populate('client'),
        promoCode.save(),
      ])) as [
        ClientDocument,
        ShopCartDocument,
        UserDocument,
        PromoCodeDocument
      ];
      // if (args?.newsLetter) {
      //   const listId = '886969109d';
      //   mailchimp.setConfig({
      //     apiKey: process.env.MAILCHIMP,
      //     server: 'us17',
      //   });
      //   await mailchimp.lists.addListMember(listId, {
      //     email_address: user.email,
      //     status: 'subscribed',
      //     merge_fields: {
      //       FNAME: user.name,
      //       LNAME: user.name,
      //     },
      //   });
      // }
      await welcomeEmail(user, promoCode);
    }
    const token = jwt.sign(
      {
        id: user._id,
        privilege: user.privilege,
        emission: new Date().toISOString(),
      },
      process.env.SECRET
    );
    return { token };
  },
});

export const signOut = schemaComposer.createResolver({
  name: 'signOut',
  type: `type SignOutMessage { success: Boolean! }`,
  description: 'Sign Out the user from the app',
  kind: 'mutation',
  args: {},
  resolve: async ({ context }) => {
    if (
      !(context?.req?.cookies?.token ?? false) &&
      !(context?.req?.headers?.authorization ?? false)
    ) {
      return { success: false };
    }
    return { success: true };
  },
});

export const me = schemaComposer.createResolver({
  name: 'me',
  type: UserTC.getType(),
  description: 'Get the logged in user',
  kind: 'query',
  args: {},
  resolve: async ({ context }) => {
    const { token } = context.req.cookies;
    const { authorization } = context.req.headers;
    if (!token && !authorization) {
      return null;
    }
    const payload = jwt.decode(token ? token : authorization);
    const user = await User.findById((payload as { id: string }).id);
    if (!user) {
      throw new ApolloError(`El usuario no existe`);
    }
    return user;
  },
});

type TResetPasswordInput = {
  email: string;
};

const ResetPasswordInput = `
  input ResetPasswordInput {
    email: String!
  }
`;

const ResetPasswordInfo = `
  type ResetPasswordInfo {
    success: Boolean!
    err: String
  }
`;

export const resetPassword = schemaComposer.createResolver<
  any,
  {
    data: TResetPasswordInput;
  }
>({
  name: 'resetPassword',
  type: ResetPasswordInfo,
  description: 'Reset Password',
  kind: 'mutation',
  args: {
    data: ResetPasswordInput,
  },
  async resolve({ args, context }) {
    try {
      const browserData = browser(context?.req?.headers?.['user-agent']);
      const user = await User.findOne({
        email: args?.data?.email.toLowerCase(),
      });
      if (!user) {
        throw new ApolloError(
          `El usuario con correo ${args?.data?.email.toLowerCase()} no esta registrado`
        );
      }
      user.resetToken = uuid();
      user.resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours in ms
      await Promise.all([
        user.save(),
        resetPasswordEmail(user, user?.resetToken, browserData),
      ]);
      return { success: true };
    } catch (err) {
      return { err: err.message, success: false };
    }
  },
});

type TChangePasswordInput = {
  token: string;
  password: string;
};

const ChangePasswordInput = `
  input ChangePasswordInput {
    token: String!
    password: String!
  }
`;

export const changePassword = schemaComposer.createResolver<
  any,
  {
    data: TChangePasswordInput;
  }
>({
  name: 'changePassword',
  type: ResetPasswordInfo,
  description: 'Change Password',
  kind: 'mutation',
  args: {
    data: ChangePasswordInput,
  },
  async resolve({ args }) {
    try {
      const user = await User.findOne({
        resetToken: args?.data?.token,
        resetTokenExpiry: {
          $gt: Date.now(),
        },
      });
      if (!user) {
        throw new ApolloError(`El token ha expirado`);
      }
      user.password = args?.data?.password;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();
      return { success: true };
    } catch (err) {
      return { success: false, err: err.message };
    }
  },
});
