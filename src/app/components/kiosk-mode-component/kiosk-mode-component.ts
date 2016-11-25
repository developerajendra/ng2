/**
 * Importing core components
 */

import {Component, OnInit} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';

/**
 * Importing internl services
 */

import {CookiesService, OrderService, UserService, CartService, NotifyService } from "../../services";


/**
 * Importing app level constants
 */

import {AppConstants} from '../../constants/app-constants';

/**
 * @Component for kiosk-mode component
 */

@Component({
  selector: "kiosk-mode",
  templateUrl: "kiosk-mode-component.html",
  styleUrls: ["kiosk-mode-component.scss"],
  directives: [ROUTER_DIRECTIVES]
})

/**
 * Exporting KioskModeComponent component
 */

export class KioskModeComponent implements OnInit {
  private kioskId:any = null;

  /**
   * constructor() to initialize class lebel variables
   */
  constructor(private _router:Router, private _cartService:CartService, private _notifyService:NotifyService, private _userService:UserService, private _cookie:CookiesService, private _kiosk:OrderService, private _route:ActivatedRoute) {

  }

  /**
   * onInit function
   */

  ngOnInit() {

  }

  /**
   * ngAfterViewInit loads after all component and content loaded
   */
  ngAfterViewInit() {
    this.getKioskData();
  }

  /**
   * getKioskData() function
   */

  getKioskData() {
    this.kioskId = this._route.snapshot.params['kiosk_id'];
    this.kioskId && this._kiosk.getKioskMode("store_locations").
      then((data)=> {
        for (var d in data) {
          if (data[d]["kiosk_id"] == this.kioskId) {
            this.logout();
            this._cookie.setCookie("kioskId", data[d]["kiosk_id"], 1);
            this._notifyService.setKioskMode$(data[d]["kiosk_id"]);
          }
        }
      }, err=> {
        // console.log(err)
      });
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
    }, e => {});
  }


}
