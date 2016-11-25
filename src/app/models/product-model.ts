import {ProductService} from "../services/product.service";
import {Observable, Subject} from "rxjs/Rx";

export class ProductModel {
  static DEFAULT_IMAGE: string = 'assets/images/default_eyewear.jpg';

  private _images: any = null;
  private _thumbImages: any = null;
  public isEyeWear: boolean = true;
  private _tiles: any = null;
  hasHTK: boolean = true;
  public isProductDigitized: boolean = false;
  public dittoProductId: string = null;
  private _data$: Subject<any>;
  gridImageUrl:string = '';
  gridAltImageUrl:string = '';
  productStrData:string = '';
  productSuffixData:string = '';
  hasNewTagsData:any = null;
  nameData:string = '';
  descriptionData:string = '';
  colorData:string = '';
  pricesData:any = null;
  measurementsData:any = null;
  hiddenTag:boolean = false;

  constructor(protected _productService: ProductService, public productId: string, protected _data: any = null) {
    this._data$ = <Subject<any>>new Subject();
    if (_data) this.setData(_data);
    else this.initProduct();

     this.gridImageUrl = this.gridImage;
     this.gridAltImageUrl = this.gridAltImage;
     this.productStrData = this.productStr;
     this.productSuffixData = this.productSuffix;
     this.hasNewTagsData = this.hasNewTags;
     this.nameData = this.name;
     this.descriptionData = this.description;
     this.colorData = this.color;
     this.pricesData = this.prices;
     this.measurementsData = this.measurements;
     this.hiddenTag = this.hasHiddenTags;
  }

  public get productURL(): string {
    return '/' + this.productSlug + "-" + this.productId;
  }

  public get data(): Observable<any> {
    return this._data$.asObservable();
  }

  public setData(data: any) {
    this._data = data;

    this.gridImageUrl = null;
    this.gridAltImageUrl = null;

    this.initProduct();
    this._data$.next(data);
  }

  protected initProduct() {
    if (!this._data) {
      let data = this._productService.getProductData(this.productId);
      if (data.tiles && data.tiles.length > 0) {
        this._tiles = data.tiles[0];
        this.initSwatchColors();
      }
      data.selectedProduct.then(productArr=> {
        this._data = productArr[0];
        this.isEyeWear = (this._data.sunwear !== "1");
        if (this._data.hasOwnProperty("tags") && this._data.tags)
          this.hasHTK = this.isEyeWear && (this._data.tags.indexOf("htk-off") < 0);
        this.initDigitized();
        this._data$.next(data);
      }, e => {
      });
      return;
    }
    this.isEyeWear = (this._data.sunwear !== "1");
    this.initSwatchColors();
    this.initDigitized();
    if (this._data.hasOwnProperty("tags") && this._data.tags)
      this.hasHTK = this.isEyeWear && (this._data.tags.indexOf("htk-off") < 0);
  }

  public set tiles(tiles: any) {
    this._tiles = tiles;
    this.initSwatchColors();
  }

  public get tiles() {
    return this._tiles;
  }

  public get images() {
    this.initImages();
    return this._images;
  }

  public get thumbImages() {
    this.initImages();
    return this._thumbImages;
  }

  protected initImages() {
    if (this._images && this._thumbImages) return;
    if (!this._data)
      return;
    this._images = [];
    this._thumbImages = [];
    let sunEye = this.isEyeWear ? "eyewear" : "sunwear";
    var key: string = "product-" + sunEye + "-carousel";
    var imagesObj = this.getImagesForKey(key);
    if (imagesObj.images && imagesObj.images.length > 0) {
      this._images = this._images.concat(imagesObj.images);
      this._thumbImages = this._thumbImages.concat(imagesObj.thumbImages);
    }

    key = "product-fit";
    imagesObj = this.getImagesForKey(key);
    if (imagesObj.images && imagesObj.images.length > 0) {
      this._images = this._images.concat(imagesObj.images);
      this._thumbImages = this._thumbImages.concat(imagesObj.thumbImages);
    }

    key = "product-" + sunEye + "-detail";
    imagesObj = this.getImagesForKey(key);
    if (imagesObj.images && imagesObj.images.length > 0) {
      this._images = this._images.concat(imagesObj.images);
      this._thumbImages = this._thumbImages.concat(imagesObj.thumbImages);
    }
  }

