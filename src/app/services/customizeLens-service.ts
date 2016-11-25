import {Injectable,OnInit} from "@angular/core";
import {CartService} from "./cart.service";
import {RxModel} from "../models";
import {CookiesService} from "../services";


import {Injectable} from "@angular/core";
import 'rxjs/add/operator/toPromise';

/**
 * @Injectable for cart.service
 */
@Injectable()

export class CustomizeLensService implements OnInit{

  haveCustomizeLenses: any = false;
  rx_product_ids: any = [];
  rx_id: any = 0;
  cartItems: any = null;
  private count: any = 0;
  rx_product: any = null;
  rx_product_price: any = 0;
  isRxSun: boolean = false;
  customizeLensesId: any = 0;
  rx_Object:any = null;
  isKioskMode:boolean = false;
  currentVariant:any = '';

  constructor(private _cookie: CookiesService, private _cartService:CartService){
    this.getRxObject();
  }

  /**
   * getRxObject() from models
   */
  getRxObject(){
    this.rx_Object = new RxModel();
    this.rx_Object = this.rx_Object.rxObject;
  }

  ngOnInit(){
  }

  /**
   * getCustomizeLense() serice
   * @returns {Promise<T>}
   */
  getCustomizeLense():  Promise<any>{
    this.getKiosks();

    return new Promise((resolve,reject)=>{
      this._cartService.getCartData().then(cartData=> {
          let isRxProducts: boolean = false;
          this.rx_product_ids = [];
            cartData.selectedItems.forEach((item: any)=> {
              if (item.item_type != "home_trial_kit") {
                if (this.isCustomizable(item.lens_type)) {
                  isRxProducts = true;
                  let firstChar: string = item.lens_type[0].toLowerCase();
                  item.rx = item.rx || {};
                  for (let i = 0; i < item.qty; i++) {
                    this.rx_id = item.product_id + '_' + i + firstChar;
                    if (!item.rx[this.rx_id] || (item.rx[this.rx_id] && !(item.rx[this.rx_id].rx_id))) {
                      item.rx[this.rx_id] = JSON.parse(JSON.stringify(this.rx_Object));
                      item.rx[this.rx_id]['is_sun'] = item.isSunwear;
                    }
                  }
                }
              }
            });

            this._cartService.setCartItems$(cartData.selectedItems);
            this._cartService.writeCartToLocalStorage(cartData);
            this.cartItems = cartData.selectedItems;
            this.getRxProduct(this.cartItems);
            this.getRxProductIds(this.cartItems);

          if (isRxProducts) {
            this.show_rx();
            this.customizeLensesId = this.rx_product_ids[this.count];
            resolve({id:this.customizeLensesId,isCustomize:true});
          } else {
            resolve({id:null,isCustomize:false});
          }
        },
        e=> {
        });

    });

  }

  /**
   * isCustomizable()
   * @param lens_type
   * @returns {boolean}
   */
  isCustomizable(lens_type) {
    let NON_CUSTOMIZABLE_LENS = {
      ONHAND_NO_LENS: true,
      ONHAND_NON_RX_SUN_LENS: true,
      NO_LENS: true,
      PLANO_LENS: true
    };

    if (!this.isKioskMode) {
      NON_CUSTOMIZABLE_LENS['NON_RX_SUN_LENS'] = true;
    }

    return ((!NON_CUSTOMIZABLE_LENS[lens_type]) || false);
  }


  /**
   * getRxProduct() used for getting the product
   * @param cartItems
   */
  private getRxProduct(cartItems) {
    let rx_objs: any = {};
    cartItems.forEach((item: any)=> {
      item.rx && Object.keys(item.rx).forEach((key)=> {
        rx_objs[key] = item;
      });
    });

    if (this.rx_id) {
      this.rx_product = rx_objs[this.rx_id];
      this.rx_product_price = this.rx_product.prices[this.rx_product.lens_type + '_PRICE'];

      this.isRxSun = false;

      if (this.rx_product) {
        this.isRxSun = this.rx_product.isSunwear === "1";
        this.rx_product.is_sun = this.isRxSun;
      }

      if (this.rx_product && this.rx_product.variant) {
        this.isRxSun = (this.rx_product.variant.toLowerCase().indexOf('sunwear') > -1 || this.rx_product.variant.toLowerCase().indexOf('sunglass') > -1);
        this.rx_product.is_sun = (this.rx_product.variant.toLowerCase().indexOf('sunwear') > -1 || this.rx_product.variant.toLowerCase().indexOf('sunglass') > -1);
        this.currentVariant = this.rx_product.variant;
      }
    }
  }

  /**
   * getRxProductIds() Providing the rx product Id's
   * @param cartItems
   */
  private getRxProductIds(cartItems) {
    cartItems.forEach((item: any)=> {
      this.rx_product_ids = (item && item.rx && this.rx_product_ids.concat(Object.keys(item.rx))) || this.rx_product_ids;
    });
  }

  /**
   * show_rx() Using for showing the rx
   */
  show_rx() {
    this.isRxSun = false;
    if (this.rx_id && this.rx_product && this.rx_product.rx[this.rx_id]) {
      let object_rx = this.rx_product.rx[this.rx_id];
      if (object_rx) {
        this.isRxSun = object_rx.is_sun === "1";
        this.rx_product.is_sun = this.isRxSun;
      }

      if (object_rx && object_rx.variant) {
        this.isRxSun = (object_rx.variant.toLowerCase().indexOf('sunwear') > -1 || object_rx.variant.toLowerCase().indexOf('sunglass') > -1);
        this.rx_product.is_sun = (this.rx_product.variant.toLowerCase().indexOf('sunwear') > -1 || this.rx_product.variant.toLowerCase().indexOf('sunglass') > -1);
      }
    }
  }

  /**
   * getKiosks() used for get kiosk mode data
   */
  getKiosks() {
    if (this._cookie.getCookie("kioskId")) {
      this.isKioskMode = true;
    }
  }


}

