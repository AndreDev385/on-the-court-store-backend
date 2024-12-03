import { schemaComposer } from 'graphql-compose';
import { EventEmitter } from 'events';
import { fork } from 'child_process';
import { v4 as uuid } from 'uuid';
import { resolve } from 'path';
import ApolloError from '../lib/NoSentryError';
import { Brand } from '../models/Brand';
import { Category } from '../models/Category';
import { Product, ProductTC, ProductDocument } from '../models/Product';
import { Variant, VariantDocument } from '../models/Variant';
import { VariantValue, VariantValueDocument } from '../models/VariantValue';

type TCreateVariantInput = {
  title: string;
  tags: Array<string>;
};

type TCreateVariantValueInput = {
  value: {
    variant1: string;
    variant2?: string;
    variant3?: string;
  };
  price: number;
  compareAtPrice?: number;
  quantity: number;
  photo?: string;
  sku?: string;
  location: string;
  disabled?: boolean;
};

type TCreateExtraInfoInput = {
  name: string;
  value: string;
};

type TCreateProductInput = {
  title: string;
  description: string;
  dataSheet?: string;
  priority: number;
  isService?: boolean;
  volatileInventory?: boolean;
  photos: Array<string>;
  brand?: string;
  variants?: Array<TCreateVariantInput>;
  variantValues?: Array<TCreateVariantValueInput>;
  categories?: Array<any>;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  extraInfo?: Array<TCreateExtraInfoInput>;
  model?: string;
  supplier?: string;
};

const CreateProductInput = `
  input CreateProductInput {
    title: String!
    description: String!
    dataSheet: String
    priority: Int!
    isService: Boolean
    volatileInventory: Boolean
    photos: [String!]!
    brand: String
    variants: [CreateVariantInput!]
    variantValues: [CreateVariantValueInput!]
    categories: [String!]
    sku: String
    price: Int
    compareAtPrice: Int
    extraInfo: [CreateExtraInfoInput]
    model: String
    supplier: String
  }
  input CreateVariantInput {
    title: String!
    tags: [String!]!
  }
  input CreateVariantValueValueInput {
    variant1: String!
    variant2: String
    variant3: String
  }
  input CreateVariantValueInput {
    value: CreateVariantValueValueInput!
    price: Int!
    compareAtPrice: Int
    quantity: Int!
    photo: String
    sku: String
    location: String!
    disabled: Boolean
  }
  input CreateExtraInfoInput {
    name: String!
    value: String!
  }
`;

type TUpdateVariantInput = {
  _id: string;
  title: string;
  tags: Array<string>;
};

type TCreateOrUpdateVariantInput = {
  create?: Array<TCreateVariantInput>;
  update?: Array<TUpdateVariantInput>;
};

type TUpdateVariantValueInput = {
  _id: string;
  value: {
    variant1: string;
    variant2?: string;
    variant3?: string;
  };
  price: number;
  compareAtPrice?: number;
  quantity: number;
  photo?: string;
  sku?: string;
  location: string;
  disabled?: boolean;
};

type TCreateOrUpdateVariantValueInput = {
  create?: Array<TCreateVariantValueInput>;
  update?: Array<TUpdateVariantValueInput>;
};

type TUpdateExtraInfoInput = {
  name: string;
  value: string;
};

type TUpdateProductInput = {
  title?: string;
  description?: string;
  dataSheet?: string;
  priority?: number;
  isService?: boolean;
  volatileInventory?: boolean;
  photos?: Array<string>;
  brand?: string;
  variants?: TCreateOrUpdateVariantInput;
  variantValues?: TCreateOrUpdateVariantValueInput;
  sku?: string;
  price?: number;
  compareAtPrice?: number;
  extraInfo?: Array<TUpdateExtraInfoInput>;
  model?: string;
  supplier?: string;
  active: boolean;
};

