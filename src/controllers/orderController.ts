import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { Order, OrderTC } from '../models/Order';
import { OrderProduct, OrderProductDocument } from '../models/OrderProduct';
import { DeliveryNote } from '../models/DeliveryNote';
import { ShopCart } from '../models/Shopcart';
import { User } from '../models/User';
import { Client } from '../models/Client';
import { PromoCode } from '../models/PromoCode';
import { Shipping, ShippingDocument } from '../models/Shipping';
import { VariantValueDocument } from '../models/VariantValue';
import formatMoney from '../lib/formatMoney';

type TCreateChargeInput = {
  ref: string;
  method: string;
  bank?: string;
  capture?: string;
  amount: number;
  createdAt?: Date;
};

type TCreateOrderInput = {
  shopCartId: string;
  userId: string;
  shipping: string;
  address?: string;
  sellerId?: string;
  phone?: string;
  promoCode?: string;
  rate?: number;
  charges: Array<TCreateChargeInput>;
};

const CreateOrderInput = `
  input CreateOrderInput {
    shopCartId: String!
    userId: String!
    sellerId: String
    phone: String
    promoCode: String
    shipping: String!
    address: String
    rate: Float
    charges: [CreateChargeInput!]!
  }
  input CreateChargeInput {
    ref: String!
    method: String!
    bank: String
    capture: String
    amount: Float!
  }
`;

type TUpdateOrderInput = {
  orderId: string;
  status: number;
  createBill: boolean;
  paid?: boolean;
};

const UpdateOrderInput = `
  input UpdateOrderInput {
    orderId: String!
    status: Int!
    paid: Boolean
    createBill: Boolean!
  }
`;

function generateControlNumber(controlNumbers: string[]) {
  let _controlNumbers = controlNumbers.map(Number);
  _controlNumbers = _controlNumbers.sort((a, b) => b - a);
  let controlNumber = String(_controlNumbers[0] + 1);
  if (controlNumbers.length === 0) {
    controlNumber = '1';
  }
  let controlNumArray = Array<string>(9).fill('0');
  for (
    let i = 0, j = controlNumber.length - 1;
    i < controlNumArray.length;
    i += 1
  ) {
    controlNumArray[j] = controlNumber.charAt(i);
    j -= 1;
  }
  controlNumArray = controlNumArray.reverse();
  return controlNumArray.join('');
}

export const createOrder = schemaComposer.createResolver<
  any,
  {
    data: TCreateOrderInput;
  }
