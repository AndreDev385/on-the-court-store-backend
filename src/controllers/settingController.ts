import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { Setting, SettingTC } from '../models/Setting';

type TCreateCarouselImageInput = {
  title?: string;
  description?: string;
  url: string;
};
type TCreatePromotionInput = {
  title?: string;
  description?: string;
  url: string;
};

type TCreateBannerInput = {
  text: string;
  active: boolean;
};

type TCreateSettingInput = {
  carouselImages: Array<TCreateCarouselImageInput>;
  promotions: Array<TCreatePromotionInput>;
  banner: TCreateBannerInput;
  active?: boolean;
};

const CreateSettingInput = `
  input CreateSettingInput {
    carouselImages: [CreateCarouselImageInput!]!
    promotions: [CreatePromotionInput!]!
    banner: CreateBannerInput!
    active: Boolean
  }
  input CreateCarouselImageInput {
    title: String
    description: String
    url: String!
  }
  input CreatePromotionInput {
    title: String
    description: String
    url: String!
  }
  input CreateBannerInput {
    text: String!
    active: Boolean!
  }
`;

type TUpdateCarouselImageInput = {
  title?: string;
  description?: string;
  url: string;
};

type TUpdatePromotionsInput = {
  title?: string;
  description?: string;
  url: string;
};

type TUpdateSettingInput = {
  _id?: any;
  carouselImages?: Array<TUpdateCarouselImageInput>;
  promotions?: Array<TUpdatePromotionsInput>;
  banner?: {
    text: string;
    active: boolean;
  };
  categories: any[];
  active?: boolean;
};

const UpdateSettingInput = `
  input UpdateSettingInput {
    _id: MongoID
    carouselImages: [UpdateCarouselImageInput!]
    promotions: [UpdatePromotionsInput!]
    banner: UpdateBannerInput
    categories: [MongoID!]
    active: Boolean
  }
  input UpdateCarouselImageInput {
    title: String
    description: String
    url: String!
  }
  input UpdatePromotionsInput {
    title: String
    description: String
    url: String!
  }
  input UpdateBannerInput {
    text: String!
    active: Boolean!
  }
`;

export const createSetting = schemaComposer.createResolver<
  any,
  {
    data: TCreateSettingInput;
  }
>({
  name: 'createSetting',
  type: SettingTC.getType(),
  description: 'Generate a setting config',
  kind: 'mutation',
  args: {
    data: CreateSettingInput,
  },
  resolve: async ({ args, context }) => {
    await Setting.updateMany({}, { active: false }).exec();
    const setting = await Setting.create({
      carouselImages: args.data.carouselImages,
      promotions: args.data.promotions,
      banner: args.data.banner,
      categories: [],
    });

    return setting;
  },
});

export const updateSetting = schemaComposer.createResolver<
  any,
  {
    data: TUpdateSettingInput;
  }
>({
  name: 'updateSetting',
  type: SettingTC.getType(),
  description: 'Update a setting config',
  kind: 'mutation',
  args: {
    data: UpdateSettingInput,
  },
  resolve: async ({ args, context }) => {
    let setting = await Setting.findOne({ active: true }).exec();
    let wasUpdated = false;

    if (!setting) {
      setting = await Setting.create({
        promotions: [],
        carouselImages: [],
        banner: {},
        categories: [],
      });
    }

    if (args?.data?.promotions) {
      setting.promotions = args.data.promotions;
      wasUpdated = true;
    }

    if (args?.data?.carouselImages) {
      setting.carouselImages = args.data.carouselImages;
      wasUpdated = true;
    }

    if (args?.data?.banner) {
      setting.banner = args.data.banner;
      wasUpdated = true;
    }

    if (args?.data?.categories) {
      setting.categories = args?.data?.categories;
      wasUpdated = true;
    }

    if (wasUpdated) {
      await setting.save();
    }

    return setting;
  },
});

export const currentSetting = schemaComposer.createResolver({
  name: 'currentSetting',
  type: SettingTC.getType(),
  description: 'Get the active setting',
  kind: 'query',
  args: {},
  resolve: async ({ args, context }) => {
    const setting = await Setting.findOne({ active: true });

    if (!setting) {
      throw new ApolloError(`Setting doesn't exists`);
    }

    return setting;
  },
});
