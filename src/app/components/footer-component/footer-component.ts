/**
 * Importing core components
 */

import {Component, OnInit, ElementRef, AfterViewInit, OnDestroy, Inject} from "@angular/core";
import {FormBuilder, Validators} from "@angular/forms";
import {Routes,RouterModule} from "@angular/router";
import {NotifyService, CookiesService, UserService, ValidationService, StaticDataService} from "../../services";
import {ControlMessages} from "../control-messages-component";
import {AppConstants} from "../../constants/app-constants";


/**
 * Global level variable "jQuery"
 */

declare var jQuery: any;
declare var $: any;

/**
 * @Component for footer-component
 */

@Component({
  selector: 'footer',
  templateUrl: 'footer-component.html',
  styleUrls: ['footer-component.scss'],
  directives: [ ControlMessages]
})

/**
 * Exporting class (FooterComponent) from footer-component
 */

export class FooterComponent implements OnInit,AfterViewInit, OnDestroy {

  subs: any = [];
  subscribeForm: any;
  attemptSubmit: boolean = false;
  disabled: boolean = false;
  validationMessages: any = null;
  isCheckoutPage: boolean = false;

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _isCheckoutPage: NotifyService, private _staticDataService: StaticDataService, private _formBuilder: FormBuilder, private _cookie: CookiesService, private elementRef: ElementRef, private _userService: UserService) {
    this._staticDataService.getDataValidation().then(data=> {
      this.validationMessages = data.auth.validation.unsubscribe
    }, error=> {
    });
    this.subscribeForm = this._formBuilder.group({
      'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])]
    });
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.checkoutPageActive();
  }

  ngAfterViewInit() {
  }


  /**
   * confirmSubscribe() used to display subscribeConfirmModal
   */


  confirmSubscribe(event) {
    this.attemptSubmit = false;
    if (this.subscribeForm.dirty && this.subscribeForm.valid) {
      jQuery(this.elementRef.nativeElement).parent().find('#subscribeLoaderModal').modal('show');
      this.disabled = true;
      this._userService.subscribeUser(this.subscribeForm.value).then(data => {
          jQuery(this.elementRef.nativeElement).parent().find('#subscribeLoaderModal').modal('hide');
          this._cookie.setCookie(AppConstants.SUBSCRIBE, 'true', 365);
          this.disabled = false;
          jQuery(this.elementRef.nativeElement).parent().find('#subscribeConfirmModal').modal('show');
        },
        error => {
          jQuery(this.elementRef.nativeElement).parent().find('#subscribeLoaderModal').modal('hide');
          this.disabled = false;
          jQuery(this.elementRef.nativeElement).parent().find('#subscribeErrorModal').modal('show');
        }
      );
    } else {
      this.attemptSubmit = true;
    }
    this.subscribeForm.controls['email'].updateValue("");
  }

  /**
   * checkoutPageActive() used to hide navigation on checkout
   */
  checkoutPageActive() {
    let sub: any = this._isCheckoutPage.hideElement$.subscribe(data => this.isCheckoutPage = data, error => {/*console.log(error)*/
    });
    this.subs.push(sub);
  }

  /**
   * subscribe() used to display the subscribe modal
   */

  subscribe() {
    jQuery(this.elementRef.nativeElement).parent().find('#subscribeModal').first().modal();
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }

}
