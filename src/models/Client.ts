import mongoose, { Schema, Types, Document } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { UserDocument, UserTC } from './User';
import { ShopCartDocument, ShopCartTC } from './Shopcart';
import { OrderDocument, OrderTC } from './Order';
import { BillDocument } from './Bill';
import { AddressDocument, AddressTC } from './Address';

// 1. Defined the User Type
export interface ClientDocument extends Document {
  address?: Array<AddressDocument | Types.ObjectId>;
  phone?: string;
  points?: number;
  user: UserDocument | Types.ObjectId;
  shopCart?: ShopCartDocument | Types.ObjectId;
  orders?: Array<OrderDocument | Types.ObjectId>;
  bills?: Array<BillDocument | Types.ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const clientSchema = new Schema(
  {
    address: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Address',
      },
    ],
    phone: {
      type: String,
      trim: true,
    },
    points: {
      type: Number,
      default: 0,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user'],
    },
    shopCart: {
      type: Schema.Types.ObjectId,
      ref: 'ShopCart',
    },
    orders: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Order',
      },
    ],
    bills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Bill',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 3. Create Mongo Model and Graphql Schema
export const Client = mongoose.model<ClientDocument>('Client', clientSchema);
export const ClientTC = composeMongoose<ClientDocument, any>(Client);

ClientTC.addRelation('user', {
  resolver: () => UserTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.user,
    skip: null,
    sort: null,
  },
  projection: { user: 1 },
});

ClientTC.addRelation('shopCart', {
  resolver: () => ShopCartTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.shopCart,
    skip: null,
    sort: null,
  },
  projection: { shopCart: 1 },
});

ClientTC.addRelation('orders', {
  resolver: () => OrderTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.orders,
    skip: null,
    sort: null,
  },
  projection: { orders: 1 },
});

ClientTC.addRelation('bills', {
  resolver: () => UserTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.bills,
    skip: null,
    sort: null,
  },
  projection: { bills: 1 },
});

ClientTC.addRelation('address', {
  resolver: () => AddressTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.address,
    skip: null,
    sort: null,
  },
  projection: { address: 1 },
});
