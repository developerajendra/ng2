import {Injectable} from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import {Subject} from "rxjs/Rx";
import "rxjs/add/operator/map";
import {AppConstants} from "../constants/app-constants";
import {TenantConstant} from "../constants/tenant";
import {StorageService} from "./storage.service";
import {Utils} from "../shared/utils";

/**
 * @Injectable for product.service
 */
@Injectable()

/**
 * Exporting class (ProductService) for product.service
 */
export class ProductService {

  private _productDetailsData$: Subject<any>;

  /**
   * constructor() used to initialize class level variables
   * @param _http
   */

  constructor(protected _http: Http, protected _storageService: StorageService, protected _utils: Utils) {
    this._productDetailsData$ = <Subject<any>>new Subject();
  }

  get productDetailsData$() {
    return this._productDetailsData$.asObservable();
  }

  /**
   * getProducts() used get the list of products
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */
  getProducts() {
    // var _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/products/?key=' + TenantConstant.API_KEY;
    var _path: string = this._utils.makeAPIURL('/products/');//?key=' + TenantConstant.API_KEY;
    return this._http.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  /**
   * getDittoProducts() used get the list of products
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */
  getDittoProducts() {
    return new Promise((resolve, reject) => {
      let dittoProducts: any = null;
      try {
        dittoProducts = this._storageService.getItem(AppConstants.DITTO_PRODUCTS, null);
      } catch (e) {
        dittoProducts = null;
      }
      if (!dittoProducts) {
        var _path: string = TenantConstant.DITTO_API_URL + TenantConstant.DITTO_API_VERSION + '/products/';
        this._http.get(_path)
        .toPromise()
        .catch(this.handleError)
        .then((data: any) => {
          let _data = data.json();
          this._storageService.setItem(AppConstants.DITTO_PRODUCTS, _data.ids);
          resolve(_data.ids);
        }, error => {
          reject(error);
        })
      } else {
        resolve(dittoProducts);
      }
    })
  }

  /**
   * getProductDetails() used get the detail for a particular product via id
   * @param id
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  getProductDetails(id) {
    // var _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/products/?key=' + TenantConstant.API_KEY + '&product_id=' + id;
    var _path: string = this._utils.makeAPIURL('/products/') + '&product_id=' + id;
    return this._http.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  getProductData(product_id: string, collection_name?: string) {
    if (collection_name && collection_name.length > 0) {
      let collection = this.getProductCollectionData({collectionName: collection_name});
      var tiles = null;
      if (collection) {
        tiles = this._getTilesForProduct(collection, product_id);
        var product = null;
        if (tiles) {
          product = tiles.products.filter(product => {
            if (product.product_id == product_id) return true;
          });
          if (product && product.length > 0) {
            return {
              selectedProduct: new Promise((resolve, reject) => {
                resolve(product);
              }), tiles: tiles
            };
          }
        }
      }
      return {selectedProduct: this.getProductDetails(product_id), tiles: null};
    }
    let cached_collections = this._getCachedCollectionNames();
    for (let collection_name of cached_collections) {
      let collection = this._getCollectionFromCache(collection_name) || null;
      if (!collection) continue;
      collection = collection.data;
      tiles = this._getTilesForProduct(collection, product_id);
      var product = null;
      if (tiles && tiles.length > 0) {
        product = tiles[0].products.filter(product => {
          if (product.product_id == product_id) return true;
        });
        if (product && product.length > 0) {
          return {
            selectedProduct: new Promise((resolve, reject) => {
              resolve(product);
            }), tiles: tiles
          };
        }
      }
    }

    return {selectedProduct: this.getProductDetails(product_id), tiles: null};
  }

  _getTilesForProduct(collection: any, product_id: string): any {
    var tiles = collection.tiles && collection.tiles.filter(tile => {
      for (let product of tile.products) {
        if (product.product_id == product_id) return true;
      }
      return false;
    });
    return tiles;
  }


  /**
   * getProductCollections() used get the slug/collection name for products
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */
  getProductCollections() {
    // var _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/products/collections/?key=' + TenantConstant.API_KEY;
    var _path: string = this._utils.makeAPIURL('/products/collections/');//?key=' + TenantConstant.API_KEY;
    return this._http.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  /**
   * getProductCollectionData() used to get the products details via collection name
   * @param filterObject
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  getProductCollectionData(filterObject): Promise<any> {
    return new Promise((resolve, reject) => {
      let _path: string = '', cacheData = this._getCollectionFromCache(filterObject.collectionName),
        cacheDataTags = this._storageService.getItem(AppConstants.FILTER_LOCALSTORAGE);

      if (cacheDataTags && cacheDataTags.data && (cacheDataTags.expires > +new Date())) {
        filterObject.tags = cacheDataTags.data;
      }

      //do filtering on basis of tags here
      if (filterObject.tags && filterObject.tags.length)
        return resolve(this.filterProductsFromTags(cacheData.data, filterObject.tags));
      else if (cacheData && cacheData.data)
        return resolve(cacheData.data);

      _path = this._utils.makeAPIURL('/products/collections/') + '&collection=' + filterObject.collectionName;

      this._http.get(_path)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError)
      .then((data: any) => {
        data && data.tiles && data.tiles.map(tile => {
          tile.products = tile.products.filter((product) => {
            return product.tags.indexOf('hidden') === -1;
          });
        });
        if (!(filterObject.tags && filterObject.tags.length)) {
          this._cacheCollection(filterObject.collectionName, data);
        }
        resolve(data);
      }, error => reject(error));
    });
  }

  _cacheCollection(collection_name: string, data: any) {
    let _date = new Date();
    let cacheData = {data: data, expires: +(_date.setHours(_date.getHours() + +AppConstants.CACHE_DURATION))};
    this._storageService.setItem(collection_name, JSON.stringify(cacheData));

    var cached_collections = this._getCachedCollectionNames();
    if (cached_collections.indexOf(collection_name) < 0) {
      cached_collections.push(collection_name);
      this._storageService.setItem(AppConstants.CACHED_COLLECTIONS, JSON.stringify(cached_collections));
    }
  }

  _getCollectionFromCache(collection_name: string): any {
    let cacheData = this._storageService.getItem(collection_name);
    if (!cacheData || !cacheData.hasOwnProperty('data')) return null;
    let _date = new Date();
    if (cacheData.hasOwnProperty('expires') && +cacheData.expires < +_date) {
      this._storageService.removeItem(collection_name);
      var cached_collections = this._getCachedCollectionNames();
      if (cached_collections && cached_collections .indexOf(collection_name) < -1) {
        cached_collections.removeItem(collection_name);
        this._storageService.setItem(AppConstants.CACHED_COLLECTIONS, JSON.stringify(cached_collections));
      }
      return null;
    }

    return cacheData;
  }

  _getCachedCollectionNames(): any {
    return this._storageService.getItem(AppConstants.CACHED_COLLECTIONS, []) || [];
  }

  /**
   * getProductTags() used to get tags provide into a product
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */
  getProductTags() {
    // var _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/products/tags/?key=' + TenantConstant.API_KEY;
    var _path: string = this._utils.makeAPIURL('/products/tags/');
    return this._http.get(_path)
    .toPromise()
    .then(this.makeTagFilterArray)
    .catch(this.handleError);
  }

  /**
   * filterProductsFromTags() used to get tags provide into a product
   * @returns {Object}
   */
  private filterProductsFromTags(products, tags) {
    products.tiles.map(tile => {
      tile.products = tile.products.filter((product) => {
        let hasMatch = false;
        tags.forEach((tag) => {
          hasMatch = hasMatch || (product.tags.indexOf(tag) !== -1)
        });
        return hasMatch;
      });
    });
    return products;
  }

  /**
   * getProductImageUrl() used to get the product image url
   * @param _product
   * @returns {any|string}
   */

  getProductImageUrl(_product: any) {
    if (!_product) return 'assets/images/default_eyewear.jpg';
    if (_product.sunwear === "1") {
      return (_product && _product.assets['front-sunwear-thumb'] && _product.assets['front-sunwear-thumb'][0].https_url) || 'assets/images/default_eyewear.jpg';
    } else {
      return (_product && _product.assets && _product.assets['product-eyewear-detail-thumbs'] && _product.assets['product-eyewear-detail-thumbs'][0].https_url) || _product.gridImage || 'assets/images/default_eyewear.jpg';
    }
  }


  /**
   * makeTagFilterArray function
   * @param res
   * @returns {{color: Array, faceshape: Array, facewidth: Array, lens: Array, related: Array, sun-lens-color: Array}}
   */

  private makeTagFilterArray(res: Response) {
    let body = res.json();
    let tags = body.data;
    let tagFilterArray = [];
    tagFilterArray = [].concat(TenantConstant.FILTERS);
    for (let i = 0; i < tagFilterArray.length; i++) { // used to reset the AppConstant.FILTER value and selected when data is set through the api hit
      tagFilterArray[i].value = [];
      tagFilterArray[i].selected = [];
    }
    tags.forEach((tag) => {
      tagFilterArray.forEach((tagFilter, index) => {
        if (tag.match(new RegExp('^' + tagFilter.name, 'i'))) {
          tagFilterArray[index].value.push({
            text: tag.replace(tagFilter.name + "-", ""),
            value: tag,
            checked: false,
            name: tagFilter.name
          })
        }
      });
    });
    return tagFilterArray;
  }

  /**
   * getProductAssetGroups()
   */
  getProductAssetGroups() {
  }

  /**
   * extractData() used to extract data from response
   * @param res
   * @returns {Uint8ClampedArray|ArrayBuffer|string|any|{}}
   */

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  /**
   * handleError() used to handle errors through appropriate messages
   * @param error
   * @returns {ErrorObservable}
   */

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Promise.reject(errMsg);
  }

  /**
   * referToFriend() used to get the product data
   * @returns {any}
   */

  referToFriend(data): Promise<any> {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/refer?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/refer'),
      body: string = JSON.stringify({
        "referral": {
          "email": data.refree_email,
          "first_name": data.refree_first_name,
          "last_name": data.refree_last_name
        },
        "refree": {
          "email": data.referral_email,
          "first_name": data.referral_first_name,
          "last_name": data.referral_last_name,
        },
        "mail": {
          "subject": data.subject,
          "mail_body": data.mail_body,
        },
        "product_id": data.product_id
      }),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});

    return this._http.post(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  public getProductSlug(product: any): string {
    let retVal: string = ('/' + (product.slug ? (product.slug + '-') : (product.name.split(' ').join('-') + '-' + product.color.split(' ').join('-') + '-'))
    + product.product_id ).replace('&', 'and');
    return retVal;
  }
}
