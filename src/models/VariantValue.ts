import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { LocationDocument, LocationTC } from './Location';
import { ProductDocument, ProductTC } from './Product';

export interface VariantValueDocument extends Document {
  value: {
    variant1: string;
    variant2?: string;
    variant3?: string;
  };
  price: number;
  compareAtPrice?: number;
  quantity: number;
  photo?: string;
  sku?: string;
  product?: ProductDocument | Types.ObjectId;
  location: LocationDocument | Types.ObjectId;
  disabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const variantValueSchema = new Schema(
  {
    value: {
      _id: false,
      variant1: {
        type: String,
        required: true,
      },
      variant2: {
        type: String,
        required: false,
      },
      variant3: {
        type: String,
        required: false,
      },
    },
    price: {
      type: Number,
      required: [true, 'Please provide a Price'],
    },
    compareAtPrice: {
      type: Number,
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide a Quantity'],
    },
    photo: String,
    sku: String,
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Please provide a Location'],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const VariantValue = mongoose.model<VariantValueDocument>(
  'VariantValue',
  variantValueSchema
);
export const VariantValueTC = composeMongoose<VariantValueDocument, any>(
  VariantValue
);

VariantValueTC.addRelation('location', {
  resolver: () => LocationTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.location,
    skip: null,
    sort: null,
  },
  projection: { location: 1 },
});

VariantValueTC.addRelation('product', {
  resolver: () => ProductTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.product,
    skip: null,
    sort: null,
  },
  projection: { product: 1 },
});