const UpdateProductInput = `
  input UpdateProductInput {
    title: String
    description: String
    dataSheet: String
    priority: Int
    isService: Boolean
    volatileInventory: Boolean
    photos: [String]
    brand: String
    variants: CreateOrUpdateVariantInput
    variantValues: CreateOrUpdateVariantValueInput
    categories: [String]
    sku: String
    price: Int
    compareAtPrice: Int
    extraInfo: [UpdateExtraInfoInput]
    model: String
    supplier: String
    active: Boolean
  }
  input CreateOrUpdateVariantInput {
    create: [CreateVariantInput]
    update: [UpdateVariantInput]
  }
  input UpdateVariantInput {
    _id: String
    title: String
    tags: [String]
  }
  input UpdateVariantValueValueInput {
    variant1: String!
    variant2: String
    variant3: String
  }
  input CreateOrUpdateVariantValueInput {
    create: [CreateVariantValueInput]
    update: [UpdateVariantValueInput]
  }
  input UpdateVariantValueInput {
    _id: String!
    value: UpdateVariantValueValueInput!
    price: Int!
    compareAtPrice: Int
    quantity: Int!
    photo: String
    sku: String
    location: String!
    disabled: Boolean
  }
  input UpdateExtraInfoInput {
    name: String!
    value: String!
  }
`;

export const createProduct = schemaComposer.createResolver<
  any,
  { data: TCreateProductInput }
>({
  name: 'createProduct',
  type: ProductTC.getType(),
  description: 'Create a new product into the database',
  kind: 'mutation',
  args: {
    data: CreateProductInput,
  },
  async resolve({ args }) {
    if (args.data.isService) {
      const service = await Product.create({
        title: args.data.title,
        description: args.data.description,
        priority: args.data.priority,
        isService: args.data.isService,
        active: true,
        photos: args.data.photos,
        price: args.data.price,
        compareAtPrice: args.data.compareAtPrice,
      });
      return service;
    }
    const [variants, variantValues] = (await Promise.all([
      Variant.create([...(args?.data?.variants ?? [])]),
      VariantValue.create([
        ...(args?.data?.variantValues?.map(
          ({
            value,
            price,
            compareAtPrice,
            quantity,
            photo,
            sku,
            location,
            disabled,
          }) => ({
            value,
            price,
            compareAtPrice,
            quantity,
            photo,
            sku,
            location,
            disabled,
          })
        ) ?? []),
      ]),
    ])) as [unknown, unknown] as [
      Array<VariantDocument>,
      Array<VariantValueDocument>
    ];
    const product = await Product.create({
      title: args.data.title,
      description: args.data.description,
      dataSheet: args.data.dataSheet,
      priority: args.data.priority,
      isService: args.data.isService,
      photos: args.data.photos,
      brand: args.data.brand,
      sku: args.data.sku,
      extraInfo: args.data.extraInfo,
      categories: args.data.categories,
      volatileInventory: args?.data?.volatileInventory ?? false,
      // _model: args.data.model,
      // supplier: args.data.supplier,
      variants: variants.map((variant) => variant._id),
      variantValues: variantValues.map((variantValue) => variantValue._id),
    });
    return product;
  },
});

export const updateProduct = schemaComposer.createResolver<
  any,
  {
    data: TUpdateProductInput;
    filter: {
      _id: string;
    };
  }
>({
  name: 'updateProduct',
  type: ProductTC.getType(),
  description: 'Update a product into the database',
  kind: 'mutation',
  args: {
    data: UpdateProductInput,
    filter: 'input FilterOneProduct { _id: String }',
  },
  async resolve({ args }) {
    let product = await Product.findOne({ _id: args.filter._id });
    if (!product) {
      throw new ApolloError(
        `The product with _id: ${args.filter._id} could be found!`
      );
    }
    if (!args.data.title) {
      product.active = args.data.active;
      return product.save();
    }
    if (product.isService) {
      const service = await Product.findOneAndUpdate(
        { _id: args.filter._id },
        {
          title: args.data.title,
          description: args.data.description,
          dataSheet: args.data.dataSheet,
          priority: args.data.priority,
          isService: args.data.isService,
          active: true,
          photos: args.data.photos,
          price: args.data.price,
          compareAtPrice: args.data.compareAtPrice,
        },
        { runValidators: true, new: true }
      );
      return service;
    }
    const { variantValues, variants } = args.data;
    if (variantValues) {
      const { update, create } = variantValues;
      await Promise.all([
        ...update.map(({ _id, price, compareAtPrice, sku, quantity }) =>
          VariantValue.findOneAndUpdate(
            { _id },
            { price, compareAtPrice, sku, quantity },
            { new: true, runValidators: true }
          ).exec()
        ),
      ]);
      if (create && create.length > 0) {
        const newVariantValues = (await VariantValue.create([
          ...(create?.map(
            ({
              price,
              compareAtPrice,
              sku,
              quantity,
              value,
              location,
              photo,
              disabled,
            }) => ({
              price,
              compareAtPrice,
              sku,
              quantity,
              value,
              location: location as string,
              photo,
              disabled,
            })
          ) ?? []),
        ])) as unknown as Array<VariantValueDocument>;
        product.variantValues = [
          ...new Set([
            ...(newVariantValues?.map((doc) => doc._id) ?? []),
            ...product.variantValues,
          ]),
        ];
        await product.save();
      }
    }
    if (variants) {
      const { update, create } = variants;
      await Promise.all([
        ...update.map(({ _id, tags, title }) =>
          Variant.findOneAndUpdate(
            { _id },
            { tags, title },
            { new: true, runValidators: true }
          ).exec()
        ),
      ]);
      // TODO: FIX THIS BETA!
      // await Variant.create(create);
    }
    const data = { ...args.data };
    delete data.variants;
    delete data.variantValues;
    product = await Product.findOneAndUpdate(
      { _id: args.filter._id },
      { ...data } as unknown as ProductDocument,
      { runValidators: true, new: true }
    );
    return product;
  },
});

