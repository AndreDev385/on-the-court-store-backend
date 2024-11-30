import mongoose, { Schema, Document, Types } from 'mongoose';
import slugs from 'slugs';
import { composeMongoose } from 'graphql-compose-mongoose';
import { BrandDocument, BrandTC } from './Brand';

export interface ModelDocument extends Document {
  slug?: string;
  name: string;
  brand: BrandDocument | Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const modelSchema = new Schema(
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
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
  },
  {
    timestamps: true,
  }
);

modelSchema.pre(
  'save',
  async function (this: ModelDocument, next: mongoose.HookNextFunction) {
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

export const Model = mongoose.model<ModelDocument>('Model', modelSchema);
export const ModelTC = composeMongoose<ModelDocument, any>(Model);

ModelTC.addRelation('brand', {
  resolver: () => BrandTC.mongooseResolvers.dataLoader(),
  prepareArgs: {
    _id: (source) => source.brand,
    skip: null,
    sort: null,
  },
  projection: { brand: 1 },
});
