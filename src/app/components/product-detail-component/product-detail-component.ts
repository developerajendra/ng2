/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES, ActivatedRoute, Router} from "@angular/router";
import {MessageService, iCartItem, ProductService, CartService, UserService, CookiesService, StaticDataService} from "../../services";
import {TenantConstant} from "../../constants/tenant";
import {MetaService} from "ng2-meta";
import {ProductCarouselComponent} from "../product-carousel-component";
import {BannerComponent} from "../banner-component";
import {DescriptionComponent} from "../description-component";
import {EmailModalComponent} from "../email-modal-component";
import {ImageZoomComponent} from "../image-zoom-component";
import {DittoControlComponent} from "../ditto-control";
import {ProductModel} from "../../models/product-model";
import {Title} from "@angular/platform-browser";
import {SelectLenseModal} from "../select-lense-modal-component";


declare var window: any;
declare var jQuery: any;
declare var ditto: any;

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for product-detail-component
 */

@Component({
  selector: 'product-detail',
  templateUrl: 'product-detail-component.html',
  styleUrls: ['product-detail-component.scss'],
  directives: [ROUTER_DIRECTIVES, ImageZoomComponent, ProductCarouselComponent, BannerComponent, DescriptionComponent,
    EmailModalComponent, DittoControlComponent,SelectLenseModal]
})

/**
 * Exporting class (ProductDetailComponent) from product-detail-component
 */

export class ProductDetailComponent implements OnInit, OnDestroy {


  owlCarousel       : any = null;
  imageCarouselOptions: any = {
    items: 5,
    loop: false,
    nav: true,
    dots: false,
    mouseDrag:false,
    margin: 20,
    responsive: {
      0: {
        items: 1,
        nav: false,
        dots: true
      },
      768: {
        dots: false,
        nav: true,
        items: 3
      },
      1024: {
        dots: false,
        nav: true,
        items: 4
      },
      1025: {
        dots: false,
        nav: true,
        items: 5
      }
    }
  };

  error: string = '';
  product: any = null;
  productId: string = '';
  bag: any = [];
  productDetails: any = null;
  customerFavorites: any = null;
  isEyeWear: boolean = false;

  protected sub: any;
  isLoading: boolean = false;
  cartItemsCount: any = 0;
  cartItems: any = null;
  htkItems: any = [];
  bagTotal: any = 0;
  cartData: any = 0;
  isHtkAdded: boolean = false;
  haveItems: number = 0;
  haveHtkItems: number = 0;

  subs: any = [];
  modalId: string = TenantConstant.MODAL.PRODUCT_MODAL;
  productModel: ProductModel = null;

  isProductDetailLoaded: boolean = false;

  quantityLimit:string = '';

  /**
   * constructor() used to initialize class level variables
   * @param _route
   * @param router
   * @param _productService
   */

  constructor(protected _messageService: MessageService, protected _userService: UserService, protected _cartService: CartService,
              protected router: Router, protected _route: ActivatedRoute, protected _productService: ProductService,
              protected _cookie: CookiesService, protected metaService: MetaService, protected _title: Title,private elementRef: ElementRef,protected  _staticData: StaticDataService) {
    this.isHtkAdded = false;
    this.loadUpdatedData();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.isHtkAdded = false;

    let sub = this._route.params.subscribe(params => {
      let chunk = params['pid'].split('-').slice(-1).toString();
      if (!chunk) {
        this.router.navigateByUrl('/404');
        return;
      }
      window.scrollTo(0, 0);

      this.isEyeWear = true;
      this.productId = chunk;

      this.productModel = new ProductModel(this._productService, this.productId);
      this.filterCustomerFavorites();
      this.setCurrentUrl();
    });
    this.subs.push(sub);
    this.shouldHtkLink();
    this.setMetaTags();
    this.staticData();
  }

  /**
   * ngOnDestroy function
   */
  ngOnDestroy() {
    this.subs.forEach((sub: any)=> {
      sub.unsubscribe();
    })
  }

  /**
   * staticData() usded for getting the static JSON data
   */
  staticData(){
    this._staticData.getDataValidation().then(data=> {
      this.quantityLimit = data.cart.messages.quantity_limit + data.numberformat.service_phone;
    });

  }



  /**
   * bagItemCount function
   * @returns {number}
   */

  loadUpdatedData() {
    this.getCartItemsCount();
    this.getCartItems();
    this.getBagTotal();
    this.getCartData();
    this.getHaveItems$();
    this.getHaveHtkItems$();
    this._cartService.getCartData().then(data=> {
      this.cartData = data;
      this.cartItems = this.cartData && this.cartData.selectedItems || null;
    }, e => {
    });
  }

  /**
   * getBagTotal function
   * @returns {any}
   */