type TFilterGetProductInput = {
  _id?: any;
  slug?: string;
  title?: string;
  description?: string;
  priority?: number;
  rating?: number;
  isService?: boolean;
  active?: boolean;
  brand?: any;
};

const FilterGetProductInput = `
  input FilterGetProductInput {
    _id: MongoID
    slug: String
    title: String
    description: String
    priority: Float
    rating: Float
    isService: Boolean
    active: Boolean
    brand: MongoID
  }
`;

export const getProduct = schemaComposer.createResolver<
  any,
  {
    filter: TFilterGetProductInput;
  }
>({
  name: 'getProduct',
  type: `type ProductProfile {
    product: Product!
    suggestions: [Product]!
  }`,
  description: 'Find One Product in the Database',
  kind: 'query',
  args: {
    filter: FilterGetProductInput,
  },
  async resolve({ args }) {
    const product = await Product.findOne(args?.filter);
    let products = await Product.find({
      _id: { $nin: [product?._id] },
      active: true,
      isService: false,
      categories: {
        $in: product?.categories,
      },
    });

    if (products?.length < 3) {
      products = await Product.find({ active: true, isService: false });
    }
    products = products?.filter(
      (_products) => product.title !== _products.title
    );
    if (products?.length >= 4) {
      products = products?.slice(0, 3);
    }
    return {
      product,
      suggestions: products,
    };
  },
});

type TProductPaginationByCategoriesInput = {
  page: number;
  perPage: number;
  categories: Array<string>;
};

const ProductPaginationByCategoriesInput = `
  input ProductPaginationByCategoriesInput {
    page: Int!
    perPage: Int!
    categories: [String!]!
  }
`;

const ProductPaginationByCategoriesInfo = `
  type ProductPaginationByCategoriesInfo {
    count: Int
    items: [Product!]
    pageInfo: PaginationInfo!
  }
`;

export const productPaginationByCategories = schemaComposer.createResolver<
  any,
  {
    data: TProductPaginationByCategoriesInput;
  }
>({
  name: 'productPaginationByCategories',
  type: ProductPaginationByCategoriesInfo,
  description: 'Pagination for products',
  kind: 'query',
  args: {
    data: ProductPaginationByCategoriesInput,
  },
  async resolve({ args }) {
    const categories = await Category.find({
      slug: { $in: args?.data?.categories },
    });
    const itemCount = await Product.countDocuments({
      active: true,
      isService: false,
      categories: { $all: categories?.map((category) => category?._id) ?? [] },
    });
    const pageCount = Math.ceil(itemCount / args?.data?.perPage);
    if (args?.data?.page > pageCount) {
      throw new ApolloError(
        `La pagina ${args?.data?.page} no se encuentra disponible`
      );
    }
    const skip = Math.max(0, (args?.data?.page - 1) * args?.data?.perPage);
    const products = await Product.find(
      {
        active: true,
        isService: false,
        categories: {
          $all: categories?.map((category) => category?._id) ?? [],
        },
      },
      '',
      { skip, limit: args?.data?.perPage, sort: { createdAt: -1 } }
    );
    return {
      count: itemCount,
      items: products,
      pageInfo: {
        currentPage: args?.data?.page,
        perPage: args?.data?.perPage,
        pageCount,
        itemCount,
        hasPreviousPage: args?.data?.page > 1,
        hasNextPage:
          products.length > args?.data?.perPage ||
          args?.data?.page * args?.data?.perPage < itemCount,
      },
    };
  },
});

