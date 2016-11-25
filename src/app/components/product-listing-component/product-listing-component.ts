/**
 * Importing core components
 */

import {Component, OnInit, Input, OnDestroy} from "@angular/core";
import {ROUTER_DIRECTIVES, ActivatedRoute, Router} from "@angular/router";
import {MetaService} from "ng2-meta";
import {ProductService, StorageService} from "../../services";
import {ProductTileComponent} from "../product-tile-component";
import {ProductMusthaveTileComponent} from "../product-must-have-tile-component";
import {DescriptionComponent} from "../description-component";
import {SelectLenseModal} from "../select-lense-modal-component";
import {BannerComponent} from "../banner-component";
import {AppConstants} from "../../constants/app-constants";
import {TenantConstant} from "../../constants/tenant";
import {Title} from "@angular/platform-browser";


declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for product-listing-component
 */

@Component({
  moduleId: module.id,
  selector: 'product-listing',
  templateUrl: 'product-listing-component.html',
  styleUrls: ['product-listing-component.css'],
  directives: [ROUTER_DIRECTIVES, BannerComponent, ProductTileComponent, ProductMusthaveTileComponent, SelectLenseModal, DescriptionComponent]
})

/**
 * Exporting class (ProductListingComponent) from product-listing-component
 */

export class ProductListingComponent implements OnInit, OnDestroy {
  @Input() tileCollection: any = null;
  @Input() expandTiles: boolean = false;
  @Input() showFilters: boolean = true;
  @Input() showLargeTile: boolean = true;

  error: string = '';
  isLoadingCollectionData: boolean = false;
  productTag: any = [];
  selectedProduct: any = null;
  productDetailsRoute: string = '';
  filterObject: any = {
    collectionName: '',
    tags: []
  };
  filters: string = '';
  slug: string = '';
  filterBy: string;
  isSlug:any = false;
  productsData: any = null;
  masterProductsData: any = null;
  private subs: any = [];
  heroBannerSource: string = '';
  specialImageTile: string = '';
  specialProductUrl: any = [];

  /**
   * constructor() used to initialize class level variables
   * @param _route
   * @param router
   * @param _ProductService
   */

  constructor(protected _route: ActivatedRoute, protected router: Router, protected _ProductService: ProductService,
              protected _storageService: StorageService, protected metaService: MetaService, protected _title: Title) {
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    window.scrollTo(0, 0);
    this.handleComponentData();
    let href = window.location.href;
    this.filterObject.collectionName = this.tileCollection;
    let sub = this._route.params.subscribe(params => {
      if (params['name'] && (!this.filterObject.collectionName || this.filterObject.collectionName !== params['name'])) {
        this.filterObject.collectionName = params['name'];
      }
      if (!this.filterObject.collectionName) {
        this.router.navigateByUrl('/404');
        return;
      }
      this.filterBy = this.filterBy || "eyeglasses";
      this.getSlug();
      this.makeQueryString();
      this.getProductTag((err, data) => {
        if (data)
          this.setProductTag(href);
      });
      this.getProducts(this.filterObject);
    });
    this.subs.push(sub);
    if (this.showLargeTile)
      this.getSpecialProduct();
  }

  handleComponentData() {
    let sub = this._route.data.subscribe(data => {
      if (data.hasOwnProperty('expandTiles')) this.expandTiles = data['expandTiles'];
      if (data.hasOwnProperty('showFilters')) this.showFilters = data['showFilters'];
      if (data.hasOwnProperty('showLargeTile')) this.showLargeTile = data['showLargeTile'];
    });
    this.subs.push(sub);
  }


  /**
   * ngOnDestroy function
   */
  ngOnDestroy() {
    this.subs.forEach((sub: any)=> sub.unsubscribe());
    this.filterBy = '';
  }

  /**
   * getProducts() used to get products form DB
   * @param obj contains tags and collection name
   */

  getProducts(obj) {
    this.productsData = null;
    this.isLoadingCollectionData = true;
    this._ProductService.getProductCollectionData(obj)
    .then(productsData=> {
      this.masterProductsData = this.doExpandTiles(productsData);
      this.productsData = this.filterTile(this.masterProductsData);

      this.setMetaTags();
      this.isLoadingCollectionData = false;
      changeStatus();
    }, error=> {
      this.error = error;
      this.isLoadingCollectionData = false;
      changeStatus();
    });
  }

  doExpandTiles(productsData: any) {
    if (!this.expandTiles || !productsData || !productsData.hasOwnProperty('tiles') || productsData.tiles.length < 1) return productsData;
    var tiles = productsData.tiles;
    var updatedTiles = [];
    for (let tile of tiles) {
      for (let product of tile.products) {
        var updatedTile = JSON.parse(JSON.stringify(tile));
        updatedTile['products'] = [product];
        updatedTiles.push(updatedTile);
      }
    }
    productsData['tiles'] = updatedTiles;
    return productsData;
  }

  /**
   * getProductTag() used to get product filtration tags
   */

