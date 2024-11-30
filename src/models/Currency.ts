import mongoose, { Schema, Document } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';

export interface CurrencyDocument extends Document {
  slug?: string;
  name: string;
  symbol: string;
  rate: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const currencySchema = new Schema(
  {
    slug: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    symbol: {
      type: String,
      required: [true, 'Please provide a symbol'],
      trim: true,
    },
    rate: {
      type: Number,
      required: [true, 'Please provide a Rate'],
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

currencySchema.pre(
  'save',
  async function (this: CurrencyDocument, next: mongoose.HookNextFunction) {
    if (!this.isModified('name')) {
      return next();
    }
    this.slug = slugs(this.name);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`);
    const withSlugs = await (this as any).constructor.find({ slug: slugRegEx });
    if ((withSlugs as Array<any>).length) {
      this.slug = `${this.slug}-${withSlugs.length + 1}`;
    }
    next();
  }
);

export const Currency = mongoose.model<CurrencyDocument>(
  'Currency',
  currencySchema
);
export const CurrencyTC = composeMongoose<CurrencyDocument, any>(Currency);
