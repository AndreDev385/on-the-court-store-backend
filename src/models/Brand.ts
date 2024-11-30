import mongoose, { Schema, Document } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';

export interface BrandDocument extends Document {
  slug?: string;
  name: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const brandSchema = new Schema(
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
    active: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

brandSchema.pre(
  'save',
  async function (this: BrandDocument, next: mongoose.HookNextFunction) {
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

export const Brand = mongoose.model<BrandDocument>('Brand', brandSchema);

export const BrandTC = composeMongoose<BrandDocument, any>(Brand);