type TProductByBrandsCategoriesPaginationInput = {
  page: number;
  perPage: number;
  categories: Array<string>;
  brands: Array<string>;
};

const ProductByBrandsCategoriesPaginationInput = `
  input ProductByBrandsCategoriesPaginationInput {
    page: Int!
    perPage: Int!
    categories: [String!]!
    brands: [String!]!
  }
`;

export const productByBrandsCategoriesPagination =
  schemaComposer.createResolver<
    any,
    {
      data: TProductByBrandsCategoriesPaginationInput;
    }
  >({
    name: 'productByBrandsCategoriesPagination',
    type: ProductPaginationByCategoriesInfo,
    description: 'Search products based on brands and category slug',
    kind: 'query',
    args: {
      data: ProductByBrandsCategoriesPaginationInput,
    },
    async resolve({ args, context }) {
      const categories = await Category.find({
        slug: { $in: args?.data?.categories },
      });
      const brands = await Brand.find({ slug: { $in: args?.data?.brands } });
      if (!categories || categories?.length <= 0) {
        throw new ApolloError("Category doesn't exists");
      }
      if (!brands || brands?.length <= 0) {
        throw new ApolloError("Brand doesn't exists");
      }
      const itemCount = await Product.countDocuments({
        active: true,
        isService: false,
        categories: {
          $in: categories?.map((category) => category?._id) ?? [],
        },
        brand: {
          $in: brands?.map((brand) => brand?._id) ?? [],
        },
      });
      const pageCount = Math.ceil(itemCount / args?.data?.perPage);
      if (args?.data?.page > pageCount) {
        throw new ApolloError(
          `La pagina ${args?.data?.page} no se encuentra disponible`
        );
      }
      const skip = Math.max(0, (args?.data?.page - 1) * args?.data?.perPage);
      const products = await Product.find(
        {
          active: true,
          isService: false,
          categories: {
            $in: categories?.map((category) => category?._id) ?? [],
          },
          brand: {
            $in: brands?.map((brand) => brand?._id) ?? [],
          },
        },
        '',
        { skip, limit: args?.data?.perPage, sort: { createdAt: -1 } }
      );
      return {
        count: itemCount,
        items: products,
        pageInfo: {
          currentPage: args?.data?.page,
          perPage: args?.data?.perPage,
          pageCount,
          itemCount,
          hasPreviousPage: args?.data?.page > 1,
          hasNextPage:
            products.length > args?.data?.perPage ||
            args?.data?.page * args?.data?.perPage < itemCount,
        },
      };
    },
  });

type TSearchProductByCategoriesPaginationInput = {
  page: number;
  perPage: number;
  slugs: Array<string>;
};

const SearchProductByCategoriesPaginationInput = `
  input SearchProductByCategoriesPaginationInput {
    page: Int!
    perPage: Int!
    slugs: [String!]!
  }
`;

export const searchProductByCategoriesPagination =
  schemaComposer.createResolver<
    any,
    {
      data: TSearchProductByCategoriesPaginationInput;
    }
  >({
    name: 'searchProductByCategoriesPagination',
    type: ProductPaginationByCategoriesInfo,
    description:
      'Search products by name, description, extra info name or value',
    kind: 'query',
    args: {
      data: SearchProductByCategoriesPaginationInput,
    },
    async resolve({ args, context }) {
      const categories = await Category.find({
        slug: { $in: args?.data?.slugs },
      });
      if (!categories || categories?.length <= 0) {
        throw new ApolloError("Category doesn't exists");
      }
      const itemCount = await Product.countDocuments({
        active: true,
        isService: false,
        categories: {
          $in: categories?.map((category) => category?._id) ?? [],
        },
      });
      const pageCount = Math.ceil(itemCount / args?.data?.perPage);
      if (args?.data?.page > pageCount) {
        throw new ApolloError(
          `La pagina ${args?.data?.page} no se encuentra disponible`
        );
      }
      const skip = Math.max(0, (args?.data?.page - 1) * args?.data?.perPage);
      const products = await Product.find(
        {
          active: true,
          isService: false,
          categories: {
            $in: categories?.map((category) => category?._id) ?? [],
          },
        },
        '',
        { skip, limit: args?.data?.perPage, sort: { createdAt: -1 } }
      );
      return {
        count: itemCount,
        items: products,
        pageInfo: {
          currentPage: args?.data?.page,
          perPage: args?.data?.perPage,
          pageCount,
          itemCount,
          hasPreviousPage: args?.data?.page > 1,
          hasNextPage:
            products.length > args?.data?.perPage ||
            args?.data?.page * args?.data?.perPage < itemCount,
        },
      };
    },
  });

