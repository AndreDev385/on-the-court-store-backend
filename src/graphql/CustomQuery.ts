import { me } from '../controllers/authController';
import {
  getBrandsByCategory,
  getProductByCategoryBrand,
  searchByBrand,
  searchByCategory,
  searchProduct,
  searchCategoriesByCategory,
  searchProductByCategories,
  getBrandsByCategories,
} from '../controllers/filterController';
import {
  getProduct,
  productPaginationByCategories,
  productByBrandsCategoriesPagination,
  searchProductByCategoriesPagination,
  searchProductPagination,
  filterProductsByPricePagination,
  filterProductsByCategoryPricePagination,
  homeProducts,
} from '../controllers/productController';
import { currentSetting } from '../controllers/settingController';

export default {
  me,
  searchByCategory,
  searchByBrand,
  searchProduct,
  searchCategoriesByCategory,
  searchProductByCategories,
  productByBrandsCategoriesPagination,
  searchProductByCategoriesPagination,
  filterProductsByPricePagination,
  filterProductsByCategoryPricePagination,
  searchProductPagination,
  currentSetting,
  getBrandsByCategory,
  getBrandsByCategories,
  getProductByCategoryBrand,
  getProduct,
  productPaginationByCategories,
  homeProducts,
};
