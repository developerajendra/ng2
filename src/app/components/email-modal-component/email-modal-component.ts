/**
 * Importing core components
 */

import {Component, Input, OnInit, ElementRef, OnChanges} from "@angular/core";
import {FormBuilder, Validators, Control} from "@angular/common";
import {ControlMessages} from "../control-messages-component";
import {ROUTER_DIRECTIVES} from "@angular/router";
import {UserService, ProductService, ValidationService, StaticDataService} from "../../services";
import {TenantConstant} from "../../constants/tenant";
import {ProductModel} from "../../models/product-model";

/**
 * Global variable
 */
declare var jQuery: any;

@Component({
  moduleId: module.id,
  selector: 'email-modal',
  templateUrl: 'email-modal-component.html',
  styleUrls: ['email-modal-component.css'],
  directives: [ROUTER_DIRECTIVES, ControlMessages]
})

/**
 * Exporting class (EmailModalComponent) from email-modal-component
 */

export class EmailModalComponent implements OnInit, OnChanges {
  @Input() productDetails: ProductModel;
  domainURL: string;
  userInfo: any = null;
  form: any;
  attemptSubmit: boolean = false;
  disabled: boolean = false;
  validationMessages: any = null;
  sub: any;
  friendName: string = '';
  myName: string = '';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _staticDataService: StaticDataService, private _formBuilder: FormBuilder, private _userService: UserService,
              private _productService: ProductService, private elementRef: ElementRef) {

    this._staticDataService.getDataValidation()
    .then(data=>this.validationMessages = data.auth.validation.register, error=> {/*console.log(error)*/
    });
    this.domainURL = TenantConstant.DOMAIN_URL;
    this._userService.getUserInfo().then((userInfo)=> {
      this.userInfo = userInfo;
    }, error=> {
    });
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.form = this._formBuilder.group({
      'referral_email': new Control('', Validators.compose([Validators.required, ValidationService.emailValidator])),
      'referral_first_name': new Control('', Validators.required),
      'referral_last_name': new Control('', Validators.required),
      'refree_email': new Control(this.userInfo && this.userInfo.email ? this.userInfo.email : "", Validators.compose([Validators.required, ValidationService.emailValidator])),
      'refree_first_name': new Control(this.userInfo && this.userInfo.first_name ? this.userInfo.first_name : "", Validators.required),
      'refree_last_name': new Control(this.userInfo && this.userInfo.last_name ? this.userInfo.last_name : "", Validators.required),
      'subject': new Control(''),
      'product_id': new Control(),
      'ditto_sku': new Control(),
      'mail_body': new Control('', Validators.required),
    });
    this.initForm();
    jQuery(this.elementRef.nativeElement).find('#emailToFriend').on('hidden.bs.modal', () => {
      this.resetForm();
    });
    // console.log(this.productDetails)
  }

  protected initForm() {
    if (!this.productDetails || !this.form) return;
    var subject = this.productDetails.productStr;
    var productId = this.productDetails.productId;
    var dittoProductId = '';
    var mailBody = `Check out the ${this.productDetails.productStr} from ${this.domainURL}`;
    if (this.productDetails.isProductDigitized) dittoProductId = this.productDetails.dittoProductId;

    if (this.sub) this.sub.unsubscribe();
    this.sub = this.productDetails.data.subscribe(_data=> {
      _data.selectedProduct && _data.selectedProduct.then(productData=> {
        mailBody = `Ciao ${this.friendName ? this.friendName : ''}!\n\nCheck out the ${this.productDetails.name} readers\nin ${this.productDetails.color} on ${this.domainURL}\n\n-${this.myName ? this.myName : ''}`;
        subject = this.productDetails.productStr;
        productId = this.productDetails.productId;
        if (this.productDetails.isProductDigitized) dittoProductId = this.productDetails.dittoProductId;
        jQuery(this.elementRef.nativeElement).find('#emailToFriend').on('show.bs.modal', () => {
          this.form.controls['subject'].updateValue(subject);
          this.form.controls['product_id'].updateValue(productId);
          this.form.controls['ditto_sku'].updateValue(dittoProductId);
          this.form.controls['mail_body'].updateValue(mailBody);
        });
      }, e => {
      });
    });

    jQuery(this.elementRef.nativeElement).find('#emailToFriend').on('show.bs.modal', () => {
      this.form.controls['referral_email'].updateValue("");
      this.form.controls['referral_first_name'].updateValue("");
      this.form.controls['referral_last_name'].updateValue("");
      this.form.controls['refree_email'].updateValue(this.userInfo && this.userInfo.email ? this.userInfo.email : "");
      this.form.controls['refree_first_name'].updateValue(this.userInfo && this.userInfo.first_name ? this.userInfo.first_name : "");
      this.form.controls['refree_last_name'].updateValue(this.userInfo && this.userInfo.last_name ? this.userInfo.last_name : "");
      this.form.controls['subject'].updateValue(subject);
      this.form.controls['product_id'].updateValue(productId);
      this.form.controls['ditto_sku'].updateValue(dittoProductId);
      this.form.controls['mail_body'].updateValue(mailBody);
    });
  }

  /**
   * Submit shipping function
   */

  submitForm() {
    this.attemptSubmit = false;
    if (this.form.dirty && this.form.valid) {
      jQuery(this.elementRef.nativeElement).find('#emailToFriend').modal('hide');
      jQuery(this.elementRef.nativeElement).parents('app').find('#subscribeLoaderModal').modal('show');
      this.disabled = true;
      this._productService.referToFriend(this.form.value)
      .then(data => {
          jQuery(this.elementRef.nativeElement).parents('app').find('#subscribeLoaderModal').modal('hide');
          this.disabled = false;
          jQuery(".close").click();
          jQuery('.top-elements').removeClass('modal-open');
        },
        error => {
          jQuery(this.elementRef.nativeElement).parents('app').find('#subscribeLoaderModal').modal('hide');
          // console.log('Submit Error: ', error);
          this.disabled = false;
        });
    } else {
      this.attemptSubmit = true;
    }
  }


  /**
   * resetForm() used to reset form values
   */

  private resetForm() {
    this.attemptSubmit = false;
    Object.keys(this.form.controls).map((key)=> {
      this.form.controls[key]._touched = false;
    });
  }

  /**
   * inputOnChange() used to re-render message
   */

  inputOnChange() {
    var mailBody = `Ciao ${this.friendName ? this.friendName : ''}!\n\nCheck out the ${this.productDetails.name} readers\nin ${this.productDetails.color} on ${this.domainURL}\n\n-${this.myName ? this.myName : ''}`;
    jQuery(this.elementRef.nativeElement).find('#mail_body').val(mailBody);
  }

  ngOnChanges(change) {
    if (change.hasOwnProperty('productDetails') && change['productDetails'].hasOwnProperty('currentValue') && change['productDetails']['currentValue']) {
      this.productDetails = change['productDetails']['currentValue'];
      this.initForm();
    }
  }
}