type TSearchProductPaginationInput = {
  page: number;
  perPage: number;
  text: string;
};

const SearchProductPaginationInput = `
  input SearchProductPaginationInput {
    page: Int!
    perPage: Int!
    text: String!
  }
`;

export const searchProductPagination = schemaComposer.createResolver<
  any,
  {
    data: TSearchProductPaginationInput;
  }
>({
  name: 'searchProductPagination',
  type: ProductPaginationByCategoriesInfo,
  description: '...',
  kind: 'query',
  args: {
    data: SearchProductPaginationInput,
  },
  async resolve({ args, context }) {
    const itemCount = await Product.countDocuments({
      active: true,
      isService: false,
      $text: { $search: args?.data?.text },
    });
    const pageCount = Math.ceil(itemCount / args?.data?.perPage);
    if (args?.data?.page > pageCount) {
      throw new ApolloError(
        `La pagina ${args?.data?.page} no se encuentra disponible`
      );
    }
    const skip = Math.max(0, (args?.data?.page - 1) * args?.data?.perPage);
    const products = await Product.find(
      {
        active: true,
        isService: false,
        $text: { $search: args?.data?.text },
      },
      '',
      { skip, limit: args?.data?.perPage, sort: { createdAt: -1 } }
    );
    return {
      count: itemCount,
      items: products,
      pageInfo: {
        currentPage: args?.data?.page,
        perPage: args?.data?.perPage,
        pageCount,
        itemCount,
        hasPreviousPage: args?.data?.page > 1,
        hasNextPage:
          products.length > args?.data?.perPage ||
          args?.data?.page * args?.data?.perPage < itemCount,
      },
    };
  },
});

export const homeProducts = schemaComposer.createResolver({
  name: 'homeProducts',
  type: ProductTC.getTypePlural(),
  description: '...',
  kind: 'query',
  args: {},
  async resolve({ args, context }) {
    const categories = await Category.find({
      slug: {
        $in: [
          'ropa',
          'cuerdas',
          'raquetas',
          'pelotas',
          'accesorios',
          'zapatos-2',
          'pelotas',
          'ropa-de-ejercicio',
        ],
      },
    });
    const products: ProductDocument[] = await Promise.all(
      categories.map((category) =>
        Product.findOne({ categories: { $in: [category?._id] } }).exec()
      )
    );
    if (products?.length < 8) {
      const _products = await Product.find({
        _id: { $nin: products.map((p) => p._id) },
      });
      products.push(..._products?.slice(0, 8 - products?.length));
    }
    return products;
  },
});

export const UPLOAD_RESPONSE = `
  type UploadResponse {
    success: Boolean!
    err: String
    msg: String
  }
`;

export const uploadManyProducts = schemaComposer.createResolver<
  any,
  {
    data: {
      url: string;
    };
  }
>({
  name: 'uploadManyProducts',
  type: UPLOAD_RESPONSE,
  description: '...',
  kind: 'mutation',
  args: {
    data: `
      input UploadManyProductsInput {
        url: String!
      }
    `,
  },
  async resolve({ args, context }) {
    try {
      const event = new EventEmitter();
      const child = fork(`${__dirname}/productRunner`, { detached: true });
      const id = uuid();
      child.send({
        data: {
          ...(args?.data ?? {}),
        },
        event: id,
      });
      event.once(id, (value) => {
        console.log(value);
      });
      child.on('message', (msg) => {
        console.log(msg);
      });
      return { success: true };
    } catch (err) {
      console.log(err);
      return { success: false, err: err.message };
    }
  },
});

type TFilterProductsByPricePaginationInput = {
  page: number;
  perPage: number;
  min?: number;
  max?: number;
};

