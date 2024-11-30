import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { OrderDocument, OrderTC } from './Order';
import { CurrencyDocument, CurrencyTC } from './Currency';

export interface BillDocument extends Document {
  controlNumber: string;
  order: OrderDocument | Types.ObjectId;
  currency: CurrencyDocument | Types.ObjectId;
  rate: number;
  paid: boolean;
  paymentMetadata?: { [k: string]: any };
  charges: Array<{
    ref: string;
    method: string;
    bank?: string;
    amount: number;
    createdAt?: Date;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const billSchema = new Schema(
  {
    controlNumber: {
      type: String,
      required: [true, 'Please Provide a ControlNumber'],
      trim: true,
      unique: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please Provide a Order'],
      ref: 'Order',
    },
    currency: {
      type: Schema.Types.ObjectId,
      required: [true, 'Please Provide a Currency'],
      ref: 'Currency',
    },
    rate: {
      type: Number,
      required: [true, 'Please Provide a rate'],
    },
    paid: {
      type: Boolean,
      default: false,
      required: [true, 'Please Provide a paid status'],
    },
    paymentMetadata: {
      type: Schema.Types.Mixed,
    },
    charges: [
      {
        ref: {
          type: String,
        },
        bank: {
          type: String,
        },
        method: {
          type: String,
        },
        amount: {
          type: Number,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    subtotal: {
      type: Number,
      required: [true, 'Please provide a subtotal'],
      default: 0,
    },
    tax: {
      type: Number,
      required: [true, 'Please provide a tax'],
      default: 0,
    },
    discount: {
      type: Number,
      required: [true, 'Please provide a discount'],
      default: 0,
    },
    total: {
      type: Number,
      required: [true, 'Please provide a total'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Bill = mongoose.model<BillDocument>('Bill', billSchema);
export const BillTC = composeMongoose<BillDocument, any>(Bill);

BillTC.addRelation('order', {
  resolver: () => OrderTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.order,
    skip: null,
    sort: null,
  },
  projection: { order: 1 },
});

BillTC.addRelation('currency', {
  resolver: () => CurrencyTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.currency,
    skip: null,
    sort: null,
  },
  projection: { currency: 1 },
});
