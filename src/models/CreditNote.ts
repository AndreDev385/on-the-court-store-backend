import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { OrderProductDocument, OrderProductTC } from './OrderProduct';
import { UserDocument, UserTC } from './User';
import { ClientDocument, ClientTC } from './Client';
import { BillDocument, BillTC } from './Bill';

export interface CreditNoteDocument extends Document {
  total: number;
  bill: BillDocument | Types.ObjectId;
  issuer: UserDocument | Types.ObjectId;
  client: ClientDocument | Types.ObjectId;
  products: Array<OrderProductDocument | Types.ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
}

const creditNoteSchema = new Schema(
  {
    total: {
      type: Number,
      required: [true, 'Please provide a total'],
      default: 0,
    },
    bill: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
      required: [true, 'Please provide a bill'],
    },
    issuer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a issuer'],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Please provide a client'],
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'OrderProduct',
        required: [true, 'Please provide a Order Product'],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const CreditNote = mongoose.model<CreditNoteDocument>(
  'CreditNote',
  creditNoteSchema
);
export const CreditNoteTC = composeMongoose<CreditNoteDocument, any>(
  CreditNote
);

CreditNoteTC.addRelation('bill', {
  resolver: () => BillTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.bill,
    skip: null,
    sort: null,
  },
  projection: { bill: 1 },
});

CreditNoteTC.addRelation('issuer', {
  resolver: () => UserTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.issuer,
    skip: null,
    sort: null,
  },
  projection: { issuer: 1 },
});

CreditNoteTC.addRelation('client', {
  resolver: () => ClientTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.client,
    skip: null,
    sort: null,
  },
  projection: { client: 1 },
});

CreditNoteTC.addRelation('products', {
  resolver: () => OrderProductTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.products,
    skip: null,
    sort: null,
  },
  projection: { products: 1 },
});
