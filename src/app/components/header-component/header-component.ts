/**
 * Importing core components
 */


import {Component, OnInit, ElementRef, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Importing app level constants
 */

import {AppConstants} from '../../constants/app-constants';
import {TenantConstant} from '../../constants/tenant';

/**
 * Importing custom services
 */

import {CartService, UserService, CookiesService, NotifyService, StaticDataService} from '../../services';

/**
 * Global level variable "jQuery"
 */

declare var jQuery:any;

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for header-component
 */

@Component({
  selector: 'header',
  templateUrl: 'header-component.html',
  styleUrls: ['header-component.scss']
})

/**
 * Exporting class (HeaderComponent) from header-component
 */

export class HeaderComponent implements OnInit, OnDestroy {

  subs:any = [];
  cartItemsCount:any = 0;
  navTabs:any = TenantConstant.NAV_TABS;
  tabName:string = '';
  bag:any = [];
  tabChange:any = null;
  userInfo:any = null;
  isLoggedIn:any = null;
  isCheckoutPage:boolean = false;
  contacts:any = {};
  isKioskMode:boolean = false;
  kioskName:string = "";

  private currentUrl:string = '';

  /**
   * constructor() used to initialize class level variables
   * @param _cartService
   * @param _userService
   * @param _router
   * @param _cookie
   * @param elementRef
   */

  constructor(private _contact:StaticDataService, private _notifyService:NotifyService, private _cartService:CartService, private _userService:UserService, private _router:Router, private _cookie:CookiesService, private elementRef:ElementRef) {
    this.getCartItemsCount();
    this.currentUrl = this._userService.getCurrentUrl();
    let sub1:any = this._userService.userInfo$.subscribe(userInfo=>this.userInfo = userInfo, error=> {
      this._router.navigateByUrl('/');
    });
    let sub2:any = this._userService.isLoggedIn$.subscribe(isLoggedIn=>this.isLoggedIn = isLoggedIn, error=> {/*console.log('Error: ', error)*/
    });
    this.subs.push(sub1);
    this.subs.push(sub2);
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.checkoutPageActive();
    this.getcontacts();
    this.getKiosks();
    this.tabName = this.getTabName();
  }

  /**
   * getCartItemsCount() used to return item's count in cart/bag
   * @returns {number}
   */

  getCartItemsCount() {
    let sub:any = this._cartService.cartItemsCount$.subscribe(cartItemsCount=>this.cartItemsCount = cartItemsCount, e=> {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }


  /**
   * isActive() used to tell about tab active status
   * @param tabName
   * @returns {boolean}
   */

  isActive(tabName) {
    jQuery("#bagModal").hide();
    this.setCurrentUrl();
    this.tabChange = false;
    return this.tabName === tabName;
  }

  /**
   * setCurrentUrl() used to set Current Url
   * @param tabName
   * @returns {boolean}
   */

  setCurrentUrl() {
    let url = window.location.pathname;
    if (url != "/auth/login" && url != '/register-user' && url != '/forgot-password' && !url.match(/resetpassword/gi)) {
      this.currentUrl = url;
      this._userService.setCurrentUrl(this.currentUrl);
    }
  }

  /**
   * changeTabName() used to change the name of tabName
   * @param tabName
   */

  changeTabName(tabName) {
    this.tabName = tabName || '';
    this.tabChange = null;
  }

  /**
   * getTabName() used to get the tabName
   * @returns {any}
   */

  private getTabName() {
    let tabName = '';
    if (this.navTabs && this.navTabs.length) {
      this.navTabs.forEach((tab)=> {
        if (window.location.pathname.indexOf(tab.name) > -1) {
          tabName = tab.name;
        }
      });
    }
    return tabName;
  }

  /**
   * logout() used to logout from the system
   * @returns {void}
   */

  logout() {
    this._userService.logout().then(data => {
      this._cookie.delete_cookie(AppConstants.COOKIE_NAME);
      this._cookie.delete_cookie(AppConstants.USER_COOKIE);
      this._cookie.setCookie(AppConstants.CHECKOUT_TYPE, "guest", null);
      this._userService.setIsLoggedIn$(false);
    }, error => {
      this._cookie.delete_cookie(AppConstants.USER_COOKIE);
      this._cookie.delete_cookie(AppConstants.COOKIE_NAME);
      this._userService.setIsLoggedIn$(false);
    });
    this._cartService.getCartData().then(cartData=> {
      if (cartData && cartData.cart && Object.keys(cartData).length) {
        cartData.cart.customer_email = null;
        delete cartData.cart.customer;
        this._cartService.updateCart(cartData.cart.cart_id, cartData.cart).then(data => {
          this._cartService.writeCartToLocalStorage(cartData);
        }, error => {
          if (error.code === "E_CART_UNAVAILABLE") {
            this._cartService.removeCache();
          }
        });
      }
    }, e => {
    });
    this._router.navigateByUrl('/');
  }

  /**
   * subscribe() used to display the subscribe modal
   */

  subscribe() {
    jQuery(this.elementRef.nativeElement).parent().find('#subscribeModal').first().modal();
  }

  /**
   * checkoutPageActive() used to hide navigation on checkout
   */
  checkoutPageActive() {
    let sub:any = this._notifyService.hideElement$.subscribe(data => this.isCheckoutPage = data, error => {/*console.log(error)*/
    });
    this.subs.push(sub);
  }

  /**
   * getcontacts() used for get contacts
   */
  getcontacts() {
    this._contact.getContact()
      .then((data)=> {
        this.contacts = data;
      }, e => {
      });
  }

  /**
   * getKiosks() used for get kiosk mode data
   */
  getKiosks() {
    var cookie = this._cookie.getCookie("kioskId");
    this.kioskName = cookie || '';
    this.isKioskMode = !!this.kioskName;

    let sub:any = this._notifyService.getKioskMode$().subscribe(kioskName=> {
      this.kioskName = kioskName;
      this.isKioskMode = !!kioskName;
    }, e=> {
      this.kioskName = "";
      this.isKioskMode = false;
    });
    this.subs.push(sub);
  }

  /**
   * exitKioskMode() exit kiosk mode
   */
  exitKioskMode() {
    this._cookie.setCookie("kioskId", "", 1);
    this._notifyService.setKioskMode$('');
    this.kioskName = "";
    this.isKioskMode = false;
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub:any)=> sub.unsubscribe());
  }
}
