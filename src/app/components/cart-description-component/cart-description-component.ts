/**
 * Importing core components
 */

import {Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, ElementRef} from '@angular/core';
import {Router} from '@angular/router';

/**
 * Importing custom services
 */

import {CustomizeLensService,CartService, ProductService, NotifyService, CookiesService} from '../../services';

/**
 * Importing custom components
 */

import {TenantConstant} from '../../constants/tenant';

import {OrderByPipe} from '../../pipes/orderby';
import {ContinueShoppingComponent} from '../continue-shopping-component';
import {LimitComponent} from '../limit-component';
import {LoaderComponent} from "../loader-component";

declare var jQuery:any;

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for checkout-component
 */

@Component({
  selector: 'cart-description',
  templateUrl: 'cart-description-component.html',
  styleUrls: ['cart-description-component.scss'],
  directives: [ ContinueShoppingComponent, LimitComponent, LoaderComponent],
  pipes: [OrderByPipe],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})

/**
 * Exporting class (CheckoutComponent) from checkout-component
 */

export class CartDescriptionComponent implements OnInit {

  subs:any = [];
  bag:any = [];
  cartItems:any = null;
  bagTotal:any = 0;
  showLimitPopUp:boolean = false;
  isKioskMode:boolean = false;

  activeImage:any = {0: true};
  isLoading = false;
  enableLoader = false;
  PRICES:any = Object.assign({}, TenantConstant.prices);

  private lensTypeOfSelectedProduct:string = "";
  private isHighIndexOption:boolean = false;
  private rxIdForSelectedProduct:string = "";
  private variant:string = "";
  cartItemsCount:any = 0;
  haveItems:number = 0;
  haveHtkItems:number = 0;

  message:string = '';
  haveCustomizeLenses:any = false;
  rx_id:any = 0;
  private count:any = 0;
  rx_product:any = null;
  customizeLensesId:any = '';


  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _customizeLensService:CustomizeLensService, private _cookie:CookiesService, private _cartService:CartService, private _productService:ProductService, private _router:Router, private elemRef:ElementRef, private _notifyHeader:NotifyService) {
    this.loadUpdatedData();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    changeStatus();
    this.isCustomizeLenses();
  }

  /**
   * bagItemCount function
   * @returns {number}
   */

  loadUpdatedData() {
    let _cart = this._cartService.getCartDataFromLocalStorage();
    this.cartItems = _cart && _cart.selectedItems || null;
    this.bagTotal = _cart && _cart.cart && _cart.cart.totals && _cart.cart.totals.subtotal || 0;
    this.haveHtkItems = this.getIsHaveHtkItems(this.cartItems);
    this.getCartItemsCount();
    this.getCartItems();
    this.getBagTotal();
    this.getHaveItems();
    this.getHaveHtkItems();
  }

  /**
   * getCartItemsCount function
   * @returns {number}
   */

  getCartItemsCount() {
    let sub:any = this._cartService.cartItemsCount$.subscribe(cartItemsCount=>this.cartItemsCount = cartItemsCount, e=> {/*console.log('Error: ', e)*/});
    this.subs.push(sub);
  }

  /**
   * getBagTotal function
   * @returns {any}
   */

  getBagTotal() {
    let sub:any = this._cartService.bagTotal$.subscribe(bagTotal => this.bagTotal = bagTotal, e => {/*console.log('Error: ', e)*/});
    this.subs.push(sub);
  }

  /**
   * getCartItems function
   * @returns {any}
   */

  getCartItems() {
    let sub:any = this._cartService.cartItems$.subscribe((cartItems) => {
      this.cartItems = cartItems;
      this.haveHtkItems = this.getIsHaveHtkItems(this.cartItems);
      if (this.cartItems.length === 0) {
        this._router.navigate(['/checkout/continue-shopping']);
      }
    }, e => {/*console.log('Error: ', e)*/});
    this.subs.push(sub);
  }

  /**
   * getHaveItems$ function
   * @returns {any}
   */

  getHaveItems() {
    let sub:any = this._cartService.haveItems$.subscribe(have=> {
      this.haveItems = have;
    }, e=>{/*console.log('Error: ', e)*/});
    this.subs.push(sub);
  }

  /**
   * getHaveHtkItems$ function
   * @returns {any}
   */

  getHaveHtkItems() {
    let sub:any = this._cartService.haveHtkItems$.subscribe(have=> this.haveHtkItems = have, e=>{/*console.log('Error: ', e)*/});
    this.subs.push(sub);
  }

  /**
   * getIsHaveItems function
   * @param items
   * @returns {bool}
   */

  private getIsHaveItems(items:any):number {
    let cartItems = items.filter((item)=>item.item_type != 'home_trial_kit');
    return cartItems && cartItems.length;
  }

  /**
   * getIsHaveHtkItems function
   * @param items
   * @returns {bool}
   */

  private getIsHaveHtkItems(items:any):number {
    let cartHtkItems = items.filter((item)=>item.item_type == 'home_trial_kit');
    return cartHtkItems && cartHtkItems.length;
  }

  /**
   * deleteItem function
   * deleteItem() used to remove a item from cart/bag
   * @param product_id
   */



  deleteItem(product) {
    this.isLoading = true;
    this._cartService.deleteItem(product)
      .then(() => {
        this.isLoading = false;
        this.isCustomizeLenses();
      })
      .catch(e => {/*console.log('Error: ', e)*/});
  }

  /**
   * updateItem function
   */

  updateItem(product, qty) {
    if (qty.value >= 1 && qty.value <= 5) {
      this.isLoading = true;
      this._cartService.updateItem(product, qty.value, product.item_type)
        .then((data) => {
            let _cart = this._cartService.getCartDataFromLocalStorage();
            this.cartItems = _cart && _cart.selectedItems || null;
            this.bagTotal = _cart && _cart.cart && _cart.cart.totals && _cart.cart.totals.subtotal || 0;
            this.isLoading = false;
            this.isCustomizeLenses();
          },
          e => {
            let _cart = this._cartService.getCartDataFromLocalStorage();
            this.cartItems = _cart && _cart.selectedItems || null;
            this.bagTotal = _cart && _cart.cart && _cart.cart.totals && _cart.cart.totals.subtotal || 0;
            this.isLoading = false;
            this.isCustomizeLenses();
            this.message = 'Required Quantity is not in Stock !!!';
            jQuery(this.elemRef.nativeElement).find('#limitModal').modal("show");
          });
    }
    else {
      let _cart = this._cartService.getCartDataFromLocalStorage();
      this.cartItems = _cart && _cart.selectedItems || null;
      this.bagTotal = _cart && _cart.cart && _cart.cart.totals && _cart.cart.totals.subtotal || 0;
      this.isLoading = false;
      if (qty.value < 1) {
        this.message = "Item Quantity can't be " + qty.value;
      } else {
        this.message = 'To order more than 5 pairs, please call us at : 888-509-5499.';
      }
      jQuery(this.elemRef.nativeElement).find('#limitModal').modal("show");
    }


  }

  /**
   * isCustomizeLenses Function
   *
   */
  isCustomizeLenses() {
    this._customizeLensService.getCustomizeLense().then((data)=>{
      this.customizeLensesId = data.id;
      this.haveCustomizeLenses = data.isCustomize;
    },(error)=>{
      console.log("error", error);
    });
  }



  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub:any)=> sub.unsubscribe());
  }

}
