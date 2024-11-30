import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { OrderProductDocument, OrderProductTC } from './OrderProduct';
import { ClientDocument, ClientTC } from './Client';

export interface ShopCartDocument extends Document {
  client: ClientDocument | Types.ObjectId;
  items: Array<OrderProductDocument | Types.ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const shopCartSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Please Provide a Client'],
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'OrderProduct',
        required: [true, 'Please Provide a Item'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 3. Create Mongo Model and Graphql Schema
export const ShopCart = mongoose.model<ShopCartDocument>(
  'ShopCart',
  shopCartSchema
);
export const ShopCartTC = composeMongoose<ShopCartDocument, any>(ShopCart);

ShopCartTC.addRelation('client', {
  resolver: () => ClientTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.client,
    skip: null,
    sort: null,
  },
  projection: { client: 1 },
});

ShopCartTC.addRelation('items', {
  resolver: () => OrderProductTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.items,
    skip: null,
    sort: null,
  },
  projection: { items: 1 },
});
