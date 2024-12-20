import {
  BillTC,
  BrandTC,
  CategoryTC,
  ClientTC,
  CreditTC,
  CreditNoteTC,
  SettingTC,
  CurrencyTC,
  DeliveryNoteTC,
  LocationTC,
  ModelTC,
  OrderTC,
  OrderProductTC,
  ProductTC,
  PromoCodeTC,
  ShippingTC,
  ShopCartTC,
  SupplierTC,
  UserTC,
  VariantTC,
  VariantValueTC,
} from '../models';

const Query = {
  // Bill
  billById: BillTC.mongooseResolvers.findById(),
  billsById: BillTC.mongooseResolvers.findByIds(),
  bill: BillTC.mongooseResolvers.findOne(),
  bills: BillTC.mongooseResolvers.findMany(),
  billCount: BillTC.mongooseResolvers.count(),
  billConnection: BillTC.mongooseResolvers.connection(),
  billPagination: BillTC.mongooseResolvers.pagination(),
  // Brand
  brandById: BrandTC.mongooseResolvers.findById(),
  brandsById: BrandTC.mongooseResolvers.findByIds(),
  brand: BrandTC.mongooseResolvers.findOne(),
  brands: BrandTC.mongooseResolvers.findMany(),
  brandCount: BrandTC.mongooseResolvers.count(),
  brandConnection: BrandTC.mongooseResolvers.connection(),
  brandPagination: BrandTC.mongooseResolvers.pagination(),
  // Category
  categoryById: CategoryTC.mongooseResolvers.findById(),
  categoriesById: CategoryTC.mongooseResolvers.findByIds(),
  category: CategoryTC.mongooseResolvers.findOne(),
  categories: CategoryTC.mongooseResolvers.findMany(),
  categoryCount: CategoryTC.mongooseResolvers.count(),
  categoryConnection: CategoryTC.mongooseResolvers.connection(),
  categoryPagination: CategoryTC.mongooseResolvers.pagination(),
  // Client
  clientById: ClientTC.mongooseResolvers.findById(),
  clientsById: ClientTC.mongooseResolvers.findByIds(),
  client: ClientTC.mongooseResolvers.findOne(),
  clients: ClientTC.mongooseResolvers.findMany(),
  clientCount: ClientTC.mongooseResolvers.count(),
  clientConnection: ClientTC.mongooseResolvers.connection(),
  clientPagination: ClientTC.mongooseResolvers.pagination(),
  // Credit
  creditById: CreditTC.mongooseResolvers.findById(),
  creditsById: CreditTC.mongooseResolvers.findByIds(),
  credit: CreditTC.mongooseResolvers.findOne(),
  credits: CreditTC.mongooseResolvers.findMany(),
  creditCount: CreditTC.mongooseResolvers.count(),
  creditConnection: CreditTC.mongooseResolvers.connection(),
  creditPagination: CreditTC.mongooseResolvers.pagination(),
  // CreditNote
  creditNoteById: CreditNoteTC.mongooseResolvers.findById(),
  creditNotesById: CreditNoteTC.mongooseResolvers.findByIds(),
  creditNote: CreditNoteTC.mongooseResolvers.findOne(),
  creditNotes: CreditNoteTC.mongooseResolvers.findMany(),
  creditNoteCount: CreditNoteTC.mongooseResolvers.count(),
  creditNoteConnection: CreditNoteTC.mongooseResolvers.connection(),
  creditNotePagination: CreditNoteTC.mongooseResolvers.pagination(),
  // Currency
  currencyById: CurrencyTC.mongooseResolvers.findById(),
  currenciesById: CurrencyTC.mongooseResolvers.findByIds(),
  currency: CurrencyTC.mongooseResolvers.findOne(),
  currencies: CurrencyTC.mongooseResolvers.findMany(),
  currencyCount: CurrencyTC.mongooseResolvers.count(),
  currencyConnection: CurrencyTC.mongooseResolvers.connection(),
  currencyPagination: CurrencyTC.mongooseResolvers.pagination(),
  // DeliveryNote
  deliveryNoteById: DeliveryNoteTC.mongooseResolvers.findById(),
  deliveryNotesById: DeliveryNoteTC.mongooseResolvers.findByIds(),
  deliveryNote: DeliveryNoteTC.mongooseResolvers.findOne(),
  deliveryNotes: DeliveryNoteTC.mongooseResolvers.findMany(),
  deliveryNoteCount: DeliveryNoteTC.mongooseResolvers.count(),
  deliveryNoteConnection: DeliveryNoteTC.mongooseResolvers.connection(),
  deliveryNotePagination: DeliveryNoteTC.mongooseResolvers.pagination(),
  // Location
  locationById: LocationTC.mongooseResolvers.findById(),
  locationsById: LocationTC.mongooseResolvers.findByIds(),
  location: LocationTC.mongooseResolvers.findOne(),
  locations: LocationTC.mongooseResolvers.findMany(),
  locationCount: LocationTC.mongooseResolvers.count(),
  locationConnection: LocationTC.mongooseResolvers.connection(),
  locationPagination: LocationTC.mongooseResolvers.pagination(),
  // Model
  modelById: ModelTC.mongooseResolvers.findById(),
  modelsById: ModelTC.mongooseResolvers.findByIds(),
  model: ModelTC.mongooseResolvers.findOne(),
  models: ModelTC.mongooseResolvers.findMany(),
  modelCount: ModelTC.mongooseResolvers.count(),
  modelConnection: ModelTC.mongooseResolvers.connection(),
  modelPagination: ModelTC.mongooseResolvers.pagination(),
  // Order
  orderById: OrderTC.mongooseResolvers.findById(),
  ordersById: OrderTC.mongooseResolvers.findByIds(),
  order: OrderTC.mongooseResolvers.findOne(),
  orders: OrderTC.mongooseResolvers.findMany(),
  orderCount: OrderTC.mongooseResolvers.count(),
  orderConnection: OrderTC.mongooseResolvers.connection(),
  orderPagination: OrderTC.mongooseResolvers.pagination(),
  // OrderProduct
  orderProductById: OrderProductTC.mongooseResolvers.findById(),
  orderProductsById: OrderProductTC.mongooseResolvers.findByIds(),
  orderProduct: OrderProductTC.mongooseResolvers.findOne(),
  orderProducts: OrderProductTC.mongooseResolvers.findMany(),
  orderProductCount: OrderProductTC.mongooseResolvers.count(),
  orderProductConnection: OrderProductTC.mongooseResolvers.connection(),
  orderProductPagination: OrderProductTC.mongooseResolvers.pagination(),
  // Products
  productById: ProductTC.mongooseResolvers.findById(),
  productsById: ProductTC.mongooseResolvers.findByIds(),
  product: ProductTC.mongooseResolvers.findOne(),
  products: ProductTC.mongooseResolvers.findMany(),
  productCount: ProductTC.mongooseResolvers.count(),
  productConnection: ProductTC.mongooseResolvers.connection(),
  productPagination: ProductTC.mongooseResolvers.pagination(),
  // PromoCode
  promoCodeById: PromoCodeTC.mongooseResolvers.findById(),
  promoCodesById: PromoCodeTC.mongooseResolvers.findByIds(),
  promoCode: PromoCodeTC.mongooseResolvers.findOne(),
  promoCodes: PromoCodeTC.mongooseResolvers.findMany(),
  promoCodeCount: PromoCodeTC.mongooseResolvers.count(),
  promoCodeConnection: PromoCodeTC.mongooseResolvers.connection(),
  promoCodePagination: PromoCodeTC.mongooseResolvers.pagination(),
  // Setting
  settingById: SettingTC.mongooseResolvers.findById(),
  settingsById: SettingTC.mongooseResolvers.findByIds(),
  setting: SettingTC.mongooseResolvers.findOne(),
  settings: SettingTC.mongooseResolvers.findMany(),
  settingCount: SettingTC.mongooseResolvers.count(),
  settingConnection: SettingTC.mongooseResolvers.connection(),
  settingPagination: SettingTC.mongooseResolvers.pagination(),
  // Shipping
  shippingById: ShippingTC.mongooseResolvers.findById(),
  shippingsById: ShippingTC.mongooseResolvers.findByIds(),
  shipping: ShippingTC.mongooseResolvers.findOne(),
  shippings: ShippingTC.mongooseResolvers.findMany(),
  shippingCount: ShippingTC.mongooseResolvers.count(),
  shippingConnection: ShippingTC.mongooseResolvers.connection(),
  shippingPagination: ShippingTC.mongooseResolvers.pagination(),
  // ShopCart
  shopCartById: ShopCartTC.mongooseResolvers.findById(),
  shopCartsById: ShopCartTC.mongooseResolvers.findByIds(),
  shopCart: ShopCartTC.mongooseResolvers.findOne(),
  shopCarts: ShopCartTC.mongooseResolvers.findMany(),
  shopCartCount: ShopCartTC.mongooseResolvers.count(),
  shopCartConnection: ShopCartTC.mongooseResolvers.connection(),
  shopCartPagination: ShopCartTC.mongooseResolvers.pagination(),
  // Supplier
  supplierById: SupplierTC.mongooseResolvers.findById(),
  suppliersById: SupplierTC.mongooseResolvers.findByIds(),
  supplier: SupplierTC.mongooseResolvers.findOne(),
  suppliers: SupplierTC.mongooseResolvers.findMany(),
  supplierCount: SupplierTC.mongooseResolvers.count(),
  supplierConnection: SupplierTC.mongooseResolvers.connection(),
  supplierPagination: SupplierTC.mongooseResolvers.pagination(),
  // User
  userById: UserTC.mongooseResolvers.findById(),
  usersById: UserTC.mongooseResolvers.findByIds(),
  user: UserTC.mongooseResolvers.findOne(),
  users: UserTC.mongooseResolvers.findMany(),
  userCount: UserTC.mongooseResolvers.count(),
  userConnection: UserTC.mongooseResolvers.connection(),
  userPagination: UserTC.mongooseResolvers.pagination(),
  // Variant
  variantById: VariantTC.mongooseResolvers.findById(),
  variantsById: VariantTC.mongooseResolvers.findByIds(),
  variant: VariantTC.mongooseResolvers.findOne(),
  variants: VariantTC.mongooseResolvers.findMany(),
  variantCount: VariantTC.mongooseResolvers.count(),
  variantConnection: VariantTC.mongooseResolvers.connection(),
  variantPagination: VariantTC.mongooseResolvers.pagination(),
  // VariantValue
  variantValueById: VariantValueTC.mongooseResolvers.findById(),
  variantValuesById: VariantValueTC.mongooseResolvers.findByIds(),
  variantValue: VariantValueTC.mongooseResolvers.findOne(),
  variantValues: VariantValueTC.mongooseResolvers.findMany(),
  variantValueCount: VariantValueTC.mongooseResolvers.count(),
  variantValueConnection: VariantValueTC.mongooseResolvers.connection(),
  variantValuePagination: VariantValueTC.mongooseResolvers.pagination(),
};

export default Query;
