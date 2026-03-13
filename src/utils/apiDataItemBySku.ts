import { IJewelleryItem } from '@client/utils/types'

export default function findApiDataItemBySku(
  sku: string,
  apiData: IJewelleryItem[] | null,
): IJewelleryItem {
  if (!apiData) {
    console.error("Didn't find the following SKU:", sku)
    return placeholderData
  } else {
    const data = apiData.find((item) => item.sku === sku)
    if (!data) {
      console.error("Didn't find the following SKU:", sku)
      return placeholderData
    } else return data
  }
}

const placeholderData: IJewelleryItem = {
  id: 1463,
  platform_uuids:
    '0800be6a-4db0-41e7-80b4-d8614f7e42c5,406ec7dc-1fd3-4a5a-b996-82d1371d135f',
  type: 'diamond',
  sku: 'DT-D000628377',
  title: 'Magical Floral Trio Diamond Drop Earrings',
  slug: 'magical-floral-trio-diamond-drop-earrings',
  description:
    'The skills of our karigars are best reflected through these magical diamond drop earrings designed with three floral motifs, each having a unique pattern and finish. The motifs also have different dimensions in an ascending order with 0.24 carat diamonds encrusted in 14K gold. Please note - The dimension of the actual product might vary.',
  try_online: 1,
  pieces: null,
  priority: 839,
  breakup_visibility: 1,
  category_ids: '1,427,445,443,10,39,141,131,259,65,113,90',
  meta_title: null,
  meta_description: null,
  meta_keywords: null,
  status: 'enabled',
  trending: 0,
  featured: 0,
  recomemded: 0,
  best_seller: 0,
  created_at: '2022-09-23 22:06:57',
  updated_at: '2023-10-29 23:03:37',
  variation: {
    size: [],
    purity: ['14K Yellow Gold'],
    diamond_shape: ['HI-SI'],
  },
  images: [
    {
      product_id: 1463,
      media:
        'https://sencowebfiles.s3.ap-south-1.amazonaws.com/product-images/rinu7u471226436c.jpg',
      position: 1,
    },
    {
      product_id: 1463,
      media:
        'https://sencowebfiles.s3.ap-south-1.amazonaws.com/product-images/rinu7u4324f2612c.jpg',
      position: 2,
    },
    {
      product_id: 1463,
      media:
        'https://sencowebfiles.s3.ap-south-1.amazonaws.com/product-images/rinu7u00b1981490.jpg',
      position: 3,
    },
    {
      product_id: 1463,
      media:
        'https://sencowebfiles.s3.ap-south-1.amazonaws.com/product-images/rinu7u7fb301ba4d.jpg',
      position: 4,
    },
    {
      product_id: 1463,
      media:
        'https://sencowebfiles.s3.ap-south-1.amazonaws.com/product-images/rinu7u989b8cb80f.jpg',
      position: 5,
    },
  ],
  prices: [
    {
      id: 53101,
      product_id: 1463,
      gold_weight: 2.6,
      gold_purity: '58.50',
      gold_value: 9571,
      gold2_weight: null,
      gold2_purity: null,
      gold2_value: 0,
      diamond_weight: 0.24,
      diamond_value: 18360,
      diamond_shape: 'HI-SI',
      platinum_weight: 0,
      platinum_value: 0,
      silver_weight: 0,
      silver_value: 0,
      stone_weight: null,
      stone_value: null,
      gross_weight: 2.648,
      size: '',
      purity: '14K Yellow Gold',
      shipping_days: 30,
      stock: 0,
      block_stock: 0,
      making_charge: 3250,
      making_charge_type: 'flat',
      making_charge_value: 3250,
      gst_percent: 3,
      gst_value: 936,
      total: 32117,
      created_at: '2023-10-26 22:37:07',
      updated_at: '2023-10-31 16:21:52',
      gold_purity_display_name: '14K Gold',
      discount: {
        name: '100% off on Making Charge',
        making_charge: 0,
        gst_value: 838,
        total: 28769,
        gold_value: 9571,
        gold_rate_discount: "as",
      },
      other_label: null,
      other_value: null,
      rates: [
        {
        name: "",
        type: "",
        price: 0
      }]

    },
  ],
}
