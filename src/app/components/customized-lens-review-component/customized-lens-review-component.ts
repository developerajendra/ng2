/**
 * Importing core components
 */

import {Component, OnInit, ElementRef, OnDestroy} from "@angular/core";
import {ROUTER_DIRECTIVES,Router} from "@angular/router";
import {ProductTileComponent} from "../product-tile-component";
import {ImageModalComponent} from "../image-modal-component";
import {TenantConstant} from "../../constants";
import {LoaderComponent} from "../loader-component";
import {CartService, NotifyService, UserService} from "../../services";


declare var jQuery:any;

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for customized-lens-review-component
 */

@Component({
  selector: 'lens-review',
  templateUrl: 'customized-lens-review.html',
  styleUrls: ['customized-lens-review.scss'],
  directives: [ROUTER_DIRECTIVES, ProductTileComponent, ImageModalComponent, LoaderComponent]
})

/**
 * Exporting class (CustomizedLensReviewComponent) from customized-lens-review-component
 */

export class CustomizedLensReviewComponent implements OnInit, OnDestroy {

  private selectedLense:any = "";
  private lense:any = {};
  private cartItemsObject:any;
  rxItems:any = null;
  cartData:any = {};
  imageData:string = '';
  imageName:string = '';
  showFlag:boolean = false;
  enableLoader:boolean = false;
  showModalId:string = 'imageModal';
  isRxImage:boolean = false;

  lensType = {
    STANDARD_INDEX_LENS: 'PRESCRIPTION LENSES',
    HIGH_INDEX_LENS: 'PRESCRIPTION LENSES',
    PRG_STANDARD_LENS: 'PROGRESSIVE PRESCRIPTION LENSES',
    PRG_HIGH_INDEX_LENS: 'PROGRESSIVE PRESCRIPTION LENSES',
    READING_LENS: 'READING GLASSES',
    PLANO_LENS: 'NON-CORRECTIVE LENSES',
    NO_LENS: 'NO LENSES',
  };

  rx_Options = {
    RX_SEND_LATER: "I'll Send My Rx Later",
    RX_CALL_DOCTOR: 'Call My Doctor',
    RX_ENTER_NOW: "'s Prescription",
    RX_UPLOAD: 'Rx Uploaded',
    RX_READING: '',
  };

  show:any = {};

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _router:Router, private _notifyHeader:NotifyService, private _cartService:CartService, private _userService:UserService, private elemRef:ElementRef) {
    this.getCartData();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this._notifyHeader.currentPage(true);
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this._notifyHeader.currentPage(false);
  }

  selectLens(val) {
    this.selectedLense = val;
    this.lense.type = this.selectedLense;
  }

  getCartData() {
    this._cartService.getCartData().then(cartData=> {
      this.getRxProduct(cartData.selectedItems);
      changeStatus();
    }, e=> {
      changeStatus();
    });
  }

  showImage(index) {
    if (!this.rxItems[index].rx_file) {
      return
    }
    this.showFlag = true;
    let imgExt:string = '';
    if (this.rxItems[index].rx_file.data) {
      imgExt = this.rxItems[index].rx_file.filename.split('.').slice(-1)[0].toLowerCase();
      this.isRxImage = (TenantConstant.IMAGE_EXT_TO_VIEW.toString().toLowerCase().indexOf(imgExt) > -1);
      this.imageData = atob(this.rxItems[index].rx_file.data);
      this.downloadRxFile(index);
    } else {
      this.enableLoader = true;
      imgExt = this.rxItems[index].rx_file.split('.').slice(-1)[0].toLowerCase();
      this.isRxImage = (TenantConstant.IMAGE_EXT_TO_VIEW.toString().toLowerCase().indexOf(imgExt) > -1);
      this._userService.getRxFile(this.rxItems[index].rx_file).then(data=> {
        this.enableLoader = false;
        this.imageData = data;
        this.downloadRxFile(index);
      }, error=> {
        this.enableLoader = false;
      });
    }
  }

  private getRxProduct(cartItems) {
    this.rxItems = [];
    cartItems.forEach((item:any)=> {
      item.rx && Object.keys(item.rx).forEach((key)=> {
        this.rxItems.push(item.rx[key]);
      });
    });
  }

  private downloadRxFile(index) {
    if (this.isRxImage || !this.rxItems[index].rx_file) {
      return
    }
    let name:string = this.rxItems[index].rx_file.filename || this.rxItems[index].rx_file;
    var $pom = document.createElement('a');
    $pom.setAttribute('href', this.imageData);
    $pom.setAttribute('download', name);
    $pom.click();
  }

 
}
