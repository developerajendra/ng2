/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy, ElementRef} from "@angular/core";
import {Router} from "@angular/router";
import {CartService, CookiesService} from "../../services";
import {BreadCrumbComponent} from "../breadcrumb-component";
import {AppConstants} from "../../constants/app-constants";
import {StorageService} from "../../services/storage.service";
import {UserService} from "../../services/user.service";

declare var window:any;
declare var jQuery:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for checkout-thankyou-component
 */

@Component({
  selector: 'checkout-thankyou',
  templateUrl: 'checkout-thankyou-component.html',
  styleUrls: ['checkout-thankyou-component.scss'],
  directives: [BreadCrumbComponent]
})

/**
 * Exporting class (CheckoutThankyouComponent) from checkout-Thankyou-component
 */

export class CheckoutThankyouComponent implements OnInit, OnDestroy {

  subs:any = [];
  totalProductCount:number;
  cart:any;
  productList:any;
  haveItems:number = 0;
  haveHtkItems:number = 0;
  order:any = {};
  displayCustomizedProducts:any = [];
  displayNonCustomizedProducts:any = [];
  totalCustomize:any = 0;
  totalNonCustomize:any = 0;
  cartItems:any = null;
  haveCustomizeLenses:any = false;
  isKioskMode:boolean = false;
  userInfo:any = null;

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _cartService:CartService, private _storageService:StorageService, private _cookie:CookiesService, private _router:Router,
              private _userService:UserService, private elemRef:ElementRef) {

    this._storageService.removeItem(AppConstants.THANK_YOU_CART);
    this._cookie.delete_cookie(AppConstants.USER_COOKIE);

    let cartStorage;

    if (this._cartService.getCartDataFromLocalStorage()) {
      // console.log("  if  ");
      cartStorage = this._cartService.getCartDataFromLocalStorage();
      this._cartService.removeCache();
      this._storageService.setItem(AppConstants.THANK_YOU_CART, (typeof cartStorage === "string") ? cartStorage : JSON.stringify(cartStorage));
    } else {
      // console.log("  else  ");
      cartStorage = this._storageService.getItem(AppConstants.THANK_YOU_CART, null);
    }

    if (cartStorage && cartStorage.selectedItems) {
      this.haveHtkItems = this._cartService.getIsHaveHtkItems(cartStorage.selectedItems);
    }
    this.getKiosks();
    this.getHaveHtkItems();
    this.getHaveItems();
    this.totalProductCount = cartStorage.totalProductCount;
    this.cart = cartStorage.cart;
    this.productList = cartStorage.selectedItems;
    this.getCartItems();
    this.getUserInfo();
  }

  getUserInfo() {
    this._userService.getUserInfo()
      .then((userInfo:any) => {
        this.userInfo = {};
        this.userInfo = userInfo;
      }, e=> {
      });
  }


  checkIsCustomizable(lens_type) {
    let NON_CUSTOMIZABLE_LENS = {
      ONHAND_NO_LENS: true,
      ONHAND_NON_RX_SUN_LENS: true,
      NO_LENS: true,
      PLANO_LENS: true
    };

    if (!this.isKioskMode)
      NON_CUSTOMIZABLE_LENS['NON_RX_SUN_LENS'] = true;


    return ((!NON_CUSTOMIZABLE_LENS[lens_type]) || false);
  }


  /**
   * ngOnInit function
   */

  ngOnInit() {
    jQuery(this.elemRef.nativeElement).on('hidden.bs.modal', ()=> {
      this._router.navigateByUrl('/');
    });
    this.order = this._cartService.getFinalCheckoutCart();
    changeStatus();
  }

  /**
   * getHaveItems$ function
   * @returns {any}
   */

  getHaveItems() {
    let sub:any = this._cartService.haveItems$.subscribe(have=> this.haveItems = have, e=> {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getHaveHtkItems$ function
   * @returns {any}
   */

  getHaveHtkItems() {
    let sub:any = this._cartService.haveHtkItems$.subscribe(have=> this.haveHtkItems = have, e=> {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getCartItems function
   * @returns {any}
   */

  getCartItems() {
    this.cartItems = this._storageService.getItem(AppConstants.THANK_YOU_CART, null).selectedItems;

    this.cartItems.map((item) => {
      if (this.checkIsCustomizable(item.lens_type)) {
        this.haveCustomizeLenses = true;
      }
    });

    this.displayCustomizedProducts = [];
    this.displayNonCustomizedProducts = [];

    this.totalCustomize = 0;
    this.totalNonCustomize = 0;

    this.cartItems.forEach((elem)=> {
      if (elem && elem.rx && elem.item_type != 'home_trial_kit') {
        Object.keys(elem.rx).forEach((item)=> {
          this.totalCustomize += elem.rx[item].price;
          elem.rx[item]['productDetailsRoute'] = elem.productDetailsRoute;
          this.displayCustomizedProducts.push(elem.rx[item]);
        });
      }
      if (elem && !elem.rx && elem.item_type != 'home_trial_kit') {
        for (let cursor = 0; cursor < elem.qty; cursor++) {
          this.totalNonCustomize += elem.prices[elem.lens_type + '_PRICE'];
          this.displayNonCustomizedProducts.push(elem);
        }
      }
    });
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this._cartService.removeCache();
    this.subs.forEach((sub:any)=> sub.unsubscribe());
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