>({
  name: 'createOrder',
  type: OrderTC.getType(),
  description: '',
  kind: 'mutation',
  args: {
    data: CreateOrderInput,
  },
  resolve: async ({ args }) => {
    const { shopCartId, userId, sellerId } = args.data;
    const [shopCart, user, seller, promoCode, shipping] = await Promise.all([
      ShopCart.findOne({ _id: shopCartId })
        .populate('items')
        .populate({
          path: 'items',
          populate: {
            path: 'product',
          },
        })
        .populate({
          path: 'items',
          populate: {
            path: 'variantValue',
          },
        }),
      User.findOne({ _id: userId, active: true }),
      User.findOne({ _id: sellerId, active: true }),
      PromoCode.findOne({
        code: args.data.promoCode,
        active: true,
      }),
      Shipping.findOne({ _id: args?.data?.shipping, active: true }),
    ]);
    const client = await Client.findById(user.client);
    if (!shopCart) {
      throw new ApolloError(
        `The Shopping Cart with id: ${shopCartId} doesn't exists`
      );
    }
    if (!user) {
      throw new ApolloError(`The User with id: ${userId} doesn't exists`);
    }
    if (!client) {
      throw new ApolloError(
        `The Client with id: ${user.client} doesn't exists`
      );
    }
    if (!shipping) {
      throw new ApolloError(
        `The shipping option with id ${args?.data?.shipping} doesn't exists`
      );
    }
    if (args.data.promoCode && !promoCode) {
      throw new ApolloError(
        `The Promo with code: ${args.data.promoCode} doesn't exists`
      );
    }
    if (promoCode && promoCode.expirationDate <= new Date()) {
      throw new ApolloError(
        `The Promo with code: ${args.data.promoCode} doesn't exists`
      );
    }
    const toDelete: Array<any> = [];
    const items: Array<OrderProductDocument> = (
      shopCart.items as Array<OrderProductDocument>
    ).filter((product: OrderProductDocument) => {
      if (!product.active) {
        toDelete.push(product._id);
        return false;
      }
      if ((product.variantValue as VariantValueDocument).disabled) {
        toDelete.push(product._id);
        return false;
      }
      if (
        (product.variantValue as VariantValueDocument).quantity <
        product.quantity
      ) {
        toDelete.push(product._id);
        return false;
      }
      return true;
    });
    const subtotal = items.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    let discount = 0;
    if (promoCode?.fixed) {
      discount = promoCode.discount;
    }
    if (promoCode?.percentage) {
      discount = subtotal * (promoCode.discount / 100);
    }
    if (discount < 0) {
      discount = subtotal;
    }
    const extraFees = shipping?.price ?? 0;
    const tax = (subtotal + extraFees - discount) * 0.0; // TODO: Calculate Tax
    const total = subtotal + extraFees - discount + tax;
    const commission =
      (subtotal + extraFees - discount) * (seller?.commission ?? 0.0);
    const order = await Order.create({
      status: 0, // initial status
      paid: false,
      subtotal,
      tax,
      extraFees,
      discount,
      total,
      commission,
      products: items.map((product) => product._id),
      client: user._id,
      seller: seller?._id ?? null,
      shipping: shipping?._id,
      charges: args.data.charges,
      phone: args.data.phone,
      address: args?.data?.address,
      rate: args?.data?.rate,
    });
    shopCart.client = client._id;
    client.orders = [...(client.orders || []), order._id];
    const newShopCart = await ShopCart.create({
      client: client._id,
      items: [],
    });
    client.shopCart = newShopCart._id;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await Promise.all([
      ...items.map((product) =>
        OrderProduct.findOneAndUpdate(
          { _id: product._id },
          { order: order._id },
          { new: true, runValidators: true }
        ).exec()
      ),
      ...toDelete.map((_id) => OrderProduct.remove({ _id }).exec()),
      shopCart.save(),
      client.save(),
    ]);
    return order;
    // return null;
  },
});

export const updateOrder = schemaComposer.createResolver<
  any,
  {
    data: TUpdateOrderInput;
  }
>({
  name: 'updateOrder',
  type: OrderTC.getType(),
  description: 'Change the status of an order and generate a bill',
  kind: 'mutation',
  args: {
    data: UpdateOrderInput,
  },
  resolve: async ({ args, context }) => {
    const { createBill: _createBill, orderId, paid, status } = args.data;
    const order = await Order.findById(orderId)
      .populate('products')
      .populate('client')
      .populate('shipping');
    if (!order) {
      throw new ApolloError(`The order with id: ${orderId} doesn't exists`);
    }
    if (_createBill) {
      const deliveryNotes = await DeliveryNote.find({}, 'controlNumber');
      const controlNumber = generateControlNumber(
        deliveryNotes.map((_deliveryNote) => _deliveryNote.controlNumber)
      );
      console.log(controlNumber);

      const deliveryNote = await DeliveryNote.create({
        charges: order.charges,
        controlNumber,
        order: order._id,
        paid,
        generateBill: false,
        paymentMetadata: {},
      });
      const details = order?.products?.map((product: OrderProductDocument) => ({
        description: product?.title,
        amount: formatMoney(product?.quantity * product?.price),
      }));
      details.push({
        description: (order?.shipping as ShippingDocument)?.name,
        amount: formatMoney(order?.extraFees),
      });
    }
    return Order.findOneAndUpdate(
      { _id: orderId },
      {
        status,
        paid,
      },
      { new: true, runValidators: true }
    );
  },
});