  protected getImagesForKey(assetKey: string) {
    var retVal = {images: [], thumbImages: []};
    if (!this._data || !this._data.hasOwnProperty('assets') || !this._data.assets) return retVal;

    var images = [];
    if (!this._data.assets.hasOwnProperty(assetKey) || !this._data.assets[assetKey]) return retVal;
    if (Array.isArray(this._data.assets[assetKey])) {
      for (let asset of this._data.assets[assetKey]) {
        if (asset.hasOwnProperty('https_url') && asset.https_url) images.push(asset.https_url);
        else if (asset.hasOwnProperty('http_url') && asset.http_url) images.push(asset.http_url);
      }
    }

    assetKey += '-thumbs';
    var thumbImages = [];
    if (!this._data.assets.hasOwnProperty(assetKey) || !this._data.assets[assetKey]) {
      retVal['images'] = images;
      retVal['thumbImages'] = images;
      return retVal;
    }
    if (Array.isArray(this._data.assets[assetKey])) {
      for (let asset of this._data.assets[assetKey]) {
        if (asset.hasOwnProperty('https_url') && asset.https_url) thumbImages.push(asset.https_url);
        else if (asset.hasOwnProperty('http_url') && asset.http_url) thumbImages.push(asset.http_url);
      }
    }
    if (thumbImages.length < images.length) {
      thumbImages = thumbImages.concat(images.slice(thumbImages.length));
    }

    retVal['images'] = images;
    retVal['thumbImages'] = thumbImages;
    return retVal;
  }

  public get productSuffix(): string {
    return this.isEyeWear ? " Glasses" : " Sunglasses";
  }

  public get hasNewTags(): boolean {
    if (this.hasNewTagsData) return this.hasNewTagsData;
    this.hasNewTagsData = this._data && this._data.hasOwnProperty("tags") && this._data.tags && this._data.tags.includes("related-a") ? true : false;
    return this.hasNewTagsData;
  }

  public get hasHiddenTags(): boolean {
    return this._data && this._data.hasOwnProperty("tags") && this._data.tags && this._data.tags.includes("hidden") ? true : false;
  }

  public get gridImage(): string {
    if (this.gridImageUrl && this.gridImageUrl.indexOf('default_eyewear')<0) return this.gridImageUrl;

    if (!this._data) return ProductModel.DEFAULT_IMAGE;
    var assetKey: string = "grid-" + (this.isEyeWear ? "eyewear" : "sunwear") + "-front";
    if (this._data && this._data.hasOwnProperty('assets') && this._data.assets && this._data.assets.hasOwnProperty(assetKey) && this._data.assets[assetKey]) {
      if (Array.isArray(this._data.assets[assetKey])) {
        for (let asset of this._data.assets[assetKey]) {
          if (asset.hasOwnProperty("https_url") && asset.https_url && asset.https_url.length > 0) return asset.https_url;
          if (asset.hasOwnProperty("http_url") && asset.http_url && asset.http_url.length > 0) return asset.http_url;
        }
      }
      if (this._data.assets[assetKey].hasOwnProperty("https_url") && this._data.assets[assetKey].https_url && this._data.assets[assetKey].https_url.length > 0)
        return this._data.assets[assetKey].https_url;
      if (this._data.assets[assetKey].hasOwnProperty("http_url") && this._data.assets[assetKey].http_url && this._data.assets[assetKey].http_url.length > 0)
        return this._data.assets[assetKey].http_url;
    }

     this.gridImageUrl = (this.images && this.images.length > 0) ? this.images[0] : ProductModel.DEFAULT_IMAGE;
     return  this.gridImageUrl;
  }

