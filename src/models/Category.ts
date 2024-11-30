import mongoose, { Schema, Document, Types } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';
import { ProductDocument, ProductTC } from './Product';

export interface CategoryDocument extends Document {
  name: string;
  slug?: string;
  photo?: string;
  products?: Array<ProductDocument | Types.ObjectId>;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const categorySchema = new Schema(
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
    photo: {
      type: String,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
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

categorySchema.pre(
  'save',
  async function (this: CategoryDocument, next: mongoose.HookNextFunction) {
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

export const Category = mongoose.model<CategoryDocument>(
  'Category',
  categorySchema
);

export const CategoryTC = composeMongoose<CategoryDocument, any>(Category);

CategoryTC.addRelation('products', {
  resolver: () => ProductTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.products,
    skip: null,
    sort: null,
  },
  projection: { products: 1 },
});
