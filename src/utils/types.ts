export type TBreakpointKeys = 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type TCartItem = {
  id: number
  name: string
  price: number
  quantity: number
}

// Deprecated types

// export interface IJewelleryItem {
//   prices: IPrice[]
//   id: number
//   title_en: string
//   name: string
//   slug: string
//   description_en: string
//   short_description_en: string
//   sku: string
//   image: IImage
// }

// export interface IPrice {
//   id: number
//   product_id: number
//   gold_value: string
//   diamond_value: string
//   platinum_value: string
//   stone_value: string
//   silver_value: string
//   gst_percent: string
//   gross_weight: string
//   gold_weight: string
//   diamond_weight: string
//   platinum_weight?: string
//   silver_weight?: string
//   diamond_shape: string
//   stone_color?: string
//   metal_color?: string
//   size: string
//   purity: string
//   gold_purity: string
//   silver_purity?: string
//   platinum_purity?: string
//   making_charge: string
//   making_charge_type: string
//   metal?: string
//   discount_on: string
//   discount_type: string
//   discount_amount: string
//   created_at?: string
//   updated_at?: string
//   deleted_at?: string
//   shipping_days: number
//   stock: number
//   available_in_store?: unknown
//   no_of_stone?: number
//   no_of_diamond?: number
//   total: string
//   discount_total: string
//   discount: IDiscount
//   cal_making_charge: string
//   cal_gst: string
//   item_length?: unknown
//   item_width?: unknown
// }

// export interface IDiscount {
//   price: number
//   on: string
//   type: string
//   value: string
//   text: string
//   amount: number
//   gst: number
// }

// export interface IImage {
//   small: string
//   medium: string
//   large: string
// }
// export interface ICart {
//   cart_id: number
//   dg_code: number | null
//   dg_discount: number | null
//   total: number
//   items: ICartItem[]
//   final_amount: number
// }

export interface IItemData {
  id: number
  size: string
  stock: number
  total: number
  purity: string
  discount: IDiscount
  gst_value: number
  created_at: string
  gold_value: number
  product_id: number
  updated_at: string
  block_stock: number
  gold2_value: number
  gold_purity: string
  gold_weight: number
  gst_percent: number
  stone_value?: unknown
  gold2_purity?: unknown
  gold2_weight?: unknown
  gross_weight: number
  silver_value: number
  stone_weight?: unknown
  diamond_shape: string
  diamond_value: number
  making_charge: number
  shipping_days: number
  silver_purity?: unknown
  silver_weight: number
  diamond_weight: number
  platinum_value: number
  platinum_purity?: unknown
  platinum_weight: number
  making_charge_type: string
  making_charge_value: number
}

export interface ICartItem {
  id: number
  type: string
  identifier: string
  name: string
  image: string
  price: number
  slug: string
  expiry_time: string
  data: IItemData
}

export interface ICart {
  items: ICartItem[]
  discounts: IDiscount[]
  sub_total: number
  total: number
}

export interface ICartItem {
  id: number
  cart_id: number
  identifier: string
  product_name: string
  product_image: string
  product_price: number
  product_discounted_price: number | null
  quantity: number
  sub_total: number
  is_solitaire: number
  is_gemstone: number
  is_addon: number
  slug: string
  created_at: string
  updated_at: string
  price: number
}

export interface IVariation {
  size: string[]
  purity: string[]
  diamond_shape: string[]
}

export interface IImage {
  product_id: number
  media: string
  position: number
}

export interface IDiscount {
  name: string
  gold_value: number
  gold_rate_discount: string
  making_charge?: number
  gst_value: number
  total: number
}

export interface IPrice {
  id: number
  product_id: number | null
  gold_weight: number | null
  gold_purity: string | null
  gold_value: number | null
  gold2_weight?: unknown
  gold2_purity?: unknown
  gold2_value: number | null
  diamond_weight: number | null
  diamond_value: number | null
  diamond_shape: string | null
  other_label: null 
  rates: Array<{
    name: string
    type: string
    price: number
  }>
  other_value: number | null
  platinum_weight: number | null
  platinum_purity?: number | null
  platinum_value: number | null
  silver_weight: number | null
  silver_purity?: number | null
  silver_value: number | null
  stone_weight?: unknown | null
  stone_value?: unknown | null
  gross_weight: number | null
  size: string | null
  purity: string | null
  shipping_days: number | null
  stock: number | null
  block_stock: number
  making_charge: number
  making_charge_type: string
  making_charge_value: number
  gst_percent: number
  gst_value: number
  total: number
  created_at: string
  updated_at: string
  gold_purity_display_name: string
  discount: IDiscount
}

export interface IJewelleryItem {
  id: number
  platform_uuids: string
  type: string
  sku: string
  title: string
  slug: string
  description: string
  related_skus?: string[] | null
  try_online: number
  pieces?: unknown
  priority?: unknown
  breakup_visibility: number
  occasions?: string
  category_ids: string
  meta_title?: unknown
  meta_description?: unknown
  meta_keywords?: unknown
  status: string
  trending: number
  featured: number
  recomemded: number
  best_seller: number
  created_at: string
  updated_at: string
  variation: IVariation
  images: IImage[]
  prices: IPrice[]
}
