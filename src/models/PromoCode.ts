import mongoose, { Schema, Document } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';

export interface PromoCodeDocument extends Document {
  slug?: string;
  name: string;
  code: string;
  discount: number;
  fixed: boolean;
  percentage: boolean;
  expirationDate: Date;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const promoCodeSchema = new Schema(
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
    code: {
      type: String,
      required: [true, 'Please provide a code'],
      trim: true,
    },
    discount: {
      type: Number,
      required: [true, 'Please provide a discount'],
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    fixed: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Boolean,
      default: false,
    },
    expirationDate: {
      type: Date,
    },
  },

  {
    timestamps: true,
  }
);

promoCodeSchema.pre(
  'save',
  async function (this: PromoCodeDocument, next: mongoose.HookNextFunction) {
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

export const PromoCode = mongoose.model<PromoCodeDocument>(
  'PromoCode',
  promoCodeSchema
);
export const PromoCodeTC = composeMongoose<PromoCodeDocument, any>(PromoCode);
