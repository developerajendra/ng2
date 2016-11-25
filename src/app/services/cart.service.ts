import {Injectable} from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import {Router} from "@angular/router";
import {Observable, Subject} from "rxjs/Rx";
import "rxjs/add/operator/map";
import {HttpClient, CookiesService} from "./auth";
import {AppConstants} from "../constants/app-constants";
import {StorageService} from "./storage.service";
import {ProductService} from "./product.service";
import {Utils} from "../shared/utils";


/**
 * Global variable
 */
declare var moment: any;
declare var $: any;

export interface iCartItem {
  product_id: string;
  lens_type?: string;
  // variant?:string;
  high_index_optin?: boolean;
  rx_id?: any;
  product?: any;
}

/**
 * @Injectable for cart.service
 */
@Injectable()

/**
 * Exporting class (CartService) for cart.service
 */
export class CartService {

  /**
   * class level variables
   */
  private _cartData$: Subject<any>;
  private _cartItemsCount$: Subject<number>;
  private _cartItems$: Subject<any[]>;
  private _bagTotal$: Subject<number>;
  private _haveItems$: Subject<number>;
  private _haveHtkItems$: Subject<number>;
  private _haveProductLimitExceed$: Subject<any>;
  private cartData: any = null;
  private moment: any = null;
  private _finalChekcoutCartObject: any = {};

  subs: any = [];

  /**
   * constructor function
   * @param _http
   */

  constructor(protected _httpClient: HttpClient, protected _router: Router, protected _cookie: CookiesService, protected _http: Http,
              protected _productService: ProductService, protected _storageService: StorageService, protected _utils: Utils) {
    this._cartData$ = <Subject<any>>new Subject();
    this._cartItemsCount$ = <Subject<number>>new Subject();
    this._cartItems$ = <Subject<any[]>>new Subject();
    this._bagTotal$ = <Subject<number>>new Subject();
    this._haveItems$ = <Subject<number>>new Subject();
    this._haveHtkItems$ = <Subject<number>>new Subject();
    this._haveProductLimitExceed$ = <Subject<any>>new Subject();
    this.getCounts();
    let sub: any = this.cartItemsCount$.subscribe(count => {
      if (count === 0) {
        $(".close").click();
      }
    });
    this.subs.push(sub);
  }

  getCounts() {
    this.getCurrentBag()
    .then((cartData) => {
      this._cartData$.next(cartData);
      this._cartItemsCount$.next(this.getCartItemsCount(cartData.cart));
      this._cartItems$.next(cartData.selectedItems);
      this._bagTotal$.next(cartData.cart.totals.subtotal);
      this._haveItems$.next(this.getIsHaveItems(cartData.selectedItems));
      this._haveHtkItems$.next(this.getIsHaveHtkItems(cartData.selectedItems));
    }, e => {
    });
  }

  get cartData$() {
    return this._cartData$.asObservable();
  }

  get cartItemsCount$() {
    return this._cartItemsCount$.asObservable();
  }

  get cartItems$() {
    return this._cartItems$.asObservable();
  }

  setCartItems$(value: any) {
    this._cartItems$.next(value);
  }

  get bagTotal$() {
    return this._bagTotal$.asObservable();
  }

  get haveItems$() {
    return this._haveItems$.asObservable();
  }

  get haveHtkItems$() {
    return this._haveHtkItems$.asObservable();
  }

  get haveProductLimitExceed$() {
    return this._haveProductLimitExceed$.asObservable();
  }

