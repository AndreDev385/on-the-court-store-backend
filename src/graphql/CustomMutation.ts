import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  changePassword,
} from '../controllers/authController';
import { createBill } from '../controllers/billController';
import { createComment } from '../controllers/commentController';
import { createOrder, updateOrder } from '../controllers/orderController';
import {
  createProduct,
  updateProduct,
  uploadManyProducts,
} from '../controllers/productController';
import { createSetting, updateSetting } from '../controllers/settingController';
import {
  addItemToCart,
  decreaseOneItemOfCart,
  increaseOneItemOfCart,
  removeItemFromCart,
} from '../controllers/shoppingCartController';

export default {
  signIn,
  signUp,
  signOut,
  createProduct,
  updateProduct,
  uploadManyProducts,
  addItemToCart,
  removeItemFromCart,
  increaseOneItemOfCart,
  decreaseOneItemOfCart,
  createOrder,
  updateOrder,
  createBill,
  createSetting,
  updateSetting,
  createComment,
  resetPassword,
  changePassword,
};
