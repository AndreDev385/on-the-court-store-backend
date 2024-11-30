import mongoose, { Schema, Document } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';

export interface VariantDocument extends Document {
  title: string;
  tags: Array<string>;
  createdAt?: Date;
  updatedAt?: Date;
}

const variantSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    tags: [
      {
        type: String,
        required: [true, 'Please provide a tag'],
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Variant = mongoose.model<VariantDocument>(
  'Variant',
  variantSchema
);
export const VariantTC = composeMongoose<VariantDocument, any>(Variant);
