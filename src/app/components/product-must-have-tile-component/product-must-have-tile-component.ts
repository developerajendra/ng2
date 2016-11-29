import {Component, OnInit, Input, EventEmitter, Output, OnDestroy} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ProductService, MessageService, CartService} from "../../services";
import {TenantConstant} from "../../constants/tenant";


declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for product-tile-component
 */

@Component({
  selector: 'product-must-have-tile',
  templateUrl: 'product-must-have-tile-component.html',
  styleUrls: ['product-must-have-tile-component.scss']
})

/**
 * Exporting class (ProductTileComponent) from product-tile-component
 */

export class ProductMusthaveTileComponent implements OnInit, OnDestroy {

  @Input() selectedProduct: any = null;
  @Input() tile: any = null;
  @Input() slug: any = null;
  @Input() filterBy: any = "";
  @Input() tileCollection: string = '';
  @Output() onProductSelected = new EventEmitter<boolean>();
  product_image_url: string = '';
  productDetailsRoute: string = '';
  isEyeWear: boolean = false;
  modalId: string = 'myModal';
  subs: any = [];

  /**
   * constructor() used to initialize class level variables
   * @param _route
   * @param _ProductService
   */

  constructor(private _messageService: MessageService, private _cartService: CartService, private _router: Router, private _route: ActivatedRoute, private _ProductService: ProductService) {

  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    if (!this.slug && !this.tileCollection) {
      this._router.navigate(['/']);
    }
    this.tile.products.map((p: any)=> {
      p.tileCollection = this.tileCollection;
    });
    this.selectedProduct.tileCollection = this.tileCollection;
    this.filterBy = "eyeglasses";
    this.updateProductDetailsData();
    this.getStyleClassObject();
    changeStatus();
  }

  /**
   * ngOnChanges() used to detect changes
   */

  ngOnChanges(changes) {
    if (changes && changes.filterBy && changes.filterBy.currentValue) {
      this.filterBy = changes.filterBy.currentValue;
      this.updateProductDetailsData();
    }
  }

  /**
   * getSelectedProduct() used to get selected product details/data
   * @param _product
   */

  getSelectedProduct(_product: any) {
    this.selectedProduct = _product;
    this.updateProductDetailsData();
    this.getStyleClassObject();
  }

  /**
   * buySelectedProduct() used emit the event for purchase
   */

  buySelectedProduct() {
    this.onProductSelected.emit(this.selectedProduct);
    this.addToBagModel();
  }

  /**
   * getStyleClassObject() used to get style class object
   */

  getStyleClassObject() {
    this.tile.products.map((data: any) => {
      var isActive = this.selectedProduct.product_id === data.product_id && "active" || "";
      data.swatchColor = data.color.trim().toLowerCase().split(' ').join('-').replace("-&", "") + " " + isActive;
      return data;
    });
  }

  /**
   * addSelectedProduct() used to add product into cart/bag
   */

  addSelectedProduct() {
    let data: any = {
      selectedProduct: this.selectedProduct,
      tile: this.tile
    };
    // this._productService.setProductDetailsData(data).then(()=> {
    //   this.onProductSelected.emit(this.selectedProduct);
    // }, error=> {/*console.log('Error: ', error)*/
    // });
  }

  /**
   * updateProductDetailsData() used to update product detail
   */

  private updateProductDetailsData() {
    let _collection = TenantConstant.COLLECTIONS.find((collection) => collection.slug === this.slug);
    let _slug = _collection && _collection.slug || '';
    this.productDetailsRoute = ('/' + (_slug ? (_slug + '-') : '') + (this.selectedProduct.slug ? (this.selectedProduct.slug + '-') : (this.selectedProduct.name.split(' ').join('-') + '-' + this.selectedProduct.color.split(' ').join('-') + '-')) + this.selectedProduct.product_id ).replace('&', 'and');
    this.product_image_url = this._ProductService.getProductImageUrl(this.selectedProduct);
    this.isEyeWear = !(_slug.toLowerCase().indexOf('sunwear') > -1 || _slug.toLowerCase().indexOf('sunglass') > -1);
    this.selectedProduct.productDetailsRoute = this.productDetailsRoute;
  }

  /**
   * Check product quantity
   */

  addToBagModel() {

    this._cartService.isIteamLimitExceed(this.selectedProduct.product_id);
    this._messageService.setMessage("To order more than 5 pairs, please call us at 888-509-5499");

    let sub: any = this._cartService.haveProductLimitExceed$.subscribe(
      data => {
        if (data) {
          this.modalId = "limitModal";
        } else {
          this.modalId = "myModal";
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
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }
}
