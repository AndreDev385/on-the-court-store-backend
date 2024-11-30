import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import slugs from 'slugs';
import { BrandDocument, BrandTC } from './Brand';
import { ModelDocument, ModelTC } from './Model';
import { VariantDocument, VariantTC } from './Variant';
import { VariantValueDocument, VariantValueTC } from './VariantValue';
import { SupplierDocument, SupplierTC } from './Supplier';
import { CategoryDocument, CategoryTC } from './Category';
import { CommentDocument, CommentTC } from './Comment';

export interface ProductDocument extends Document {
  slug?: string;
  altCode?: string;
  title: string;
  description?: string;
  dataSheet?: string;
  priority: number;
  photos: Array<string>;
  rating?: number;
  points?: number;
  reviews?: number;
  isService?: boolean;
  active?: boolean;
  volatileInventory?: boolean;
  brand?: BrandDocument | Types.ObjectId;
  variants?: Array<VariantDocument | Types.ObjectId>;
  variantValues?: Array<VariantValueDocument | Types.ObjectId>;
  categories?: Array<CategoryDocument | Types.ObjectId>;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  extraInfo?: Array<{ name: string; value: string }>;
  comments?: Array<CommentDocument | Types.ObjectId>;
  _model?: ModelDocument | Types.ObjectId;
  suppliers?: Array<SupplierDocument | Types.ObjectId>;
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Defined Mongoose Schema
const productSchema = new Schema(
  {
    slug: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    altCode: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dataSheet: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    priority: {
      type: Number,
      required: [true, 'Please provide a priority'],
    },
    rating: {
      type: Number,
      default: 0,
    },
    points: {
      type: Number,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    isService: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    volatileInventory: {
      type: Boolean,
      default: false,
    },
    photos: [
      {
        type: String,
      },
    ],
    price: {
      type: Number,
    },
    compareAtPrice: {
      type: Number,
    },
    extraInfo: [
      {
        name: String,
        value: String,
      },
    ],
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    _model: {
      type: Schema.Types.ObjectId,
      ref: 'Model',
    },
    variants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Variant',
      },
    ],
    variantValues: [
      {
        type: Schema.Types.ObjectId,
        ref: 'VariantValue',
      },
    ],
    suppliers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
      },
    ],
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
);

productSchema.pre(
  'save',
  async function (this: ProductDocument, next: mongoose.HookNextFunction) {
    if (!this.isModified('title')) {
      console.log('next');
      return next();
    }
    this.slug = slugs(this.title);
    console.log(this.slug);
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`);
    const withSlugs = await (this as any).constructor.find({ slug: slugRegEx });
    if ((withSlugs as Array<any>).length) {
      this.slug = `${this.slug}-${withSlugs.length + 1}`;
    }
    next();
  }
);

// To search by text fields
productSchema.index({
  title: 'text',
  'extraInfo.name': 'text',
  'extraInfo.value': 'text',
});

// 3. Create Mongo Model and Graphql Schema
export const Product = mongoose.model<ProductDocument>(
  'Product',
  productSchema
);
export const ProductTC = composeMongoose<ProductDocument, any>(Product);

ProductTC.addRelation('brand', {
  resolver: () => BrandTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.brand,
    skip: null,
    sort: null,
  },
  projection: { brand: 1 },
});

ProductTC.addRelation('model', {
  resolver: () => ModelTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source._model,
    skip: null,
    sort: null,
  },
  projection: { _model: 1 },
});

ProductTC.addRelation('supplier', {
  resolver: () => SupplierTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.suppliers,
    skip: null,
    sort: null,
  },
  projection: { suppliers: 1 },
});

ProductTC.addRelation('variants', {
  resolver: () => VariantTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.variants,
    skip: null,
    sort: null,
  },
  projection: { variants: 1 },
});

ProductTC.addRelation('variantValues', {
  resolver: () => VariantValueTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.variantValues,
    skip: null,
    sort: null,
  },
  projection: { variantValues: 1 },
});

ProductTC.addRelation('categories', {
  resolver: () => CategoryTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.categories,
    skip: null,
    sort: null,
  },
  projection: { categories: 1 },
});

ProductTC.addRelation('comments', {
  resolver: () => CommentTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.comments,
    skip: null,
    sort: null,
  },
  projection: { comments: 1 },
});
