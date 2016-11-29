/**
 * Importing core components
 */

import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';

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
declare var $:any;

/**
 * @Component for footer-component
 */

@Component({
  selector: 'susbscribe',
  templateUrl: 'subscribe-component.html',
  styleUrls: ['subscribe-component.scss'],
  directives: [ControlMessages]
})

/**
 * Exporting class (FooterComponent) from footer-component
 */

export class SubscribeComponent implements OnInit,AfterViewInit {

  subscribeForm:any;
  attemptSubmit:boolean = false;
  disabled:boolean = false;
  validationMessages:any = null;

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _staticDataService:StaticDataService,private _formBuilder:FormBuilder, private _cookie:CookiesService, private elementRef:ElementRef, private _userService:UserService) {
    this._staticDataService.getDataValidation().then(data=>{this.validationMessages=data.auth.validation.unsubscribe},error=>{/*console.log(error)*/});
    this.subscribeForm = this._formBuilder.group({
      'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])]
    });
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {

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
          // console.log("Error: ", error);
        }
      );
    } else {
      this.attemptSubmit = true;
    }
    this.subscribeForm.controls['email'].updateValue("");
  }


}