  getBagTotal() {
    let sub = this._cartService.bagTotal$.subscribe(bagTotal => this.bagTotal = bagTotal, e => {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getCartItemsCount function
   * @returns {number}
   */

  getCartItemsCount() {
    let sub = this._cartService.cartItemsCount$.subscribe(cartItemsCount => {
      this.cartItemsCount = cartItemsCount;
    }, e => {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getCartData function
   * @returns {number}
   */

  getCartData() {
    let sub = this._cartService.cartData$.subscribe(cartData => {
      this.cartData = cartData;
      this.shouldHtkLink();
    }, e => {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getCartItems function
   * @returns {any}
   */

  getCartItems() {
    let sub = this._cartService.cartItems$.subscribe(items=> this.cartItems = items, e=> {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getHaveItems$ function
   * @returns {any}
   */

  getHaveItems$() {
    let sub = this._cartService.haveItems$.subscribe(have=> this.haveItems = have, e=> {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * getHaveHtkItems$ function
   * @returns {any}
   */

  getHaveHtkItems$() {
    let sub = this._cartService.haveHtkItems$.subscribe(have=> this.haveHtkItems = have, e=> {/*console.log('Error: ', e)*/
    });
    this.subs.push(sub);
  }

  /**
   * onAddToBag() used Add product into cart
   *
   * */
  addItemToCart(product, type) {
    let data: iCartItem = <iCartItem>{};
    this.isLoading = true;
    data.product_id = product.productId;
    data.product = {
      type: type,
      product_id: product.productId,
      name: product.name,
      color: product.color,
      imageUrl: this.productImageUrl(product),
      productDetailsRoute: '',
      prices: product.prices,
      lens_type: data.lens_type,
      high_index_optin: true,
      hasReviewed: false,
      isEyewear: product.isEyeWear
    };
    this._cartService.addItemToCart(data, type).then(()=> {
      this.isLoading = false;
    }, error=> {
      this.isLoading = false;
    });
  }

  /**
   *  productImageUrl() used to Get product image url
   *
   * */

  productImageUrl(_product) {
    return this._productService.getProductImageUrl(_product);
  }

  shouldHtkLink() {
    if (this.cartData && this.cartData.cart && this.cartData.cart.items && this.cartData.cart.items.home_trial_kit) {
      this.htkItems = this.cartData.cart.items.home_trial_kit;
      this.isHtkAdded = false;
      if (this.htkItems && this.htkItems.length != 0) {
        this.htkItems.map((item, index)=> {
          if (item.product_id == this.productId) {
            this.isHtkAdded = true;
          }
        });
      }
    }
  }


  addToBagModel() {
    this._cartService.isIteamLimitExceed(this.productId);
    this._messageService.setMessage(this.quantityLimit);

    let sub: any = this._cartService.haveProductLimitExceed$.subscribe(
      data => {
        if (data)
          this.modalId = TenantConstant.MODAL.LIMIT_MODAL;
        else
          this.modalId = TenantConstant.MODAL.PRODUCT_MODAL;
      },
      error => {/*console.log(error)*/
      }
    );
    this.subs.push(sub);
  }

  /**
   *  filterCustomerFavorites() used for getting the customer favorites
   */
   filterCustomerFavorites() {
    this.productModel && this.productModel.data.subscribe(_data=>{
     _data && _data.selectedProduct.then(data=>{
        let tag = this.productModel.relatedTAg;
        if (tag) {
          let obj: any = {collectionName: this.productModel.getCollectionFromSlug};
          this._productService.getProductCollectionData(obj).then(productsData=> {
              productsData.tiles = productsData.tiles.filter((tile: any) => {
                let flag = false;
                tile.products = tile.products.filter((p)=> {
                  (p.product_id === data[0].productId) && (flag = true);
                  // console.log(p);
                  let retVal = (p.tags.indexOf(tag) > -1) && (data[0].product_gender === p.product_gender) && (data[0].sunwear === p.sunwear);
                  return retVal;
                });
                return (!flag && (tile.products.length > 0));
              });
              this.customerFavorites = productsData;
            },
            error=>this.error = error);
        }
      });
    });
  }

  /**
   * setMetaTags() used to get products form DB
   *
   */

  setMetaTags() {
    if (!this.productModel) return;
    this.productModel.data.subscribe(_data => {
      if (_data.description) this.metaService.setTag('description', _data.description);
      // if (this.productModel.data.productDetailsRoute) this.metaService.setTag('og:url', TenantConstant.DOMAIN_URL + this.productModel.data.productDetailsRoute);
      if (_data.name) this.metaService.setTag('og:title', _data.name);
    });
    changeStatus();
  }

  /**
   * setCurrentUrl() used to set Current Url
   * @param tabName
   * @returns {boolean}
   */

  setCurrentUrl() {
    let url = window.location.pathname;
    if (url != "/auth/login" && url != '/register-user' && url != '/forgot-password' && !url.match(/resetpassword/gi)) {
      this._userService.setCurrentUrl(url);
    }

    if (this.productModel) {
      var sub = this.productModel.data.subscribe(()=> {
        history.replaceState({}, this.productModel.productStr, this.productModel.productURL);
        this._title.setTitle(this.productModel.productStr + " - " + TenantConstant.DOMAIN_SUFFIX);
      });
      this.subs.push(sub);
    }
  }


}
