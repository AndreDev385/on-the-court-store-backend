import mongoose, { Schema, Document, Types } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';
import { ProductDocument, ProductTC } from './Product';

export interface SupplierDocument extends Document {
  slug?: string;
  name: string;
  products: Array<ProductDocument | Types.ObjectId>;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const supplierSchema = new Schema(
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
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

supplierSchema.pre(
  'save',
  async function (this: SupplierDocument, next: mongoose.HookNextFunction) {
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

export const Supplier = mongoose.model<SupplierDocument>(
  'Supplier',
  supplierSchema
);

export const SupplierTC = composeMongoose<SupplierDocument, any>(Supplier);

SupplierTC.addRelation('products', {
  resolver: () => ProductTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.products,
    skip: null,
    sort: null,
  },
  projection: { products: 1 },
});
