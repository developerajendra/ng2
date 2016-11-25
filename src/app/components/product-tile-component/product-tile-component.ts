/**
 * Importing core components
 */

import {Component, OnInit, Input, EventEmitter, Output, OnDestroy, OnChanges, ElementRef} from "@angular/core";
import {ROUTER_DIRECTIVES, ActivatedRoute, Router} from "@angular/router";
import {iCartItem, ProductService, CartService, MessageService, StaticDataService} from "../../services";
import {ProductModel} from "../../models/product-model";
import {TenantConstant} from "../../constants/tenant";

/**
 * Importing custom services
 */

/**
 * Importing app level constants
 */

declare var jQuery:any;
declare var window:any;

/**
 * @Component for product-tile-component
 */

@Component({
  selector: 'product-tile',
  templateUrl: 'product-tile-component.html',
  styleUrls: ['product-tile-component.scss'],
  directives: [ROUTER_DIRECTIVES]
})

/**
 * Exporting class (ProductTileComponent) from product-tile-component
 */

export class ProductTileComponent implements OnInit, OnDestroy, OnChanges {

  @Input() selectedProduct:any = null;
  @Input() tile:any = null;
  @Input() eleIdToHide:any = null;
  @Input() modalId:any = null;
  @Input() filterBy:any = "";
  @Output() onProductSelected = new EventEmitter<boolean>();
  @Input() tileCollection:string = '';
  @Input() showBuyButton:boolean = true;
  @Input() isAddToCart:boolean = false;
  @Input() showSwatches:boolean = true;
  @Input() createProdLink:boolean = true;

  subs:any = [];
  quickBuyModelId:string = '';
  limitModelId:string = 'limitModal';
  productModel:ProductModel;
  isLoading:boolean = false;
  errorMessage:string = '';
  private lensTypeOfSelectedProduct:string = "";
  LENS_TYPE:any = Object.assign({}, TenantConstant.LENS_TYPE);
  quantityLimit:string = '';

  /**
   * constructor() used to initialize class level variables
   * @param _route
   * @param _ProductService
   */

  constructor(private _messageService:MessageService, private _cartService:CartService, private _router:Router,
              private _route:ActivatedRoute, private _ProductService:ProductService, private elementRef:ElementRef,private  _staticData: StaticDataService) {

  }



  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.quickBuyModelId = this.modalId;
    // if (!this.slug && !this.tileCollection) {
    //   this._router.navigate(['/']);
    // }
    this.tile.products.map((p:any)=> {
      p.tileCollection = this.tileCollection;
    });
    this.selectedProduct.tileCollection = this.tileCollection;
    if (this.selectedProduct && this.selectedProduct.product_id)
      this.productModel = new ProductModel(this._ProductService, this.selectedProduct.product_id,this.selectedProduct);
    this.updateProductDetailsData();
    this.getStyleClassObject();
    this.staticData();
  }

  /**
   * ngOnChanges() used to detect changes
   */

  ngOnChanges(changes) {
    if (changes && changes.filterBy && changes.filterBy.currentValue) {
      this.filterBy = changes.filterBy.currentValue;
      this.updateProductDetailsData();
    }
    if (changes && changes.selectedProduct && changes.selectedProduct.currentValue && changes.selectedProduct.currentValue.product_id) {
      this.productModel = new ProductModel(this._ProductService, changes.selectedProduct.currentValue.product_id,this.selectedProduct);

    }
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
   * getSelectedProduct() used to get selected product details/data
   * @param _product
   */

  getSelectedProduct(_product:any) {
    this.productModel = new ProductModel(this._ProductService, _product.product_id,_product);
    this.selectedProduct = _product;
    this.updateProductDetailsData();
    this.getStyleClassObject();
  }

  /**
   * buySelectedProduct() used emit the event for purchase
   */

  buySelectedProduct() {
    this.onProductSelected.emit(this.selectedProduct);
    this.checkProductQty();
  }

  /**
   * showQuickbuy() used to show quickbuy and hide product carousel
   */

  showQuickbuy() {
    this.onProductSelected.emit(this.selectedProduct);
    this.checkProductQty();
    //window.scrollTo(0, 600);
    //jQuery('#' + this.modalId).show();
    //this.eleIdToHide && jQuery('#' + this.eleIdToHide).hide();
  }

  /**
   * getStyleClassObject() used to get style class object
   */

  getStyleClassObject() {
    this.tile.products.map((data:any) => {
      var isActive = this.selectedProduct.product_id === data.product_id && "active" || "";
      data.swatchColor = data.color.trim().toLowerCase().split(' ').join('-').replace("-&", "") + " " + isActive;
      return data;
    });
  }

  /**
   * updateProductDetailsData() used to update product detail
   */

  private updateProductDetailsData() {
    this.onProductSelected.emit(this.selectedProduct);
  }

  /**
   * Check product quantity
   */
  checkProductQty() {
    this._cartService.isIteamLimitExceed(this.selectedProduct.product_id);
    this._messageService.setMessage(this.quantityLimit );

    let sub:any = this._cartService.haveProductLimitExceed$.subscribe(
      data => {
        if (data) {
          this.modalId = this.limitModelId;
        } else {
          this.modalId = this.quickBuyModelId;
        }
      },
      error => {/*console.log(error)*/
      }
    );
    this.subs.push(sub);
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub:any)=> sub.unsubscribe());
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
      // jQuery('#bagModal').modal("show");
      jQuery('#bagModal').show();
      window.scrollTo(0,0);
    }, error=> {
      this.errorMessage = error.message || error;
      // jQuery('#bagModal').modal("hide");
      jQuery('#bagModal').hide();
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
    return this.lensTypeOfSelectedProduct || this.LENS_TYPE.READING_LENS;
  }
}