const FilterProductsByPricePaginationInput = `
  input FilterProductsByPricePaginationInput {
    page: Int!
    perPage: Int!
    min: Float
    max: Float
  }
`;

export const filterProductsByPricePagination = schemaComposer.createResolver<
  any,
  {
    data: TFilterProductsByPricePaginationInput;
  }
>({
  name: 'filterProductsByPricePagination',
  type: ProductPaginationByCategoriesInfo,
  description: '...',
  kind: 'query',
  args: {
    data: FilterProductsByPricePaginationInput,
  },
  async resolve({ args, context }) {
    const variantValues = await VariantValue.find({
      price: {
        $gte: args?.data?.min ?? 0,
        $lte: args?.data?.max ?? Number.MAX_SAFE_INTEGER - 1,
      },
    });
    const itemCount = await Product.countDocuments({
      active: true,
      isService: false,
      variantValues: {
        $in: variantValues?.map((vv) => vv._id),
      },
    });
    const pageCount = Math.ceil(itemCount / args?.data?.perPage);
    if (args?.data?.page > pageCount) {
      throw new ApolloError(
        `La pagina ${args?.data?.page} no se encuentra disponible`
      );
    }
    const skip = Math.max(0, (args?.data?.page - 1) * args?.data?.perPage);
    const products = await Product.find(
      {
        active: true,
        isService: false,
        variantValues: {
          $in: variantValues?.map((vv) => vv._id),
        },
      },
      '',
      { skip, limit: args?.data?.perPage, sort: { createdAt: -1 } }
    );
    return {
      count: itemCount,
      items: products,
      pageInfo: {
        currentPage: args?.data?.page,
        perPage: args?.data?.perPage,
        pageCount,
        itemCount,
        hasPreviousPage: args?.data?.page > 1,
        hasNextPage:
          products.length > args?.data?.perPage ||
          args?.data?.page * args?.data?.perPage < itemCount,
      },
    };
  },
});

type TFilterProductsByCategoryPriceInput = {
  page: number;
  perPage: number;
  slugs: Array<string>;
  min?: number;
  max?: number;
};

const FilterProductsByCategoryPriceInput = `
  input FilterProductsByCategoryPriceInput {
    page: Int!
    perPage: Int!
    slugs: [String!]!
    min: Float
    max: Float
  }
`;

export const filterProductsByCategoryPricePagination =
  schemaComposer.createResolver<
    any,
    {
      data: TFilterProductsByCategoryPriceInput;
    }
  >({
    name: 'filterProductsByCategoryPricePagination',
    type: ProductPaginationByCategoriesInfo,
    description: '...',
    kind: 'query',
    args: {
      data: FilterProductsByCategoryPriceInput,
    },
    async resolve({ args, context }) {
      const categories = await Category.find({
        slug: { $in: args?.data?.slugs },
      });
      const variantValues = await VariantValue.find({
        price: {
          $gte: args?.data?.min ?? 0,
          $lte: args?.data?.max ?? Number.MAX_SAFE_INTEGER - 1,
        },
      });
      const itemCount = await Product.countDocuments({
        active: true,
        isService: false,
        variantValues: {
          $in: variantValues?.map((vv) => vv._id) ?? [],
        },
        categories: {
          $in: categories?.map((c) => c._id) ?? [],
        },
      });
      const pageCount = Math.ceil(itemCount / args?.data?.perPage);
      if (args?.data?.page > pageCount) {
        throw new ApolloError(
          `La pagina ${args?.data?.page} no se encuentra disponible`
        );
      }
      const skip = Math.max(0, (args?.data?.page - 1) * args?.data?.perPage);
      const products = await Product.find(
        {
          active: true,
          isService: false,
          variantValues: {
            $in: variantValues?.map((vv) => vv._id),
          },
          categories: {
            $in: categories?.map((c) => c._id) ?? [],
          },
        },
        '',
        { skip, limit: args?.data?.perPage, sort: { createdAt: -1 } }
      );
      return {
        count: itemCount,
        items: products,
        pageInfo: {
          currentPage: args?.data?.page,
          perPage: args?.data?.perPage,
          pageCount,
          itemCount,
          hasPreviousPage: args?.data?.page > 1,
          hasNextPage:
            products.length > args?.data?.perPage ||
            args?.data?.page * args?.data?.perPage < itemCount,
        },
      };
    },
  });
