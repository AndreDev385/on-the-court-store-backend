import mongoose, { Schema, Document } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';

// 1. Defined the User Type
export interface AddressDocument extends Document {
  country: string;
  state: string;
  municipality: string;
  neighborhood: string;
  street: string; // Edif / Casa / Esas Cosas
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const addressSchema = new Schema(
  {
    country: {
      type: String,
      trim: true,
      required: [true, 'Please provide a country'],
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
      trim: true,
    },
    municipality: {
      type: String,
      required: [true, 'Please provide a municipality'],
      trim: true,
    },
    neighborhood: {
      type: String,
      required: [true, 'Please provide a neighborhood'],
      trim: true,
    },
    street: {
      type: String,
      required: [true, 'Please provide a address'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Create Mongo Model and Graphql Schema
export const Address = mongoose.model<AddressDocument>(
  'Address',
  addressSchema
);

export const AddressTC = composeMongoose<AddressDocument, any>(Address);
