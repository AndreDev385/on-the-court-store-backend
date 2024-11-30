import { schemaComposer } from 'graphql-compose';
import ApolloError from '../lib/NoSentryError';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Comment, CommentTC } from '../models/Comment';

type TCreateCommentInput = {
  userId: any;
  productId: any;
  text: string;
  rating: number;
};

const CreateCommentInput = `
  input CreateCommentInput {
    userId: MongoID!
    productId: MongoID!
    text: String!
    rating: Int!
  }
`;

// eslint-disable-next-line import/prefer-default-export
export const createComment = schemaComposer.createResolver<
  any,
  {
    data: TCreateCommentInput;
  }
>({
  name: 'createComment',
  type: CommentTC.getType(),
  description: 'Create a Comment for a product',
  kind: 'query',
  args: {
    data: CreateCommentInput,
  },
  async resolve({ args }) {
    const [product, user] = await Promise.all([
      Product.findOne({ _id: args?.data?.productId }),
      User.findOne({ _id: args?.data?.userId }),
    ]);
    if (!product) {
      throw new ApolloError(
        `El producto con id ${args?.data?.productId} no existe`
      );
    }
    if (!user) {
      throw new ApolloError(
        `El usuario con id ${args?.data?.productId} no existe`
      );
    }
    const comment = await Comment.create({
      text: args?.data?.text,
      rating: args?.data?.rating,
      client: user?._id,
      product: product?._id,
    });
    product.points = (product?.points ?? 0) + (args?.data?.rating ?? 0);
    product.reviews = (product?.reviews ?? 0) + 1;
    product.rating = (product?.points ?? 0) / (product?.reviews ?? 1);
    product.comments = [...(product?.comments ?? []), comment?._id];
    await product.save();
    return comment;
  },
});
