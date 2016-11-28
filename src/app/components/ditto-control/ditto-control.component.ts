import {Component, OnInit, Input, OnChanges, OnDestroy, ElementRef} from "@angular/core";
import {ProductService, UserService} from "../../services";
import {ProductCarouselComponent} from "../product-carousel-component";
import {ProductModel} from "../../models/product-model";

declare var ditto: any;
declare var window: any;
declare var jQuery: any;

@Component({
  selector: 'ditto-control',
  templateUrl: 'ditto-control.component.html',
  styleUrls: ['ditto-control.component.scss'],
})


export class DittoControlComponent implements OnInit, OnChanges, OnDestroy {
  @Input() productId: string = null;
  @Input() showImages: boolean = true;
  @Input() hiddenOnSmallDevice: boolean = true;
  owlCarousel: any = null;
  imageCarouselOptions: any = {
    items: 5,
    loop: false,
    nav: true,
    dots: false,
    mouseDrag: false,
    animateOut: 'slideOutUp',
    animateIn: 'slideInUp',
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
        items: 5,
        animateOut: 'slideOutUp',
        animateIn: 'slideInUp'
      }
    }
  };

  fullimageCarouselOptions: any = {
    items: 1,
    loop: true,
    nav: false,
    dots: true,
    mouseDrag: true,
    touchDrag: true
  };

  public userHasDitto: boolean = false;
  public userDittoId: string = null;
  subs: any = [];
  cssLink: any;
  public isDittoVisible: boolean = false;
  // public activeImage: any = {0: true};
  public activeImage: any = [true];
  userInfo: any = null;
  public productModel: ProductModel = null;
  protected selectedIndex: number = 0;
  protected productSubscriber: any = null;

  constructor(protected _productService: ProductService, protected _userService: UserService, private elementRef: ElementRef) {
  }

  ngOnInit() {
    this.getUserInfo();
    this.getProductsData();
    // this.initializeCarousel();
    if (!this.showImages) this.isDittoVisible = true;
  }


  initializeCarousel(){
    let sel = '#thumb-img.owl-carousel';
    let fullCarousel = '#full-img.owl-carousel';
    setTimeout(() => {
      //this.owlCarousel = jQuery(this.elementRef.nativeElement).find(sel).owlCarousel(this.imageCarouselOptions);
      this.owlCarousel = jQuery(this.elementRef.nativeElement).find(fullCarousel).owlCarousel(this.fullimageCarouselOptions);
    }, 5);
  }

  protected getProductsData() {
    if (!this.productId || this.productId.length < 1) return;
    this.productModel = new ProductModel(this._productService, this.productId);
    if (this.productSubscriber) this.productSubscriber.unsubscribe();
    this.productSubscriber = this.productModel.data.subscribe(data=> {
      this.tryOn();
    });
  }

  getUserInfo() {
    this.userHasDitto = false;
    this.userDittoId = null;
    jQuery('#creation').empty();
    jQuery('#ditto').empty();
    this._userService.getUserInfo().then(data => {
      if (data && data.hasOwnProperty("ditto") && data.ditto.hasOwnProperty("ditto_id") && data.ditto.ditto_id && data.ditto.ditto_id.length > 0) {
        this.userHasDitto = true;
        this.userDittoId = data.ditto.ditto_id;
        this.tryOn();
      }
      this.userInfo = data;
    }, error => {
      console.log(error);
    });
    let sub = this._userService.userInfo$.subscribe(data => {
      this.userHasDitto = false;
      this.userDittoId = null;
      if (data && data.hasOwnProperty("ditto") && data.ditto.hasOwnProperty("ditto_id") && data.ditto.ditto_id && data.ditto.ditto_id.length > 0) {
        this.userHasDitto = true;
        this.userDittoId = data.ditto.ditto_id;
        this.tryOn();
      }
      this.userInfo = data;
    });
    this.subs.push(sub);

    sub = this._userService.isLoggedIn$.subscribe(data => {
      if (!data) {
        this.userHasDitto = false;
        this.userDittoId = null;
        this.userInfo = null;
      }
    });
    this.subs.push(sub);
  }

  createDitto() {

    new ditto.api.DittoCreation({selector: "#creation"}, {
      success: (q)=> {
        jQuery('#createDitto .close').click();
        if (!this.userInfo || !this.userInfo.email) {
          jQuery('.top-elements').addClass('modal-open');
          jQuery('#DittoLogin').modal('show');

          jQuery('#DittoLogin').on('hidden.bs.modal', function () {
            jQuery('.top-elements').removeClass('modal-open');
          });
          let sub = this._userService._isLoggedIn$.subscribe(data=> {
            if (data) {
              this._userService.getUserInfo().then(data=> {
                  this.updateDittoApi(this.userInfo.email, q.dittoId);
                  this.tryOn(q.dittoId);
                }
              );
              sub.unsubscribe();
            }
          });
        } else {
          this.updateDittoApi(this.userInfo.email, q.dittoId);
          this.tryOn(q.dittoId);
        }
        jQuery('.ditto-overlay').fadeOut(200);

      }, failure: (p)=> {
        // console.log("Error: ", p)
      }, progress: (p)=> {
        jQuery('.modal-backdrop').remove();
      }, close: (p)=> {
        // console.log("close", p)
      }
    });
    jQuery('#createDitto').on('hidden.bs.modal', function () {
      jQuery("#creation").empty();
    });
    this.cssLink = document.createElement("link");
    this.cssLink.href = "/app/components/ditto-control/ditto-control.component.css";
    this.cssLink.rel = "stylesheet";
    this.cssLink.type = "text/css";
    jQuery("#creation>iframe").contents().find('head').append(this.cssLink);
  }

  login() {
    jQuery('#accountModal').modal('show');
  }

  updateDittoApi(email, dittoId) {
    let payload = {
      "ditto": {
        "ditto_id": dittoId
      }
    };
    this._userService.addDittoToUser(email, payload)
    .then(user=> {
      this.userInfo = user;
      this._userService.setUserInfo$(user);
      jQuery('#creation').empty();
    }, err=> {
    });
  }

  tryOn(dittoId?: string) {
    if (!dittoId) dittoId = this.userDittoId;
    if (!dittoId) return;
    var initData = {
      selector: "#ditto",
      thumbnailSelector: "#ditto-thumbnail",
      dittoId: dittoId
    };
    if (this.productModel && this.productModel.isProductDigitized) initData['sku'] = this.productModel.dittoProductId;
    return new ditto.api.TryOn(initData, {
      success: ()=> {
        // this.isTryOn = true;
        // this.isDittoStarted = false;
        // console.log("Try-on success.");
      }, failure: ()=> {
        // console.log("Try-on failure.")
      },
    })
  }

  changeImage(index) {
    this.isDittoVisible = false;
    this.selectedIndex = index;
    for (let i = 0; i < this.activeImage.length; i++) {
      this.activeImage[i] ? this.activeImage[i] = false : null;
    }
    this.activeImage[index] = !this.activeImage[index];
  }

  virtualTryOn() {
    this.isDittoVisible = true;
  }


  ngOnChanges(change: any) {
    if (change && change.hasOwnProperty('productId') && change.productId && change.productId.hasOwnProperty('currentValue') && change.productId.currentValue) {
      this.productId = change.productId.currentValue;
      this.getProductsData();
    }
    if (change && change.hasOwnProperty('showImages') && change.showImages && change.showImages.hasOwnProperty('currentValue')) {
      this.showImages = change.showImages.currentValue;

      if (!this.showImages) this.isDittoVisible = true;
      this.getProductsData();
    }

    this.initializeCarousel();
  }

  ngOnDestroy() {
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }

  public get selectedImage(): string {
    if (!this.productModel || !this.productModel.images || this.productModel.images.length < 1) {
      return null;
    }
    if (this.selectedIndex >= this.productModel.images.length) this.selectedIndex = this.productModel.images.length - 1;
    return this.productModel.images[this.selectedIndex];
  }
}
