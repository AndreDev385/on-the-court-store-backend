import mongoose, { Schema, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { UserDocument, UserTC } from './User';
import { OrderProductDocument, OrderProductTC } from './OrderProduct';
import { ShippingDocument, ShippingTC } from './Shipping';

// # 0 es por pagar
// # 1 en check administrativo
// # 2 pagado
// # 3 entregado
// # 4 crédito
// # 5 crédito entregado
// # 6 crédito pagado
// # 7 Anulada

export interface OrderDocument extends mongoose.Document {
  code?: number;
  status: number;
  paid: boolean;
  subtotal: number;
  tax: number;
  extraFees: number;
  discount: number;
  total: number;
  commission: number;
  products: Array<OrderProductDocument | Types.ObjectId>;
  shipping?: ShippingDocument | Types.ObjectId;
  client: UserDocument | Types.ObjectId;
  phone?: string;
  seller?: UserDocument | Types.ObjectId;
  charges: Array<{
    ref: string;
    method: string;
    bank?: string;
    capture?: string;
    amount: number;
    createdAt?: Date;
  }>;
  address?: string;
  rate?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const orderSchema = new Schema(
  {
    status: {
      type: Number,
      required: [true, 'Please provide a status'],
      default: 0,
    },
    code: {
      type: Number,
    },
    paid: {
      type: Boolean,
      required: [true, 'Please provide a paid status'],
      default: false,
    },
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
    extraFees: {
      type: Number,
      required: [true, 'Please provide a services fee'],
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
    commission: {
      type: Number,
      required: [true, 'Please provide a commission'],
      default: 0,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'OrderProduct',
        required: [true, 'Please provide a Product'],
      },
    ],
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a Client'],
    },
    shipping: {
      type: Schema.Types.ObjectId,
      ref: 'Shipping',
      required: [true, 'Please provide a Shipping'],
    },
    phone: {
      type: String,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    charges: [
      {
        ref: {
          type: String,
        },
        bank: {
          type: String,
        },
        capture: {
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
    address: {
      type: String,
      default: 'N/A',
    },
    rate: {
      type: Number,
      default: 100,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Create Mongo Model and Graphql Schema
export const Order = mongoose.model<OrderDocument>('Order', orderSchema);
export const OrderTC = composeMongoose<OrderDocument, any>(Order);

OrderTC.addRelation('client', {
  resolver: () => UserTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.client,
    skip: null,
    sort: null,
  },
  projection: { client: 1 },
});

OrderTC.addRelation('seller', {
  resolver: () => UserTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.seller,
    skip: null,
    sort: null,
  },
  projection: { seller: 1 },
});

OrderTC.addRelation('products', {
  resolver: () => OrderProductTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.products,
    skip: null,
    sort: null,
  },
  projection: { products: 1 },
});

OrderTC.addRelation('shipping', {
  resolver: () => ShippingTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.shipping,
    skip: null,
    sort: null,
  },
  projection: { shipping: 1 },
});
