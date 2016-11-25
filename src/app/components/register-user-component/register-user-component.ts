/**
 * Importing core components
 */


import {AppConstants} from '../../constants/app-constants';
import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';

/**
 * Importing custom services
 */

import {UserService, ValidationService, CookiesService, StaticDataService} from '../../services';
import {LoaderComponent} from "../loader-component";

/**
 * Importing custom components
 */

import {ControlMessages} from "../control-messages-component";

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for register-user-component
 */

@Component({
  moduleId: module.id,
  selector: 'register-user',
  templateUrl: 'register-user-component.html',
  styleUrls: ['register-user-component.css'],
  directives: [ROUTER_DIRECTIVES, ControlMessages, LoaderComponent]
})

/**
 * Exporting class (RegisterUserComponent) from register-user-component
 */


export class RegisterUserComponent implements OnInit {

  registerUserForm:any;
  emailExistError:boolean = false;
  attemptSubmit:boolean = false;
  disabled:boolean = false;
  validationMessages:any;
  pageTitle:string;
  enableLoader:boolean = false;

  private currentUrl:string = '';

  /**
   * constructor() used to initialize class level variables
   * @param _formBuilder
   * @param _userService
   * @param _router
   * @param _cookie
   */

  constructor(private _staticDataService:StaticDataService,private _formBuilder:FormBuilder, private _userService:UserService, private _router:Router, private _cookie:CookiesService) {
    this._staticDataService.getDataValidation().then(data=>{this.validationMessages=data.auth.validation.register , this.pageTitle=data.auth},error=>{/*console.log(error)*/});
    this.registerUserForm = this._formBuilder.group({
      'first_name': ['', Validators.required],
      'last_name': ['', Validators.required],
      'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
      matchingPassword: _formBuilder.group({
        password: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
        confirm_password: ['', Validators.required]
      }, {validator: ValidationService.areEqual}),
      'email_opt_in': [''],
    });
    this.currentUrl=_userService.getCurrentUrl();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this._userService.getAuthCookie().then(
      isLoggedIn=>{
        if(isLoggedIn) this._router.navigate(['/']);
        changeStatus();
      },error=>{
        changeStatus();
      }
    );
  }

  /**
   * RegisterUser() used to register a new user into DB
   */

  registerUser() {
    if (this.registerUserForm.dirty && this.registerUserForm.valid) {
      this.disabled = true;
      this.enableLoader = true;
      this._userService.registerUser(this.registerUserForm.value)
        .then(data => {
          this.loginRegisteredUser({
            email: this.registerUserForm.value.email,
            password: this.registerUserForm.value.matchingPassword.password
          });
          this.disabled = false;
        },
          error => {
            this.enableLoader = false;
            this.emailExistError = true;
            this.disabled = false;
            // console.log('Error: ', error);
        });
    } else {
      this.attemptSubmit = true;
    }
  }

  /**
   * loginRegisteredUser() used to login after register
   */
  loginRegisteredUser(user) {
    this._userService.authUser(user).then(
        data => {
          this.enableLoader = false;
          this._cookie.setToken(data);
        this._userService.setIsLoggedIn$(true);
        this.getUserInfo();
        this.currentUrl
          ? this._router.navigate([this.currentUrl])
          : this._router.navigateByUrl('/');
      },
        error =>{});
  }

  /**
   * GetUserInfo() used to return the user info
   */


  getUserInfo() {
    this._userService.getUserInfo().then(
        data => {
        this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(data), null);
      },
        error =>{});
  }

}
