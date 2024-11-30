import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { BrandDocument } from '../models/Brand';
import { ShopCart, ShopCartTC, ShopCartDocument } from '../models/Shopcart';
import { Product, ProductDocument } from '../models/Product';
import { OrderProduct, OrderProductDocument } from '../models/OrderProduct';
import { VariantValue, VariantValueDocument } from '../models/VariantValue';

type TAddItemToCartInput = {
  shopCartId: string;
  variantValueId: string;
  productId: string;
  quantity: number;
};

const AddItemToCartInput = `
  input AddItemToCartInput {
    shopCartId: String!
    variantValueId: String!
    productId: String!
    quantity: Int!
  }
`;

type TRemoveItemFromCartInput = {
  shopCartId: string;
  orderProductId: string;
};

const RemoveItemFromCartInput = `
  input RemoveItemFromCartInput {
    shopCartId: String!
    orderProductId: String!
  }
`;

type TIncreaseItemOfCartInput = {
  shopCartId: string;
  orderProductId: string;
};

const IncreaseItemOfCartInput = `
  input IncreaseItemOfCartInput {
    shopCartId: String!
    orderProductId: String!
  }
`;

type TDecreaseItemOfCartInput = {
  shopCartId: string;
  orderProductId: string;
};

const DecreaseItemOfCartInput = `
  input DecreaseItemOfCartInput {
    shopCartId: String!
    orderProductId: String!
  }
`;

export const addItemToCart = schemaComposer.createResolver<
  any,
  {
    data: TAddItemToCartInput;
  }
>({
  name: 'addItemToCart',
  type: ShopCartTC.getType(),
  description: 'Add an Item To Shopping Cart',
  kind: 'mutation',
  args: {
    data: AddItemToCartInput,
  },
  resolve: async ({ args, context }) => {
    const { productId, shopCartId, variantValueId, quantity } = args.data;

    console.log(productId, shopCartId, variantValueId, quantity);

    if (quantity <= 0) {
      throw new ApolloError('The Quantity most be positive');
    }

    const [product, shopCart, variantValue, preOrderProduct] =
      (await Promise.all([
        Product.findOne({ _id: productId }),

        ShopCart.findOne({ _id: shopCartId })
          .populate('client')
          .populate('items'),

        VariantValue.findOne({ _id: variantValueId }),

        OrderProduct.findOne({
          product: productId,
          variantValue: variantValueId,
          shopCart: shopCartId,
        }),
      ])) as [
        ProductDocument,
        ShopCartDocument,
        VariantValueDocument,
        OrderProductDocument
      ];

    if (!product) {
      throw new ApolloError(`The Product with id: ${productId} doesn't exists`);
    }
    if (!shopCart) {
      throw new ApolloError(
        `The Shop Cart with id: ${shopCartId} doesn't exists`
      );
    }
    if (!variantValue) {
      throw new ApolloError(
        `The Variant with id ${variantValueId} doesn't exists`
      );
    }
    if (!product.active) {
      throw new ApolloError(
        `The product ${product.title} isn't available for sale`
      );
    }
    if (variantValue.disabled) {
      throw new ApolloError(
        `The variant ${Object.values(variantValue.value).concat(
          ' '
        )} isn't available for sale`
      );
    }
    if (
      quantity > variantValue.quantity ||
      variantValue.quantity - quantity < 0
    ) {
      throw new ApolloError(
        `The variant ${Object.values(variantValue.value).concat(
          ' '
        )} doesn't have inventory`
      );
    }

    let orderProduct = preOrderProduct;
    let newVariantValue = variantValue;

    newVariantValue = await VariantValue.findOneAndUpdate(
      { _id: variantValueId },
      { quantity: variantValue.quantity - quantity },
      { new: true, runValidators: true }
    );

    if (!orderProduct) {
      orderProduct = await OrderProduct.create({
        title: product.title,
        isService: product.isService,
        active: product.active,
        photo: product.photos[0],
        brand: (product?.brand as BrandDocument)?.name ?? '-',
        extraInfo: product.extraInfo,
        //! model?: string;
        product: product._id,
        variant1: newVariantValue.value.variant1,
        variant2: newVariantValue.value.variant2,
        variant3: newVariantValue.value.variant3,
        price: newVariantValue.price,
        quantity,
        sku: newVariantValue.sku,
        location: newVariantValue.location,
        variantValue: newVariantValue._id,
        shopCart: shopCart._id,
      });
      shopCart.items = [...(shopCart?.items ?? []), orderProduct._id];
      await shopCart.save();
    } else {
      orderProduct.quantity += quantity;
      await orderProduct.save();
    }
    return shopCart;
  },
});

