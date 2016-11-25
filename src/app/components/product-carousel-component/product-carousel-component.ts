/**
 * Importing core components
 */

import {Component, OnInit, Input, ElementRef, OnChanges, EventEmitter, Output, OnDestroy} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from "@angular/router";
import {SelectLenseModal} from "../select-lense-modal-component";
import {ProductTileComponent} from "../product-tile-component";
import {ProductService} from "../../services";


/**
 * Global level variable "jQuery"
 */

declare var jQuery: any;

/**
 * @Component for product-carousel-component
 */

@Component({
  selector: 'product-carousel',
  templateUrl: 'product-carousel-component.html',
  styleUrls: ['product-carousel-component.scss'],
  directives: [ROUTER_DIRECTIVES, ProductTileComponent, SelectLenseModal]
})

/**
 * Exporting class (ProductCarouselComponent) from product-carousel-component
 */

export class ProductCarouselComponent implements OnInit, OnChanges, OnDestroy {
  @Output() onProductChanged = new EventEmitter<boolean>();

  tab: any = null;
  error: string = '';
  selectedProduct: any = null;
  isLoadingProducts: boolean = false;
  owlCarousel: any = null;
  productDetailsRoute: string = '';
  protected defaultCarouselOptions: any = {
    items: 4,
    loop: true,
    nav: true,
    dots: false,
    responsive: {
      0: {
        items: 2,
        nav: false,
        dots: false,
        margin: 5
      },
      768: {
        dots: false,
        nav: true,
        items: 3
      },
      1024: {
        dots: false,
        nav: true,
        items: 3,

      },
      1025: {
        dots: false,
        nav: true,
        items: 4
      }
    }
  };
  productTiles:any = null;
  active:any = null;

  @Input() gender: string;
  @Input() slug: string;
  @Input() title: string;
  @Input() carouselOptions: any;
  @Input() tabs: any = null;
  @Input() carouselId: string;
  @Input() modalId: string;
  @Input() imagesData: any;
  @Input() productsData: any;
  @Input() showBuyButton: boolean = true;
  @Input() createProdLink: boolean = true;

  /**
   * constructor() used to initialize class level variables
   * @param  _ProductService
   * @param elementRef
   */

  constructor(protected elementRef: ElementRef, protected _ProductService: ProductService, protected _route: ActivatedRoute, protected router: Router) {
    this.assignRoutesProperty();
  }


  /**
   * ngOnInit function
   */

  ngOnInit() {
    // this.tab = this.tabs && this.tabs[0] || '';
    // this.active = {0: true};
    if (this.productsData)
      this.initializeProductData();
    else if (!this.imagesData && this.slug)
      this.getProducts({collectionName: this.slug});
  }

  assignRoutesProperty() {
    if (this._route.snapshot.data) {
      this.carouselId = this._route.snapshot.data["carouselId"];
      this.gender = this._route.snapshot.data["gender"];
      this.modalId = this._route.snapshot.data["modalId"];
      this.slug = this._route.snapshot.data["slug"];
      this.title = this._route.snapshot.data["title"];
    }
  }

  /**
   * ngOnDestroy() used to destroy carousel
   */

  ngOnDestroy() {
    this.destroyCarousel()
  }

  /**
   * ngOnChanges() used to detect changes
   */

  ngOnChanges(changes) {
    this.isLoadingProducts = true;
    if (this.owlCarousel)
      this.destroyCarousel();
    this.initializeProductData();
  }

  /**
   * changetab() used to change a name for a tab
   * @param tab
   */

  changeTab(tab, index) {
    this.tab = tab || '';
    index = index || 0;
    this.active = {};
    this.active[index] = true;
    this.isLoadingProducts = true;
    this.productTiles = null;
    if (this.owlCarousel && this.owlCarousel.data('owlCarousel'))
      this.destroyCarousel();

    this.initializeProductData();
  }

  /**
   * initialiseCarousel() used to initialise the carousel
   */

  initialiseCarousel(tabChanged) {
    let sel = '#' + this.carouselId + ' .owl-carousel';
    setTimeout(() => {
      this.isLoadingProducts = false;

      //Show & hide navigation
      if (this.carouselOptions && this.productTiles && this.productTiles.length <= this.carouselOptions.responsive[1025].items || this.defaultCarouselOptions && this.productTiles && this.productTiles.length <= this.defaultCarouselOptions.responsive[1025].items)
        this.defaultCarouselOptions.responsive[1025].nav = false;


      jQuery(this.elementRef.nativeElement).find('#' + this.carouselId + ' li.product-hidden').remove();
      this.owlCarousel = jQuery(this.elementRef.nativeElement).find(sel).owlCarousel(this.carouselOptions || this.defaultCarouselOptions);

      //Resize window for carousel
      if (tabChanged)
        window.dispatchEvent(new Event('resize'));
    }, 5);
  }

  /**
   * destroyCarousel() used to destroy carousel
   */

  destroyCarousel() {
    this.owlCarousel && this.owlCarousel.trigger('destroy.owl.carousel').find('.owl-stage-outer').remove();
  }

  /**
   * onProductSelected() used to navigate on Product Detail Page
   * @param _product
   */

  onProductSelected(_product) {
    this.selectedProduct = JSON.parse(JSON.stringify(_product));
    this.productDetailsRoute = ('/' + (this.selectedProduct.slug ? (this.selectedProduct.slug + '-') :
      (this.selectedProduct.name.split(' ').join('-') + '-' + this.selectedProduct.color.split(' ').join('-') + '-')) + this.selectedProduct.product_id );
    this.selectedProduct.productDetailsRoute = this.productDetailsRoute;
    this.onProductChanged.emit(this.selectedProduct);
  }

  /**
   * getNewReleasesProducts() used to fetch the new releases products form DB
   * @param obj
   */

  getProducts(obj) {
    this.isLoadingProducts = true;
    this._ProductService.getProductCollectionData(obj)
    .then(products=> {
      this.productsData = products;
      this.initializeProductData();
      this.isLoadingProducts = false;
    }, error=> {
      this.error = error;
      this.isLoadingProducts = false;
    });
  }

  initializeProductData() {
    if (this.productsData) {
      this.productTiles = this.productsData.tiles;
    } else
      this.productTiles = null;

    this.isLoadingProducts = false;
    this.initialiseCarousel(true);
    this.onProductChanged.emit(this.selectedProduct);
  }
}
