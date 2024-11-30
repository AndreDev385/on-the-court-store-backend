import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { OrderDocument, OrderTC } from './Order';
import { UserDocument, UserTC } from './User';
import { ClientDocument, ClientTC } from './Client';

export interface CreditDocument extends Document {
  duration: Date;
  total: number;
  interestRate: number;
  status: number; //! # 1: Otorgado, 2: Pagado, 3: Pagado con Retraso, 4: Deudor
  order: OrderDocument | Types.ObjectId;
  issuer: UserDocument | Types.ObjectId;
  client: ClientDocument | Types.ObjectId;
  payments: Array<{
    amount: number;
    method: string;
    ref: string;
    createdAt?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
}

const creditSchema = new Schema(
  {
    duration: {
      type: Date,
      required: [true, 'Please provide a duration'],
    },
    total: {
      type: Number,
      required: [true, 'Please provide a total'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Please provide a interest rate'],
    },
    status: {
      type: Number,
      required: [true, 'Please provide a status'],
      default: 1, //! # 1: Otorgado, 2: Pagado, 3: Pagado con Retraso, 4: Deudor
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Please provide a order'],
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
    payments: [
      {
        amount: Number,
        method: String,
        ref: String,
        createdAt: {
          type: Date,
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Credit = mongoose.model<CreditDocument>('Credit', creditSchema);
export const CreditTC = composeMongoose<CreditDocument, any>(Credit);

CreditTC.addRelation('order', {
  resolver: () => OrderTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.order,
    skip: null,
    sort: null,
  },
  projection: { order: 1 },
});

CreditTC.addRelation('issuer', {
  resolver: () => UserTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.issuer,
    skip: null,
    sort: null,
  },
  projection: { issuer: 1 },
});

CreditTC.addRelation('client', {
  resolver: () => ClientTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.client,
    skip: null,
    sort: null,
  },
  projection: { client: 1 },
});
