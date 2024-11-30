import mongoose, { Schema, Document } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';

export interface ShippingDocument extends Document {
  slug?: string;
  name: string;
  price: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const shippingSchema = new Schema(
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
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
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

shippingSchema.pre(
  'save',
  async function (this: ShippingDocument, next: mongoose.HookNextFunction) {
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

export const Shipping = mongoose.model<ShippingDocument>(
  'Shipping',
  shippingSchema
);

export const ShippingTC = composeMongoose<ShippingDocument, any>(Shipping);
