import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { Brand, BrandTC } from '../models/Brand';
import { Category, CategoryTC } from '../models/Category';
import { Product, ProductTC } from '../models/Product';

export const getBrandsByCategory = schemaComposer.createResolver<
  any,
  {
    categorySlug: string;
  }
>({
  name: 'getBrandsByCategory',
  type: BrandTC.getTypePlural(),
  description: 'Search brands by category slug',
  kind: 'query',
  args: {
    categorySlug: 'String!',
  },
  async resolve({ args, context }) {
    const category = await Category.findOne({ slug: args.categorySlug });
    if (!category) {
      throw new ApolloError("Category doesn't exists");
    }
    const products = await Product.find({
      active: true,
      isService: false,
      categories: {
        $in: [category._id],
      },
    });
    const brands = await Brand.find({
      _id: {
        $in: products.map((product) => product.brand),
      },
    });
    return brands;
  },
});

export const getBrandsByCategories = schemaComposer.createResolver<
  any,
  {
    slugs: string[];
  }
>({
  name: 'getBrandsByCategories',
  type: BrandTC.getTypePlural(),
  description: 'Search brands by categories slugs',
  kind: 'query',
  args: {
    slugs: '[String!]!',
  },
  async resolve({ args, context }) {
    const categories = await Category.find({ slug: { $in: args?.slugs } });
    if (!categories || categories?.length <= 0) {
      throw new ApolloError("Category doesn't exists");
    }
    const products = await Product.find({
      active: true,
      isService: false,
      categories: {
        $in: categories?.map((category) => category?._id) ?? [],
      },
    });
    const brands = await Brand.find({
      _id: {
        $in: products.map((product) => product.brand),
      },
    });
    return brands;
  },
});

export const getProductByCategoryBrand = schemaComposer.createResolver<
  any,
  {
    categorySlug: string;
    brandSlug: string;
  }
>({
  name: 'getProductByCategoryBrand',
  type: ProductTC.getTypePlural(),
  description: 'Search products based on brands and category slug',
  kind: 'query',
  args: {
    categorySlug: 'String!',
    brandSlug: 'String!',
  },
  async resolve({ args, context }) {
    const category = await Category.findOne({ slug: args.categorySlug });
    const brand = await Brand.findOne({ slug: args.brandSlug });
    if (!category) {
      throw new ApolloError("Category doesn't exists");
    }
    if (!brand) {
      throw new ApolloError("Brand doesn't exists");
    }
    const products = await Product.find({
      brand: brand._id,
      active: true,
      isService: false,
      categories: {
        $in: [category._id],
      },
    });
    return products;
  },
});

export const searchByCategory = schemaComposer.createResolver({
  name: 'searchByCategory',
  type: ProductTC.getTypePlural(),
  description: 'Search products by category',
  kind: 'query',
  args: {
    categorySlug: 'String!',
  },
  resolve: async ({ args, context }) => {
    const { categorySlug } = args;
    const category = await Category.findOne({ slug: categorySlug });

    if (!category) {
      throw new ApolloError("Category doesn't exists");
    }

    const products = await Product.find({
      active: true,
      isService: false,
      categories: category._id,
    });

    return products;
  },
});

export const searchByBrand = schemaComposer.createResolver({
  name: 'searchByBrand',
  type: ProductTC.getTypePlural(),
  description: 'Search products by Brand',
  kind: 'query',
  args: {
    brandSlug: 'String!',
  },
  resolve: async ({ args, context }) => {
    const { brandSlug } = args;
    const brand = await Brand.findOne({ slug: brandSlug });

    if (!brand) {
      throw new ApolloError("Brand doesn't exists");
    }

    const products = await Product.find({
      active: true,
      isService: false,
      brand: brand._id,
    });

    return products;
  },
});

export const searchProduct = schemaComposer.createResolver({
  name: 'searchProduct',
  type: ProductTC.getTypePlural(),
  description: 'Search products by name, description, extra info name or value',
  kind: 'query',
  args: {
    searchString: 'String!',
  },
  resolve: async ({ args, context }) => {
    const { searchString } = args;
    const products = await Product.find({
      active: true,
      isService: false,
      $text: { $search: searchString as string },
    });

    return products;
  },
});

const SearchCategoriesByCategory = `
  type SearchCategoriesByCategoryType {
    data: [SearchCategoriesByCategory]
  }
  type SearchCategoriesByCategory {
    category: ${CategoryTC.getTypeName()}!
    products: [Product]!
  }
`;

export const searchCategoriesByCategory = schemaComposer.createResolver<
  any,
  {
    data: {
      slug: string;
    };
  }
>({
  name: 'searchCategoriesByCategory',
  type: SearchCategoriesByCategory,
  description: '...',
  kind: 'query',
  args: {
    data: `input SearchCategoriesByCategoryInput {
      slug: String!
    }`,
  },
  async resolve({ args, context }) {
    const category = await Category.findOne({ slug: args?.data?.slug });
    if (!category) {
      throw new ApolloError(
        `La categoría con slug ${args?.data?.slug} no existe`
      );
    }
    const products = await Product.find({
      categories: { $in: [category?._id] },
    });
    const categoriesIds = [
      ...new Set(
        products?.map((product) => product?.categories)?.flat(Infinity) ?? []
      ),
    ];
    let categories = await Category.find({ _id: { $in: categoriesIds } });
    categories =
      categories?.filter((cat) => String(cat?._id) !== String(category?._id)) ??
      [];
    const data = categories.map((cat) => ({
      category: cat,
      products:
        products
          ?.filter((product) => product?.categories?.includes(cat?._id))
          ?.slice(0, 4) ?? [],
    }));
    return { data };
  },
});

export const searchProductByCategories = schemaComposer.createResolver<
  any,
  {
    data: {
      slugs: Array<string>;
    };
  }
>({
  name: 'searchProductByCategories',
  type: ProductTC.getTypePlural(),
  description: 'Search products by name, description, extra info name or value',
  kind: 'query',
  args: {
    data: `input SearchProductByCategoriesInput {
      slugs: [String!]!
    }`,
  },
  async resolve({ args, context }) {
    const categories = await Category.find({
      slug: { $in: args?.data?.slugs },
    });
    const products = await Product.find({
      $and:
        categories?.map((category) => ({
          categories: { $in: category?._id },
        })) ?? [],
    });
    return products;
    // return null;
  },
});
