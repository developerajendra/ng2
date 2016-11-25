/**
 * Exporting constant for tenant
 */


export const TenantConstant = {
  DITTO_API_URL: 'https://d-dev.classicspecs.api.ditto.com/api/',
  DITTO_API_VERSION: '1.0',
  API_KEY: 'classicspecs_dev', //'stevenalanoptical_dev','classicspecs_dev',
  DOMAIN_DESC: 'Ottavo Readers - Italian Readers and Reading Glasses Online',
  DOMAIN_URL: 'www.aliceandoliviaoptical.com',
  DOMAIN_SUFFIX: "Reading Glasses by Ottavo",
  DOMAIN_NAME: 'Alice and Olivia',
  NAV_TABS: [
    {
      name: 'must-haves',
      url: '/collection/must-haves',
      text: 'Must-Haves'
    },
    {
      name: 'new-arrivals',
      url: '/new-arrivals',
      text: 'New Arrivals'
    },
    {
      name: 'eyeglasses',
      url: '/collection/womens-eyeglasses',
      text: 'Eyeglasses'
    },
    {
      name: 'sunglasses',
      url: '/collection/womens-sunglasses',
      text: 'Sunglasses'
    },
    {
      name: 'virtual-try-on',
      url: '/virtual-try-on',
      text: 'Virtual Try-on'
    },
    {
      name: 'shop-a-o',
      url: 'https://www.aliceandolivia.com',
      text: 'Shop A+O',
      target: '_blank'
    },
    {
      name: 'sale',
      url: '/collection/sale',
      text: 'Sale'
    }
  ],
  priceDescription: {
    HIGH_INDEX_LENS: 'Including lenses',
    NON_RX_SUN_LENS: 'On Hand Inventory',
    ONHAND_NON_RX_SUN_LENS: 'On Hand Inventory',
    NO_LENS: 'Frames only',
    ORIGINAL_RX: '',
    ORIGINAL_SUN: '',
    PLANO_LENS: 'Including lenses',
    PRG_HIGH_INDEX_LENS: 'Including Progressive lenses',
    PRG_RX_SUN_LENS: 'Including Progressive lenses',
    PRG_STANDARD_LENS: 'Including Progressive lenses',
    READING_LENS: 'Including lenses',
    RX_SUN_LENS: 'Including lenses',
    STANDARD_INDEX_LENS: 'Including lenses'
  },
  prices: {
    HIGH_INDEX_LENS_PRICE: 'High-Index Lens',
    NON_RX_SUN_LENS_PRICE: 'Non-Rx-Sun Lens',
    NO_LENS_PRICE: 'No-Lens',
    ORIGINAL_RX_PRICE: 'Original-Rx Lens',
    ORIGINAL_SUN_PRICE: 'Original-Sun Lens',
    PLANO_LENS_PRICE: 'Plano Lens',
    PRG_HIGH_INDEX_LENS_PRICE: 'Prg-High-Index Lens',
    PRG_RX_SUN_LENS_PRICE: 'Prg-Rx-Sun Lens',
    PRG_STANDARD_LENS_PRICE: 'Prg-Standard Lens',
    READING_LENS_PRICE: 'Reading Lens',
    RX_SUN_LENS_PRICE: 'Rx-Sun Lens',
    STANDARD_INDEX_LENS_PRICE: 'Standard-Index Lens'
  },
  FILTERS: [
    {name: "color", value: [], text: "color", selected: []},
    {name: "faceshape", value: [], text: "faceshape", selected: []},
    {name: "facewidth", value: [], text: "facewidth", selected: []},
    {name: "lens", value: [], text: "lenstype", selected: []}
  ],
  COLLECTIONS: [
    {
      name: "Men's Sunglasses",
      slug: "mens-sunglasses",
      ext: 'ms'
    },
    {
      name: "Women's Eyeglasses",
      slug: "womens-eyeglasses",
      ext: 'wg'
    },
    {
      name: "Women's Sunglasses",
      slug: "womens-sunglasses",
      ext: 'ws'
    },
    {
      name: "Men's Eyeglasses",
      slug: "mens-eyeglasses",
      ext: 'mg'
    }
  ],
  DEFAULT_COLLECTION_NAME: 'readers',
  LENS_TYPE: {
    HIGH_INDEX_LENS: 'HIGH_INDEX_LENS',
    NON_RX_SUN_LENS: 'NON_RX_SUN_LENS',
    NO_LENS: 'NO_LENS',
    ORIGINAL_RX: 'ORIGINAL_RX',
    ORIGINAL_SUN: 'ORIGINAL_SUN',
    PLANO_LENS: 'PLANO_LENS',
    PRG_HIGH_INDEX_LENS: 'PRG_HIGH_INDEX_LENS',
    PRG_RX_SUN_LENS: 'PRG_RX_SUN_LENS',
    PRG_STANDARD_LENS: 'PRG_STANDARD_LENS',
    READING_LENS: 'READING_LENS',
    RX_SUN_LENS: 'RX_SUN_LENS',
    STANDARD_INDEX_LENS: 'STANDARD_INDEX_LENS',
    ONHAND_NO_LENS: 'ONHAND_NO_LENS',
    ONHAND_NON_RX_SUN_LENS: 'ONHAND_NON_RX_SUN_LENS'
  },
  MONTH: [
    {name: 'Jan', value: '01'},
    {name: 'Feb', value: '02'},
    {name: 'Mar', value: '03'},
    {name: 'Apr', value: '04'},
    {name: 'May', value: '05'},
    {name: 'Jun', value: '06'},
    {name: 'Jul', value: '07'},
    {name: 'Aug', value: '08'},
    {name: 'Sep', value: '09'},
    {name: 'Oct', value: '10'},
    {name: 'Nov', value: '11'},
    {name: 'Dec', value: '12'}
  ],
  YEAR: ['2016', '2017', '2018', '2019', '2020', '2021', '2022'],
  MODAL: {
    PRODUCT_MODAL: 'productDetailModalId',
    LIMIT_MODAL: 'limitModal'
  },
  RX_TYPE_NOT_EDIT: ['RX_SEND_LATER', 'RX_READING'],
  SPECIAL_PRODUCT: [
    {
      collection_name: 'womens-eyeglasses',
      redirect_url: 'https://www.aliceandolivia.com/'
    },
    {
      collection_name: 'womens-eyewear',
      redirect_url: 'http://www.anooptical.com/3342wg'
    },
    {
      collection_name: 'mens-sunwear',
      redirect_url: 'http://www.anooptical.com/3342ms'
    }
  ],
  ON_LOAD_CACHING: ['womens-sunglasses', 'womens-eyeglasses','mens-sunglasses', 'mens-eyeglasses'],
  IMAGE_EXT_TO_VIEW: ['jpeg', 'jpg', 'gif', 'tif', 'bmp', 'png']
};