  getProductTag(callback) {
    let cacheFilterData = this._storageService.getItem(AppConstants.TAG_LOCALSTORAGE);
    if (cacheFilterData && cacheFilterData.data && cacheFilterData.expires > +new Date()) {
      this.productTag = cacheFilterData.data;
      this.getProducts(this.filterObject);
      return callback(null, true);
    }
    this._ProductService.getProductTags().then(
      tags=> {
        this.productTag = tags;
        this.setLocalStorage(this.productTag, AppConstants.TAG_LOCALSTORAGE);
        return callback(null, true);
      },
      error=> {
        this.error = error;
        return callback(new Error(error), null);
      });
  }

  /**
   * setLocalStorage() used to set localStorage for Caching
   * @param data
   * @param name
   */

  setLocalStorage(data, name) {
    this.removeLocalStorage(name);
    let _date = new Date();
    let cacheFilterData = {data: data, expires: +(_date.setHours(_date.getHours() + 24))};
    this._storageService.setItem(name, JSON.stringify(cacheFilterData));
  }

  /**
   * removeLocalStorage() used to remove localStorage
   * @param name
   */

  removeLocalStorage(name) {
    this._storageService.removeItem(name);
  }

  /**
   * setProductTag() used to set the filtration tag
   */

  setProductTag(href) {

    let cacheData = this._storageService.getItem(this.filterObject.TAG_LOCALSTORAGE);
    let cacheDataTags = this._storageService.getItem(AppConstants.FILTER_LOCALSTORAGE);
    let filterString = '';
    let collectionName = '';
    let split_amp: any = [];
    let split_equal: any = [];
    filterString = href;

    if (cacheDataTags && cacheDataTags.data && cacheDataTags.expires > +new Date()) {
      this.filterObject.tags = cacheDataTags.data;
    }

    if (cacheData && cacheData.data && cacheData.expires > +new Date()) {
      this.productTag = cacheData.data;
    }

    collectionName = filterString.substring(filterString.lastIndexOf('/') + 1, filterString.lastIndexOf('?'));
    filterString = filterString.replace(filterString.substring(0, filterString.lastIndexOf('?')), "");
    if (filterString.charAt(0) === '?' && collectionName === this.filterObject.collectionName) {
      filterString = filterString.replace('?', "")
      split_amp = filterString.split('&');
      this.filterObject.tags = [];
      split_amp.forEach((elem) => {
        let key = elem.split('=')[0];
        let value = elem.split('=')[1];
        this.productTag.forEach((element) => {
          if (key === element.name) {
            element.selected = value.split(',');
            element.selected.forEach((selectedTag) => {
              this.filterObject.tags.push(key + '-' + selectedTag);
            });
            element.value.forEach((valueObj) => {
              valueObj.checked = (element.selected.indexOf(valueObj.text) > -1);
            });
          }
        });
      });
      this.setLocalStorage(this.filterObject.tags, AppConstants.FILTER_LOCALSTORAGE);
      this.setLocalStorage(this.productTag, AppConstants.TAG_LOCALSTORAGE);
    }
    else {
      this.filterObject.tags = [];
      this.productTag.forEach((filter) => {
        filter.selected = [];

        filter.value.forEach((tag) => {
          tag.checked = false;
        });
      });
      this.setLocalStorage(this.filterObject.tags, AppConstants.FILTER_LOCALSTORAGE);
      this.setLocalStorage(this.productTag, AppConstants.TAG_LOCALSTORAGE);
    }
    this.makeQueryString();
  }

  /**
   * onProductSelected() used to navigate to Product Detail Page
   * @param _product
   */

  onProductSelected(_product) {
    this.selectedProduct = JSON.parse(JSON.stringify(_product));
    let _collection = TenantConstant.COLLECTIONS.find((collection)=> {
      return collection.slug.trim() === this.slug.trim();
    });
    this.productDetailsRoute = ('/' + (this.selectedProduct.slug ? (this.selectedProduct.slug + '-') : (this.selectedProduct.name.split(' ').join('-') + '-' + this.selectedProduct.color.split(' ').join('-') + '-')) + this.selectedProduct.product_id );
    this.selectedProduct.productDetailsRoute = this.productDetailsRoute;
  }

  /**
   * selectedFilter function deals with the managing checking and un-checking of check-boxes
   * and hitting the API for getting the desired result according to the filters selected
   * @param tag
   */

