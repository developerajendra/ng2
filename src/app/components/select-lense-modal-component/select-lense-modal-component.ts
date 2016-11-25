/**
 * Importing core components
 */

import {Component, OnInit, OnChanges, Input, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {iCartItem, CartService, ProductService} from "../../services";
import {TenantConstant} from "../../constants/tenant";
import {ProductModel} from "../../models/product-model";

declare var jQuery:any;
declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for select-lense-modal-component
 */

@Component({
  moduleId: module.id,
  selector: 'select-lense-modal',
  templateUrl: 'select-lense-modal-component.html',
  styleUrls: ['select-lense-modal-component.css'],
  directives: [ROUTER_DIRECTIVES]

})

/**
 * Exporting class (SelectLenseModal) for select-lense-modal-component
 */

export class SelectLenseModal implements OnInit, OnChanges {
  @Input() product:ProductModel = null;
  @Input() productId:string = null;
  @Input() modalId:any = null;
  @Input() eleIdToHide:any = null;
  @Input() page:any = null;
  @Input() filterBy:any;
  activeImage:any = {0: true};
  errorMessage:string = "";
  isLoading:boolean = false;
  PRICE_LABEL:any = Object.assign({}, TenantConstant.prices);
  LENS_TYPE:any = Object.assign({}, TenantConstant.LENS_TYPE);

  private lensTypeOfSelectedProduct:string = "";
  owlCarousel:any = null;

  private defaultCarouselOptions:any = {
    items: 1,
    loop: true,
    nav: true,
    dots: true
  };
  changedImage:string = '';

  /**
   * constructor() used to initialize class level variables
   * @param _cartService
   * @param _productService
   */

  constructor(private _cartService:CartService, private _productService:ProductService, private elementRef:ElementRef) {
  }


  /**
   * onAddToBag() used Add product into cart
   *
   * */
  addItemToCart(product, type) {
    if (!product) return;
    let data:iCartItem = <iCartItem>{};
    this.isLoading = true;
    data.product_id = product.productId;
    data.lens_type = this.getLensType();
    data.high_index_optin = true;
    data.rx_id = null;
    data.product = {
      product_id: product.productId,
      name: product.name,
      color: product.color,
      imageUrl: product.gridImage,
      productDetailsRoute: '/' + product.productId,
      prices: product.prices,
      lens_type: data.lens_type,
      high_index_optin: true,
      rx_id: null,
      hasReviewed: false,
      isSunwear: !product.isEyeWear
    };

    this._cartService.addItemToCart(data, type).then(()=> {
      this.isLoading = false;
      this.openCart();

      window.scrollTo(0, 0);
    }, error=> {

      this.errorMessage = error.message || error;
      jQuery('#bagModal').modal("hide");
      setTimeout(()=> {
        jQuery(this.elementRef.nativeElement).find('#errorModal').modal("show");
      }, 0);
      this.isLoading = false;
    });
  }



  /**
   *  getLensType() used to get product lens type
   *
   * */

  getLensType() {
    return this.lensTypeOfSelectedProduct || (this.product.isEyeWear ? this.LENS_TYPE.STANDARD_INDEX_LENS : this.LENS_TYPE.NON_RX_SUN_LENS);
  }

  /**
   *  setLensType() used to set product lens type
   *
   * */

  setLensType(lensType) {
    this.lensTypeOfSelectedProduct = lensType;
  }

  openCart(){
    jQuery("#bagModal").modal("show");
  }

  /**
   * changeImage() used change the Image
   * @param index
   */

  changeImage(image,index) {
    this.activeImage = {};
    this.activeImage[index] = true;
    this.changedImage = image[index];
  }


  /**
   * ngOnInit()
   */

  ngOnInit() {
    if (!this.product && this.productId) {
      this.product = new ProductModel(this._productService, this.productId);
    }
    if (!this.product) return;
    if (!this.filterBy) {
      this.filterBy = "sunglasses";
      if (this.product.isEyeWear)
        this.filterBy = "eyeglasses";
    }

    this.modalId = this.modalId || 'quickbuy';
    let _id = '#' + this.modalId;

    setTimeout(()=> {
      jQuery(this.elementRef.nativeElement).find(_id).on('hidden.bs.modal', ()=> {
        this.activeImage = {0: true};
      });
    }, 100);
    setTimeout(() => {
      this.owlCarousel = jQuery(this.elementRef.nativeElement).find('carousel-container').owlCarousel(this.defaultCarouselOptions);
    }, 5);
  }

  /**
   * ngOnChanges()
   */

  ngOnChanges(values:any) {
    if (values && values.product && values.product.currentValue) {
      this.productId = values.product.currentValue.product_id;
      this.product = new ProductModel(this._productService, this.productId);
    }
    if (values && values.productId && values.productId.currentValue) {
      this.productId = values.productId.currentValue;
      this.product = new ProductModel(this._productService, this.productId);
    }
    if (values && values.filterBy && values.filterBy.currentValue) {
      this.filterBy = values.filterBy.currentValue;
    }

    this.errorMessage = '';
    this.changedImage = '';

  }
}
