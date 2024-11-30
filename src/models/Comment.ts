import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { ProductDocument, ProductTC } from './Product';
import { UserDocument, UserTC } from './User';

export interface CommentDocument extends Document {
  text: string;
  rating: number;
  product: Types.ObjectId | ProductDocument;
  client: Types.ObjectId | UserDocument;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Please provide a text'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Please provided a product'],
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provided a client'],
    },
    active: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

export const Comment = mongoose.model<CommentDocument>(
  'Comment',
  commentSchema
);

export const CommentTC = composeMongoose<CommentDocument, any>(Comment);

CommentTC.addRelation('product', {
  resolver: () => ProductTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.product,
    skip: null,
    sort: null,
  },
  projection: { product: 1 },
});

CommentTC.addRelation('client', {
  resolver: () => UserTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.client,
    skip: null,
    sort: null,
  },
  projection: { client: 1 },
});