  public get gridAltImage(): string {
    if (this.gridAltImageUrl && this.gridImageUrl.indexOf('default_eyewear')<0) return this.gridAltImageUrl;

    if (!this._data) return ProductModel.DEFAULT_IMAGE;
    var assetKey: string = "grid-" + (this.isEyeWear ? "eyewear" : "sunwear") + "-alt";
    if (this._data && this._data.hasOwnProperty('assets') && this._data.assets && this._data.assets.hasOwnProperty(assetKey)
      && this._data.assets[assetKey]) {
      if (Array.isArray(this._data.assets[assetKey])) {
        for (let asset of this._data.assets.assetKey) {
          if (asset.hasOwnProperty("https_url") && asset.https_url && asset.https_url.length > 0) {
            return asset.https_url;
          }
          if (asset.hasOwnProperty("http_url") && asset.http_url && asset.http_url.length > 0) return asset.http_url;
        }
      }

      if (this._data.assets[assetKey].hasOwnProperty("https_url") && this._data.assets[assetKey].https_url && this._data.assets[assetKey].https_url.length > 0)
        return this._data.assets[assetKey].https_url;
      if (this._data.assets[assetKey].hasOwnProperty("http_url") && this._data.assets[assetKey].http_url && this._data.assets[assetKey].http_url.length > 0)
        return this._data.assets[assetKey].http_url;
    }
    this.gridAltImageUrl = this.gridImage;
    return this.gridAltImageUrl;
  }

  public get productStr(): string {
    if (!this._data) return "";
    return this._data.name + " in " + this._data.color;
  }

  public get productSlug(): string {
    if (!this._data) return "";
    let retVal: string = (this._data && this._data.hasOwnProperty('slug') && this._data.slug) ? this._data.slug :
      (this._data.name.split(' ').join('-') + '-' + this._data.color.split(' ').join('-') ).replace('&', 'and').toLowerCase();
    return retVal;
  }

  public get getCollectionFromSlug(): string {
    if (this._data && this.productSlug) {
      let slugArr = this.productSlug.split('-');
      if (slugArr && slugArr.length > 1)
        return slugArr[0] + '-' + slugArr[1];
    }
    return null;
  }

  public get relatedTAg():string {
    if(this._data && this._data.hasOwnProperty("tags")){
      for(let tag of this._data.tags) {
        if (tag.indexOf("related-")>-1) return tag;
      }
    }
  }

  protected initSwatchColors() {
    this._tiles && this._tiles.products && this._tiles.products.map((data) => {
      var isActive = this.productId === data.product_id && "active" || "";
      data.swatchColor = data.color.trim().toLowerCase().split(' ').join('-').replace("-&", "") + " " + isActive;
      return data;
    });
  }

  protected initDigitized() {
    if (this.productId) {
      this._productService.getDittoProducts().then(products=> {
          if ((products as []).indexOf(this.productId) > -1) {
            this.isProductDigitized = true;
            this.dittoProductId = this.productId;
            return;
          }
          if (this._data) {
            var legacy_product_id = this._data.legacy_product_id + 'w';
            if (this.isEyeWear) legacy_product_id += 'g';
            else legacy_product_id += 's';
            if ((products as []).indexOf(legacy_product_id) > -1) {
              this.isProductDigitized = true;
              this.dittoProductId = legacy_product_id;
              this._data$.next(this._data);
            }
          }
        },
        e=> {
        });
    }
  }

  public get name(): string {
    if (this._data)
      return this._data.name;
    return null;
  }

  public get description(): string {
    if (this._data)
      return this._data.description;
    return null;
  }

  public get color(): string {
    if (this._data)
      return this._data.color;
    return null;
  }

  public get prices(): any {
    if (this._data)
      return this._data.prices;
    return null;
  }

  public get availability(): any {
    if (this._data)
      return this._data.availability;
    return null;
  }

  public get measurements(): any {
    if (this._data)
      return this._data.measurements;
    return null;
  }

}
