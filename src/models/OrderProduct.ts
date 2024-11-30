import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { LocationDocument, LocationTC } from './Location';
import { ShopCartDocument, ShopCartTC } from './Shopcart';
import { OrderDocument, OrderTC } from './Order';
import { ProductDocument, ProductTC } from './Product';
import { VariantValueDocument, VariantValueTC } from './VariantValue';

export interface OrderProductDocument extends Document {
  // PRODUCT
  title: string;
  isService: boolean;
  active?: boolean;
  photo: string;
  brand: string;
  extraInfo?: Array<{ name: string; value: string }>;
  modelName: string;
  product: ProductDocument | Types.ObjectId;
  // Variant Value
  variant1: string;
  variant2?: string;
  variant3?: string;
  price: number;
  quantity: number;
  sku?: string;
  location: LocationDocument | Types.ObjectId;
  variantValue: VariantValueDocument | Types.ObjectId;
  // Order
  shopCart: ShopCartDocument | Types.ObjectId;
  order?: OrderDocument | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const orderProductSchema = new Schema(
  {
    quantity: {
      type: Number,
      required: 'Please Provide a quantity',
    },
    price: {
      type: Number,
      required: 'Please Provide a price',
    },
    title: {
      type: String,
      required: 'Please provide a Title',
    },
    isService: {
      type: Boolean,
      required: 'Please provide if it is a service',
    },
    active: {
      type: Boolean,
      required: 'Please provide a if it is active',
    },
    photo: {
      type: String,
      required: 'Please provide a photo url',
    },
    brand: {
      type: String,
      required: 'Please provide a brand name',
    },
    model: {
      type: String,
    },
    variant1: {
      type: String,
      required: 'Please Provide a variant1',
    },
    variant2: {
      type: String,
    },
    variant3: {
      type: String,
    },
    sku: {
      type: String,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: 'Please Provide a Product',
    },
    variantValue: {
      type: Schema.Types.ObjectId,
      ref: 'VariantValue',
      required: 'Please Provide a variant value',
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: 'Please Provide a Location',
    },
    shopCart: {
      type: Schema.Types.ObjectId,
      ref: 'ShopCart',
      required: 'Please Provide a Shopping Cart',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  }
);

// 3. Create Mongo Model and Graphql Schema
export const OrderProduct = mongoose.model<OrderProductDocument>(
  'OrderProduct',
  orderProductSchema
);
export const OrderProductTC = composeMongoose<OrderProductDocument, any>(
  OrderProduct
);

OrderProductTC.addRelation('product', {
  resolver: () => ProductTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.product,
    skip: null,
    sort: null,
  },
  projection: { product: 1 },
});

OrderProductTC.addRelation('shopCart', {
  resolver: () => ShopCartTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.shopCart,
    skip: null,
    sort: null,
  },
  projection: { shopCart: 1 },
});

OrderProductTC.addRelation('variantValue', {
  resolver: () => VariantValueTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.variantValue,
    skip: null,
    sort: null,
  },
  projection: { variantValue: 1 },
});

OrderProductTC.addRelation('order', {
  resolver: () => OrderTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.order,
    skip: null,
    sort: null,
  },
  projection: { order: 1 },
});

OrderProductTC.addRelation('location', {
  resolver: () => LocationTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.location,
    skip: null,
    sort: null,
  },
  projection: { location: 1 },
});