export const removeItemFromCart = schemaComposer.createResolver<
  any,
  {
    data: TRemoveItemFromCartInput;
  }
>({
  name: 'removeItemFromCart',
  type: ShopCartTC.getType(),
  description: 'Remove an Item from the Shopping Cart',
  kind: 'mutation',
  args: {
    data: RemoveItemFromCartInput,
  },
  resolve: async ({ args, context }) => {
    const { orderProductId, shopCartId } = args.data;
    const [shopCart, orderProduct] = (await Promise.all([
      ShopCart.findById(shopCartId).populate('client').populate('items'),
      OrderProduct.findById(orderProductId),
    ])) as [ShopCartDocument, OrderProductDocument];
    const variantValue = await VariantValue.findOne({
      _id: orderProduct.variantValue as any,
    });
    if (!shopCart) {
      throw new ApolloError(
        `The Shop Cart with id: ${shopCartId} doesn't exists`
      );
    }
    if (!orderProduct) {
      throw new ApolloError(
        `The Order Product with id ${orderProductId} doesn't exists`
      );
    }
    if (!variantValue) {
      throw new ApolloError(
        `The variant with id ${orderProduct.variantValue} doesn't exist`
      );
    }
    variantValue.quantity += orderProduct.quantity;
    shopCart.items =
      shopCart?.items?.filter(
        (orderP: OrderProductDocument) =>
          String(orderP?._id) !== String(orderProduct._id)
      ) ?? [];
    await Promise.all([
      shopCart.save(),
      variantValue.save(),
      orderProduct.remove(),
    ]);
    return ShopCart.findById(shopCartId);
  },
});

export const increaseOneItemOfCart = schemaComposer.createResolver<
  any,
  {
    data: TIncreaseItemOfCartInput;
  }
>({
  name: 'increaseOneItemOfCart',
  type: ShopCartTC.getType(),
  description: 'Increase in one an Item of the Shopping Cart',
  kind: 'mutation',
  args: {
    data: IncreaseItemOfCartInput,
  },
  resolve: async ({ args, context }) => {
    const { orderProductId, shopCartId } = args.data;
    const [shopCart, orderProduct] = (await Promise.all([
      ShopCart.findById(shopCartId).populate('client'),
      OrderProduct.findById(orderProductId),
    ])) as [ShopCartDocument, OrderProductDocument];
    const variantValue = await VariantValue.findOne({
      _id: orderProduct.variantValue as any,
    });
    if (!shopCart) {
      throw new ApolloError(
        `The Shop Cart with id: ${shopCartId} doesn't exists`
      );
    }
    if (!orderProduct) {
      throw new ApolloError(
        `The Order Product with id ${orderProductId} doesn't exists`
      );
    }
    if (!variantValue) {
      throw new ApolloError(
        `The variant with id ${orderProduct.variantValue} doesn't exist`
      );
    }
    if (variantValue.quantity < 1) {
      throw new ApolloError(
        `The variant with id ${orderProduct.variantValue} doesn't have inventory`
      );
    }
    orderProduct.quantity += 1;
    variantValue.quantity -= 1;
    await orderProduct.save();
    await variantValue.save();
    return ShopCart.findById(shopCartId);
  },
});

export const decreaseOneItemOfCart = schemaComposer.createResolver<
  any,
  {
    data: TDecreaseItemOfCartInput;
  }
>({
  name: 'decreaseOneItemOfCart',
  type: ShopCartTC.getType(),
  description: 'Decrease in one an Item of the Shopping Cart',
  kind: 'mutation',
  args: {
    data: DecreaseItemOfCartInput,
  },
  resolve: async ({ args, context }) => {
    const { orderProductId, shopCartId } = args.data;
    const [shopCart, orderProduct] = (await Promise.all([
      ShopCart.findById(shopCartId).populate('client').populate('items'),
      OrderProduct.findById(orderProductId),
    ])) as [ShopCartDocument, OrderProductDocument];
    const variantValue = await VariantValue.findOne({
      _id: orderProduct.variantValue as any,
    });
    if (!shopCart) {
      throw new ApolloError(
        `The Shop Cart with id: ${shopCartId} doesn't exists`
      );
    }
    if (!orderProduct) {
      throw new ApolloError(
        `The Order Product with id ${orderProductId} doesn't exists`
      );
    }
    if (!variantValue) {
      throw new ApolloError(
        `The variant with id ${orderProduct.variantValue} doesn't exist`
      );
    }
    variantValue.quantity += 1;
    orderProduct.quantity -= 1;
    await orderProduct.save();
    await variantValue.save();
    return ShopCart.findById(shopCartId);
  },
});
