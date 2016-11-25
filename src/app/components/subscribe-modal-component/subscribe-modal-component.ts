/**
 * Importing core components
 */

import {Component, OnInit, ElementRef, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, Validators, Control, ControlGroup} from '@angular/common';

/**
 * Importing custom services
 */

import {CookiesService, UserService, ValidationService, StaticDataService} from '../../services';

/**
 * Importing custom components
 */

import {ControlMessages} from "../control-messages-component";

/**
 * Importing constants
 */

import {AppConstants} from '../../constants/app-constants';

/**
 * Global level variable "jQuery"
 */

declare var jQuery:any;

function showPopup(el) {
  jQuery && jQuery(el).find('#subscribeModal').modal('show');
}

/**
 * @Component for subscribe modal
 */

@Component({
  moduleId: module.id,
  selector: 'subscribe',
  templateUrl: 'subscribe-modal-component.html',
  styleUrls: ['subscribe-modal-component.css'],
  directives: [ControlMessages]
})

/**
 * Exporting class (SubscribeModalComponent) from shop-ano-component
 */

export class SubscribeModalComponent implements OnInit {

  subscribeUserForm:any;
  attemptSubmit:boolean = false;
  disabled:boolean = false;
  email:any = {};
  first_name:any = {};
  last_name:any = {};
  validationMessages:any = null;

  /**
   * constructor() used to initialize class level variables
   * @param _cookie
   * @param elementRef
   */

  constructor(private _staticDataService:StaticDataService,private _changeDetector : ChangeDetectorRef,private _formBuilder:FormBuilder, private _cookie:CookiesService, private elementRef:ElementRef, private _userService:UserService) {
    this._staticDataService.getDataValidation().then(data=>this.validationMessages=data.auth.validation.register,error=>{/*console.log(error)*/});
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    let newsLetter = this._cookie.getCookie(AppConstants.SUBSCRIBE);

    if (!newsLetter && this.elementRef.nativeElement) {
      showPopup(this.elementRef.nativeElement);
    }

    jQuery(this.elementRef.nativeElement).find('#subscribeModal').on('hidden.bs.modal', () => {
      if (!this._cookie.getCookie(AppConstants.SUBSCRIBE)) {
        this._cookie.setCookie(AppConstants.SUBSCRIBE, 'false', 365);
      }
      this.resetForm()
      this.subscribeUserForm.controls['first_name'].updateValue("");
      this.subscribeUserForm.controls['last_name'].updateValue("");
      this.subscribeUserForm.controls['email'].updateValue("");
    });

    jQuery(this.elementRef.nativeElement).find('#subscribeLoaderModal').on('hidden.bs.modal', () => {
      jQuery(this.elementRef.nativeElement).parent().find('input[type="email"]').value = '';
    });

    this.subscribeUserForm = this._formBuilder.group({
      'first_name': ['',Validators.required],
      'last_name': ['',Validators.required],
      'email': ['',Validators.compose([Validators.required, ValidationService.emailValidator])]
    });
  }

  /**
   * confirmSubscribe() used to display subscribeConfirmModal
   */


  confirmSubscribe() {
    this.attemptSubmit = false;
    if (this.subscribeUserForm.dirty && this.subscribeUserForm.valid) {
      jQuery(this.elementRef.nativeElement).find('#subscribeModal').modal('hide');
      jQuery(this.elementRef.nativeElement).find('#subscribeLoaderModal').modal('show');
      this.disabled = true;
      this._userService.subscribeUser(this.subscribeUserForm.value).then(data => {
          this._cookie.setCookie(AppConstants.SUBSCRIBE, 'true', 365);
          jQuery(this.elementRef.nativeElement).find('#subscribeLoaderModal').modal('hide');
          this.disabled = false;
          jQuery(this.elementRef.nativeElement).find('#subscribeConfirmModal').modal('show');
        },
        error => {
          jQuery(this.elementRef.nativeElement).find('#subscribeLoaderModal').modal('hide');
          this.disabled = false;
          jQuery(this.elementRef.nativeElement).find('#subscribeErrorModal').modal('show');
          // console.log('Error: ', error);
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
    Object.keys(this.subscribeUserForm.controls).map((key)=> {
      this.subscribeUserForm.controls[key]._touched = false;
    });
  }

}
