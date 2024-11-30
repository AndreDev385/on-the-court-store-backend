import mongoose, { Schema, Document, Types } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import slugs from 'slugs';
import { ShippingDocument, ShippingTC } from './Shipping';

export interface LocationDocument extends Document {
  slug?: string;
  name: string;
  address: string;
  shippingOptions: Array<Types.ObjectId | ShippingDocument>;
  lat?: number;
  lon?: number;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const locationSchema = new Schema(
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
    address: {
      type: String,
      required: [true, 'Please provide an address'],
      trim: true,
    },
    shippingOptions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Shipping',
        required: [true, 'Please provide a shipping option'],
      },
    ],
    lat: {
      type: Number,
      required: [true, 'Please provide a latitud'],
    },
    lon: {
      type: Number,
      required: [true, 'Please provide a longitud'],
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

locationSchema.pre(
  'save',
  async function (this: LocationDocument, next: mongoose.HookNextFunction) {
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

export const Location = mongoose.model<LocationDocument>(
  'Location',
  locationSchema
);
export const LocationTC = composeMongoose<LocationDocument, any>(Location);

LocationTC.addRelation('shippingOptions', {
  resolver: () => ShippingTC.mongooseResolvers.dataLoaderMany(),
  prepareArgs: {
    _ids: (source) => source.shippingOptions,
    skip: null,
    sort: null,
  },
  projection: { shippingOptions: 1 },
});
