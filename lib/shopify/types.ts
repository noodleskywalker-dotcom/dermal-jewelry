/** The shapes the Storefront API answers with, narrowed to the fields `queries.ts` asks for. */

export type ShopifyMoney = { amount: string; currencyCode: string };

export type ShopifyImage = { url: string; altText: string | null; width: number | null; height: number | null };

export type ShopifySelectedOption = { name: string; value: string };

export type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  sku: string | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: ShopifySelectedOption[];
};

export type ShopifyMetafield = { namespace: string; key: string; value: string; type: string } | null;

export type ShopifyProduct = {
  id: string;
  handle: string;
  title: string;
  description: string | null;
  availableForSale: boolean;
  totalInventory: number | null;
  tags: string[];
  productType: string | null;
  vendor: string | null;
  priceRange: { minVariantPrice: ShopifyMoney; maxVariantPrice: ShopifyMoney };
  featuredImage: ShopifyImage | null;
  images: { nodes: ShopifyImage[] };
  variants: { nodes: ShopifyVariant[] };
  metafields: ShopifyMetafield[];
};

export type ShopifyProductsAnswer = { products: { nodes: ShopifyProduct[] } };
export type ShopifyProductAnswer = { product: ShopifyProduct | null };

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: { totalAmount: ShopifyMoney; amountPerQuantity: ShopifyMoney };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number | null;
    price: ShopifyMoney;
    selectedOptions: ShopifySelectedOption[];
    product: { id: string; handle: string; title: string };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: ShopifyMoney; totalAmount: ShopifyMoney; totalTaxAmount: ShopifyMoney | null };
  lines: { nodes: ShopifyCartLine[] };
};

export type ShopifyUserError = { field: string[] | null; message: string };

export type CartMutationAnswer<K extends string> = Record<K, { cart: ShopifyCart | null; userErrors: ShopifyUserError[] }>;
