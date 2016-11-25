/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from '@angular/core';
import {ROUTER_DIRECTIVES} from '@angular/router';

/**
 * Importing custom services
 */

import {CartService, ProductService} from '../../services';

declare var jQuery:any;

/**
 * @Component for bag-modal-compoent
 */

@Component({
  selector: 'bag-modal',
  templateUrl: 'bag-modal-component.html',
  styleUrls: ['bag-modal-component.scss'],
  directives: [ROUTER_DIRECTIVES]
})

/**
 * Export class (BagModal) for bag-modal-component
 */

export class BagModal implements OnInit {
  subs:any = [];
  bag:any = [];
  cartItems:any = null;
  bagTotal:any = 0;
  cartItemsCount:any = 0;
  haveItems:number = 0;
  haveHtkItems:number = 0;

  /**
   * constructor function
   * @param _cartService
   * @param _productService
   * @param elemRef
   */

  constructor(private _cartService:CartService, private _productService:ProductService, private elemRef:ElementRef) {
    this.loadUpdatedData();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
  }

  /**
   * bagItemCount function
   * @returns {number}
   */

  loadUpdatedData() {
    this.getCartItemsCount();
    this.getCartItems();
    this.getBagTotal();
    this.getHaveItems();
    this.getHaveHtkItems();
  }

  /**
   * getBagTotal function
   * @returns {any}
   */

  getBagTotal() {
    let sub:any = this._cartService.bagTotal$.subscribe(bagTotal=>this.bagTotal = bagTotal, e=> {/*console.log('Error: ', e)*/});
    this.subs.push(sub);
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
   * getCartItems function
   * @returns {any}
   */

  getCartItems() {
    let sub:any = this._cartService.cartItems$.subscribe(items=> this.cartItems = items, e=>{/*console.log('Error: ', e)*/});
    this.subs.push(sub);
  }

  /**
   * getHaveItems$ function
   * @returns {any}
   */

  getHaveItems() {
    let sub:any = this._cartService.haveItems$.subscribe(have=> this.haveItems = have, e=>{/*console.log('Error: ', e)*/});
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
   * closeBagModal function
   */

  closeBagModal() {
    setTimeout(()=> {
      jQuery(this.elemRef.nativeElement).find('.close').click();
    }, 500);
  }

  /**
   * deleteItem function
   * deleteItem() used to remove a item from cart/bag
   * @param product_id
   */

  deleteItem(product) {
    this._cartService.deleteItem(product);
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub:any)=> sub.unsubscribe());
  }
}

