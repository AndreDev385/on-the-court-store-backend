import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { OrderDocument, OrderTC } from './Order';
import { BillDocument, BillTC } from './Bill';

export interface DeliveryNoteDocument extends Document {
  controlNumber: string;
  order: OrderDocument | Types.ObjectId;
  bill?: BillDocument | Types.ObjectId;
  paid: boolean;
  paymentMetadata?: { [k: string]: any };
  charges: Array<{
    ref: string;
    method: string;
    bank?: string;
    amount: number;
    createdAt?: Date;
  }>;
  generateBill?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const deliveryNoteSchema = new Schema(
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
    bill: {
      type: Schema.Types.ObjectId,
      ref: 'Bill',
    },
    paid: {
      type: Boolean,
      default: false,
      required: [true, 'Please Provide a paid status'],
    },
    paymentMetadata: {
      type: Schema.Types.Mixed,
      // required: [true, 'Please Provide a Payment Metadata',],
    },
    generateBill: {
      type: Boolean,
      required: [true, 'Please provided a Generate Bill'],
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
          default: new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const DeliveryNote = mongoose.model<DeliveryNoteDocument>(
  'DeliveryNote',
  deliveryNoteSchema
);

export const DeliveryNoteTC = composeMongoose<DeliveryNoteDocument, any>(
  DeliveryNote
);

DeliveryNoteTC.addRelation('order', {
  resolver: () => OrderTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.order,
    skip: null,
    sort: null,
  },
  projection: { order: 1 },
});

DeliveryNoteTC.addRelation('bill', {
  resolver: () => BillTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.bill,
    skip: null,
    sort: null,
  },
  projection: { bill: 1 },
});
