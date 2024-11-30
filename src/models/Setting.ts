import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { CategoryDocument, CategoryTC } from './Category';

export interface SettingDocument extends Document {
  active?: boolean;
  carouselImages: Array<{ title?: string; description?: string; url: string }>;
  promotions: Array<{ title?: string; description?: string; url: string }>;
  banner?: {
    text?: string;
    active?: boolean;
  };
  categories?: Array<CategoryDocument | Types.ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
}

const SettingSchema = new Schema(
  {
    carouselImages: [
      {
        title: String,
        description: String,
        url: String,
      },
    ],
    promotions: [
      {
        title: String,
        description: String,
        url: String,
      },
    ],
    banner: {
      text: {
        type: String,
        default: '',
      },
      active: {
        type: Boolean,
        default: false,
      },
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.model<SettingDocument>(
  'Setting',
  SettingSchema
);

export const SettingTC = composeMongoose<SettingDocument, any>(Setting);

SettingTC.addRelation('categories', {
  resolver: () => CategoryTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.categories,
    skip: null,
    sort: null,
  },
  projection: { categories: 1 },
});