  getCartData(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getCurrentBag()
      .then(cartData => {
        resolve(cartData);
      }, e => {
        reject(e);
      });
    });
  }

  /**
   * function removeCache()
   * @returns {Array}
   */
  removeCache() {
    this._cartItems$.next([]);
    this._cartItemsCount$.next(0);
    this._bagTotal$.next(0);
    this._cartData$.next(null);
    this.cartData = null;
    this._haveItems$.next(0);
    this._haveHtkItems$.next(0);
    this._storageService.removeItem(AppConstants.CART);
  }

  /**
   * function getCurrentBag()
   * @returns {Array}
   */

  getCurrentBag(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let _bag: any = this.getCartDataFromLocalStorage();
      if (this.cartData && this.cartData.cart) {
        if (moment.utc(this.cartData.cart.expires).valueOf() < moment.utc().valueOf()) {
          this.removeCache();
          reject({message: 'Error: Your cart got expired'});
        }
        resolve(this.cartData);
      } else if (_bag.cart) {
        if (moment.utc(_bag.cart.expires).valueOf() < moment.utc().valueOf()) {

          this.createCart().then((cartData: any) => {
            this.cartData = {};
            _bag.cart.cart_id = cartData.cart.cart_id;
            this.writeCartToLocalStorage(_bag);
            this.cartData.cart = _bag.cart;
            this.cartData.selectedItems = _bag.selectedItems;
            let _bag1: any = this.getCartDataFromLocalStorage();
            this.getCounts();
          }, error => {
            reject(error);
          });
          reject({message: 'Bag: Your cart got expired'});
        } else {
          resolve(_bag);
        }
      } else {
        reject({message: 'Unable to get current bag.'});
      }
    });
  }

  /**
   * function getCurrentBag()
   * @returns {Array}
   */
  getNewBag(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.createCart().then((cartData: any) => {
        let _bag: any = this.getCartDataFromLocalStorage();
        cartData.selectedItems = [];
        cartData.selectedHtkItems = [];
        this.setCurrentBag(cartData)
        .then((cartData) => {
          resolve(cartData);
        }, error => reject(error));
      }, error => {
        reject(error);
      });
    });
  }

  /**
   * function setCurrentBag()
   * @returns {Array}
   */
  setCurrentBag(_bag: any) {
    return new Promise<any>((resolve, reject) => {
      let _cart: any = null;
      try {
        _cart = JSON.parse(JSON.stringify(_bag.cart));
      } catch (e) {
        return reject(e);
      }

      if (_cart && !this.getCartItemsCount(_cart) && _cart.status === "CART_STATUS_NEW") {
        this.cartData = _bag;
        this._cartData$.next(this.cartData);
        this.writeCartToLocalStorage(this.cartData);
        resolve(this.cartData);
      } else {
        this.updateCart(_cart.cart_id, _cart)
        .then((cartData: any) => {
          cartData.selectedItems = _bag.selectedItems;
          this.cartData = cartData;
          this._cartItemsCount$.next(this.getCartItemsCount(this.cartData.cart));
          this._cartData$.next(this.cartData);
          this._cartItems$.next(this.cartData.selectedItems);
          this._bagTotal$.next(this.cartData.cart.totals.subtotal);
          this._haveItems$.next(this.getIsHaveItems(cartData.selectedItems));
          this._haveHtkItems$.next(this.getIsHaveHtkItems(cartData.selectedItems));
          this.writeCartToLocalStorage(this.cartData);
          resolve(this.cartData);
        }, error => {
          if (error.code === "E_CART_UNAVAILABLE") {
            this.removeCache();
            this._router.navigate(['/']);
          }
          reject(error);
        });
      }
    });
  }

  /**
   * addItemToCart function
   * @param data
   * @param type
   */
  addItemToCart(data: any, type: string = ''): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      let cartItem: iCartItem = <iCartItem>{};
      let handleAddToCart = (cartData: any) => {
        let isNewItem: boolean = true;

        if (cartData && type && cartData.cart.items[type]) {
          cartItem.product_id = data.product_id;
          cartItem.high_index_optin = data.high_index_optin;
          cartItem.lens_type = data.lens_type;
          cartItem.rx_id = data.rx_id;

          cartData.cart.items[type].push(cartItem);
          cartData.selectedItems.map((item: any) => {
            if (data.product && data.product.lens_type && data.product_id == item.product_id && data.product.lens_type === item.lens_type && item.item_type == type) {
              item.qty++;
              isNewItem = false;
            }
          });
          var lens_type = data.product.lens_type;//(data.product.lens_type != 'STANDARD_INDEX_LENS') ? (data.product.lens_type == 'RX_SUN_LENS') ?
          // 'ORIGINAL_RX' : 'ORIGINAL_SUN' : data.product.lens_type;
          var price = data.product.prices[lens_type + '_PRICE'] || 0;
          if (isNewItem && data.product && type != "home_trial_kit") {
            data.product.qty = 1;
            data.product.item_type = type;
            data.product.totalPrice = data.product.prices[data.product.lens_type + '_PRICE'] * data.product.qty;
            data.product.lens_type = lens_type || 0;
            data.product.totalPrice = price * data.product.qty;

            cartData.selectedItems.push(data.product);
          } else if (type != "home_trial_kit") {
            data.product.totalPrice = price * data.product.qty;
          } else if (type === "home_trial_kit") {
            data.product.item_type = type;
            // data.variant = cartItem.variant;
            cartData.selectedItems.push(data.product);
          }
          if (!this._cookie.getCookie("kioskId")) {
            cartData.cart.rx && (delete cartData.cart.rx);
          }
          this.setCurrentBag(cartData)
          .then((_cartData) => {
            resolve(_cartData);
          }, error => {
            if (error.code === "E_CART_UNAVAILABLE") {
              this.getNewBag().then(handleAddToCart, error => {
                reject(error);
              });
            } else {
              this.resetCartItem(cartItem.product_id, type, cartData);
              reject(error);
            }
          });
        } else {
          reject('Property "' + type + '" of cart items not found .');
        }
      };

      this.getCurrentBag().then(handleAddToCart, error => {
        this.getNewBag().then(handleAddToCart, error => {
          this.getNewBag().then(()=>{});
          reject(error);
        });
      });
    });
  }

  /**
   * deleteItem function
   * @param product
   */

  deleteItem(product: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getCurrentBag()
      .then(cartData => {
        cartData.cart.items.eyewear = cartData.cart.items.eyewear.filter((item) => {
          return !(item.product_id === product.product_id && product.lens_type === item.lens_type);
        });
        cartData.cart.items.gift_cards = cartData.cart.items.gift_cards.filter((item) => {
          return !(item.product_id === product.product_id && product.lens_type === item.lens_type);
        });
        cartData.cart.items.home_trial_kit = cartData.cart.items.home_trial_kit.filter((item) => {
          return !(item.product_id === product.product_id && product.lens_type === item.lens_type);
        });
        cartData.selectedItems = cartData.selectedItems.filter((item) => {
          return !(item.product_id === product.product_id && product.lens_type === item.lens_type);
        });
        if (!this._cookie.getCookie("kioskId")) {
          cartData.cart.rx && (delete cartData.cart.rx);
        }

        this.setCurrentBag(cartData)
        .then((cartData) => {
          this.isIteamLimitExceed(product.product_id);
          resolve(cartData);
        }, error => reject(error));
      }, e => {
        reject(e);
      });
    });
  }

  updateItem(product: any, qty: number, type: string = ''): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.getCurrentBag()
      .then(cartData => {
        if (cartData && product && type && cartData.cart.items[type]) {
          cartData.cart.items[type] = cartData.cart.items[type].filter((item: any) => {
            return !(product && product.lens_type && product.product_id === item.product_id && product.lens_type === item.lens_type)
          });
          for (let i = 0; i < qty; i++) {
            let cartItem: iCartItem = <iCartItem>{};
            cartItem.product_id = product.product_id;
            // cartItem.variant = TenantConstant.variants[product.variant];
            cartItem.high_index_optin = product.high_index_optin;
            cartItem.lens_type = product.lens_type;
            cartItem.rx_id = product.rx_id;
            cartData.cart.items[type].push(cartItem);
          }

          if (!this._cookie.getCookie("kioskId")) {
            cartData.cart.rx && (delete cartData.cart.rx);
          }

          this.setCurrentBag(cartData)
          .then((updatedCartData: any) => {
            cartData.selectedItems.map((item: any) => {
              if (product && product.lens_type && product.product_id == item.product_id && product.lens_type === item.lens_type) {
                item.qty = qty;
                item.totalPrice = product.prices[product.lens_type + '_PRICE'] * qty;
              }
            });
            updatedCartData.selectedItems = cartData.selectedItems;
            this._cartItems$.next(cartData.selectedItems);
            this.writeCartToLocalStorage(updatedCartData);
            resolve(updatedCartData);
          }, error => {
            reject(error);
          });
        } else {
          reject('Property "' + type + '" of cart items not found .');
        }
      }, e => {
        reject(e);
      });
    });
  }

  updateItemWithRxId(cartData: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      cartData.cart.items.eyewear = [];
      cartData.cart.items.home_trial_kit = [];
      cartData.cart.items.gift_cards = [];

      cartData.selectedItems.map((product: any)=> {
        cartData.cart.items[product.item_type] = cartData.cart.items[product.item_type] || [];
        let cartItem: iCartItem = <iCartItem>{};
        cartItem.product_id = product.product_id;
        // cartItem.variant = TenantConstant.variants[product.variant];
        cartItem.high_index_optin = product.high_index_optin;
        cartItem.lens_type = product.lens_type;
        cartItem.rx_id = null;

        if (product.rx) {
          Object.keys(product.rx).forEach((key: any)=> {
            if (product.rx[key].id) {
              cartItem.rx_id = product.rx[key].id;
              cartItem.lens_type = product.rx[key].rx_lens_type;
            } else {
              cartItem.lens_type = product.rx[key].rx_lens_type;
            }
            cartData.cart.items[product.item_type].push(JSON.parse(JSON.stringify(cartItem)));
          });
        } else {
          cartData.cart.items[product.item_type].push(JSON.parse(JSON.stringify(cartItem)));
        }
      });

      this.setCurrentBag(cartData)
      .then(_cartData => {
        resolve(_cartData);
      }, error => {
        reject(error);
      });
    });
  }

  /**
   * createCart function
   * @returns {Observable<R>}
   */
  createCart() {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/carts/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/carts/');//?key=' + TenantConstant.API_KEY;
    return this._http.post(_path, null)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * updateCart function
   * @returns {Observable<R>}
   */
  updateCart(id, data) {
    let _body: string = '',
      _headers = new Headers({"Content-Type": "application/json"}),
      _options = new RequestOptions({headers: _headers});

    try {
      _body = JSON.stringify(data);
    } catch (e) {
      return Promise.reject(e);
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/carts/' + id + '/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/carts/' + id + '/');//?key=' + TenantConstant.API_KEY;
    return this._http.put(_path, _body, _options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * deleteCart function
   * @returns {Observable<R>}
   */
  deleteCart(id) {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/carts/' + id + '/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/carts/' + id + '/');//?key=' + TenantConstant.API_KEY;
    return this._http.delete(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * checkoutCart function
   * @returns {Observable<R>}
   */
  checkoutCart(id) {
    let _body: string = '',
      _headers = new Headers({"Content-Type": "application/json"}),
      _options = new RequestOptions({headers: _headers});

    try {
      _body = "";
    } catch (e) {
      return Promise.reject(e);
    }
    let _path: string = this._utils.makeAPIURL('/orders/carts/' + id + '/checkout/'); //?key=' + this._helperService.apiKey;
    return this._httpClient.post(_path, _body, _options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * guestCheckoutCart function
   * @returns {Observable<R>}
   */
  guestCheckoutCart(id) {
    let _body: string = '',
      _headers = new Headers({"Content-Type": "application/json"}),
      _options = new RequestOptions({headers: _headers});

    try {
      _body = JSON.stringify(_body);
    } catch (e) {
      return Promise.reject(e);
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/carts/' + id + '/guest_checkout/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/carts/' + id + '/guest_checkout/');//?key=' + TenantConstant.API_KEY;
    return this._http.post(_path, _body, _options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  private resetCartItem(productId: any, type: any, cartData: any) {
    cartData.selectedItems = cartData.selectedItems.filter((item: any) => {
      return (productId !== item.product_id)
    });
    cartData.cart.items[type] = cartData.cart.items[type].filter((item: any) => {
      return (productId !== item.product_id)
    });
    this.cartData = JSON.parse(JSON.stringify(cartData));
    this._cartData$.next(this.cartData);
    this._cartItemsCount$.next(this.getCartItemsCount(this.cartData.cart));
    this._cartItems$.next(this.cartData.selectedItems);
    this._bagTotal$.next(this.cartData.cart.totals.subtotal);
    this._haveItems$.next(this.getIsHaveItems(cartData.selectedItems));
    this._haveHtkItems$.next(this.getIsHaveHtkItems(cartData.selectedItems));
    this.writeCartToLocalStorage(this.cartData);
  }

  /**
   * extractData function
   * @param res
   * @returns {any|{}}
   */

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  /**
   * handleError function
   * @param error
   * @returns {ErrorObservable}
   */

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errorData = error.json() || error;
    if (errorData.data && errorData.data.code && errorData.data.message) {
      return Promise.reject(errorData.data);
    } else if (errorData.data && errorData.data.message && errorData.data.message.code) {
      return Promise.reject(errorData.data.message);
    } else {
      let errMsg = (errorData.message) ? errorData.message :
        errorData.status ? `${errorData.status} - ${errorData.statusText}` : 'Server error';
      return Promise.reject(errMsg);
    }
  }

  /**
   * getCartItemsCount function
   * @param cart
   * @returns {cartItemsCount}
   */

  private getCartItemsCount(cart: any): number {
    let cartItemsCount = []
    .concat(cart.items.eyewear)
    .concat(cart.items.home_trial_kit)
    .concat(cart.items.gift_cards)
      .length;
    return cartItemsCount;
  }

  /**
   * getIsHaveItems function
   * @param cart
   * @returns {bool}
   */

  public getIsHaveItems(items: any): number {
    let cartItems = items.filter((item)=>item.item_type != 'home_trial_kit')
    return cartItems && cartItems.length;
  }

  /**
   * getIsHaveHtkItems function
   * @param cart
   * @returns {bool}
   */

  public getIsHaveHtkItems(items: any): number {
    let cartHtkItems = items.filter((item)=>item.item_type == 'home_trial_kit')
    return cartHtkItems && cartHtkItems.length;
  }

  /**
   * validate promo code
   * */
  validatePromoCode(payload) {
    let _body: string = '',
      _headers = new Headers({"Content-Type": "application/json"}),
      _options = new RequestOptions({headers: _headers});

    try {
      _body = JSON.stringify(payload);
    } catch (e) {
      Promise.reject(e);
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/discount_codes/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/discount_codes/');//?key=' + TenantConstant.API_KEY;
    return this._http.post(_path, _body, _options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * isIteamLimitexceed funciton
   * @param product_id
   */
  isIteamLimitExceed(product_id: any) {

    this.getCartData().then((cartData)=> {
      this._haveProductLimitExceed$.next(false);
      if (cartData && cartData.selectedItems.length) {
        cartData.selectedItems.forEach((items: any)=> {
          if (items.product_id == product_id) {
            if (items.qty >= 5) {
              this._haveProductLimitExceed$.next(true);
            } else {
              this._haveProductLimitExceed$.next(false);
            }
          }
        });
      } else {
        this._haveProductLimitExceed$.next(false);
      }

    }, (error)=> {
      // console.log("cart data ", error);
    });
  }

  writeCartToLocalStorage(cartObj) {
    if (cartObj) {
      this._storageService.setItem(AppConstants.CART, (typeof cartObj === "string") ? cartObj : JSON.stringify(cartObj));
    }
  }

  getCartDataFromLocalStorage() {
    let _item = this._storageService.getItem(AppConstants.CART, null);
    let _cart: any = {totalProductCount: 0};

    if (_item && _item.cart && moment.utc(_item.cart.expires).valueOf() < moment.utc().valueOf()) {
      this.removeCache();
      _item = null;
      // alert("cart is expired");
    }
    if (_item) {
      _item.totalProductCount = this.getCartItemsCount(_item.cart);
      return _item;
    }
    return _cart;
  }

  getFinalCheckoutCart() {
    return this._finalChekcoutCartObject || {};
  }

  setFinalCheckoutCart(cart) {
    this._finalChekcoutCartObject = cart;
  }

  /**
   * ngOnDestroy() used to destroy notify
   */
  ngOnDestroy() {
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }
}
