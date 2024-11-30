import mongoose, { Schema, Document, Types } from 'mongoose';
import slugs from 'slugs';
import bcrypt from 'bcryptjs';
import { composeMongoose } from 'graphql-compose-mongoose';
import { ClientDocument, ClientTC } from './Client';

// 1. Defined the User Type
export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  dni?: string;
  dniType?: string; //! 1V | 2E | 3J | 4G
  privilege: number; //! 0Client | 1SuperAdmin | 2Admin | ...
  slug?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
  active?: boolean;
  commission?: number;
  client?: ClientDocument | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide a email'],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      trim: true,
    },
    dni: {
      type: String,
      trim: true,
    },
    dniType: {
      type: String,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpiry: {
      type: Number,
    },
    privilege: {
      type: Number,
      required: [true, 'Please provide a privilege'],
    },
    commission: {
      type: Number,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre(
  'save',
  async function (this: UserDocument, next: mongoose.HookNextFunction) {
    if (!this.isModified('name')) {
      return next();
    }
    this.slug = slugs(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`);
    const withSlugs = await (this as any).constructor.find({
      slug: slugRegEx,
    });
    if ((withSlugs as Array<any>).length) {
      this.slug = `${this.slug}-${withSlugs.length + 1}`;
    }
    next();
  }
);

userSchema.pre(
  'save',
  async function (this: UserDocument, next: mongoose.HookNextFunction) {
    if (!this.isModified('password')) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }
);

// 3. Create Mongo Model and Graphql Schema
export const User = mongoose.model<UserDocument>('User', userSchema);
export const UserTC = composeMongoose<UserDocument, any>(User);

UserTC.addRelation('client', {
  resolver: () => ClientTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.client,
    skip: null,
    sort: null,
  },
  projection: { client: 1 },
});