  selectedFilter(tag) {
    let cacheFilterData = this._storageService.getItem(AppConstants.FILTER_LOCALSTORAGE);
    if (cacheFilterData && cacheFilterData.data && cacheFilterData.expires > +new Date()) {
      this.filterObject.tags = cacheFilterData.data;
      if (this.filterObject.tags.indexOf(tag.value) > -1) {
        tag.checked = false;
        this.filterObject.tags.splice(this.filterObject.tags.indexOf(tag.value), 1);
        this.productTag.forEach(function (filter) {
          if (filter.name === tag.name) {
            filter.selected.splice(filter.selected.indexOf(tag.text), 1);
          }
        })
      }
      else {
        tag.checked = true;
        this.filterObject.tags.push(tag.value);
        this.productTag.forEach(function (filter) {
          if (filter.name === tag.name) {
            filter.selected.push(tag.text);
          }
        })
      }
      this.setLocalStorage(this.filterObject.tags, AppConstants.FILTER_LOCALSTORAGE);
      this.setLocalStorage(this.productTag, AppConstants.TAG_LOCALSTORAGE);
    }
    else {
      if (this.filterObject.tags.indexOf(tag.value) > -1) {
        tag.checked = false;
        this.filterObject.tags.splice(this.filterObject.tags.indexOf(tag.value), 1);
        this.productTag.forEach(function (filter) {
          if (filter.name === tag.name) {
            filter.selected.splice(filter.selected.indexOf(tag.text), 1);
          }
        })
      }
      else {
        tag.checked = true;
        this.filterObject.tags.push(tag.value);
        this.productTag.forEach(function (filter) {
          if (filter.name === tag.name) {
            filter.selected.push(tag.text);
          }
        })
      }
      this.setLocalStorage(this.filterObject.tags, AppConstants.FILTER_LOCALSTORAGE);
      this.setLocalStorage(this.productTag, AppConstants.TAG_LOCALSTORAGE);
    }
    this.makeQueryString();
    this.getProducts(this.filterObject);
  }

  /**
   * clearAll() used to clear all the selected filters
   */

  clearAll() {
    let newurl: string = '';
    if (this.filterObject.tags.length) {
      this.filterObject.tags = [];
      this.removeLocalStorage(AppConstants.TAG_LOCALSTORAGE);
      this.removeLocalStorage(AppConstants.FILTER_LOCALSTORAGE);
      if (history.pushState) {
        newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: newurl}, '', newurl);
      }
      this.getProducts(this.filterObject);
      this.getProductTag(function (err, flag) {
      });
    }
  }

  /**
   * makeQueryString function used to make query string, which appends in the URL when filtration happens.
   */

  makeQueryString() {
    let query: string = '';
    let newurl: string = '';
    let tag: string = '';
    this.productTag.forEach(function (elem) {
      tag = '';
      if (elem.selected.length) {
        if (query === '') {
          tag = '?' + elem.name + '=';
        } else {
          tag = '&' + elem.name + '=';
        }
        elem.selected.forEach(function (selectedValue, cursor) {
          if (cursor === 0) {
            tag = tag + selectedValue;
          } else {
            tag = tag + ',' + selectedValue;
          }
        })
      }
      query = query + tag;
    });
    if (history.pushState) {
      newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      newurl = newurl + query;
      window.history.replaceState({path: newurl}, '', newurl);
    }
  }

  changeFilter(value) {
    this.productsData = null;
    this.filterBy = value;
    this.getSlug();
    this.productsData = this.filterTile(this.masterProductsData);
  }

  private getSlug() {
    switch (this.filterObject.collectionName) {
      case 'womens-sunglasses':
        this.slug = 'womens-sunglasses';
        this.filterBy = "";
        this.isSlug = true;
        break;
      case 'womens-eyeglasses':
        this.slug = 'womens-eyeglasses';
        this.filterBy = "";
        this.isSlug = true;
        break;
      default :
        this.isSlug = false;
        (this.filterBy === "eyeglasses")
          ? this.slug = 'womens-eyeglasses'
          : this.slug = 'womens-sunglasses';
        break;
    }
  }

  private filterTile(productsData) {

    let _productsData: any = JSON.parse(JSON.stringify(productsData));
    _productsData.tiles.map((item: any)=> {
      item.products = item.products.filter((product: any)=> {
        return product;
        // return !!(product.variants[TenantConstant.variants[this.slug]]);
      })
    });
    _productsData.tiles = _productsData.tiles.filter((tile: any)=> {
      return (tile.products.length > 0);
    });
    return _productsData;
  }

  /**
   * setMetaTags() used to get metatags form DB
   *
   */

  setMetaTags() {
    // this.metaService.setTitle('tesgting')//TenantConstant.DOMAIN_NAME+ ' | ' + this.productsData.h2);
    if (this.productsData && this.productsData.metaDescription) this.metaService.setTag('description', this.productsData.metaDescription);
    if (this.productsData && this.productsData.metaKeywords) this.metaService.setTag('keywords', this.productsData.metaKeywords);
    this.metaService.setTag('og:title', this.productsData.name);
    this._title.setTitle(this.productsData.name);
  }

  /**
   * getSpecialProduct() used to get special product urls
   *
   */
  getSpecialProduct() {
    this.specialProductUrl = TenantConstant.SPECIAL_PRODUCT.map((specialProduct)=> {
      if (specialProduct.collection_name == this.filterObject.collectionName) {
        return specialProduct.redirect_url;
      }
    });
  }
}
