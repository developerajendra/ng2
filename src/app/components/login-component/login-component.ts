/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';
import {MetaService} from "ng2-meta";

/**
 * Importing app level constants
 */

import {AppConstants} from '../../constants/app-constants';
import {ROUTER_DIRECTIVES, ActivatedRoute, Router} from '@angular/router';
import {FormBuilder, Validators} from '@angular/common'
import {UserService, CookiesService, ValidationService, StaticDataService} from '../../services';
import {ControlMessages} from "../control-messages-component";
import {LoaderComponent} from "../loader-component";

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for login-component
 */


@Component({
  moduleId: module.id,
  selector: 'login',
  templateUrl: 'login-component.html',
  styleUrls: ['login-component.css'],
  directives: [ROUTER_DIRECTIVES, ControlMessages, LoaderComponent]
})

/**
 * Exporting class (LoginComponent) from login-component
 */


export class LoginComponent implements OnInit {
  loginForm:any;
  authenticationError:boolean = false;
  attemptSubmit:boolean = false;
  disabled:boolean = false;
  validationMessages:any;
  private currentUrl:any = null;
  title:string;
  staticMsgs:any = null;
  enableLoader:boolean = false;

  /**
   * constructor() used to initialize class level variables
   * @param _formBuilder
   * @param _userService
   * @param _cookie
   * @param _router
   */

  constructor(private metaService: MetaService,private _staticDataService:StaticDataService, private _formBuilder:FormBuilder, private _userService:UserService, private _cookie:CookiesService, private _router:Router) {
    this._staticDataService.getDataValidation().then(data=> {
      this.validationMessages = data.auth.validation.login,
        this.staticMsgs = data.signIn,
        this.title = data.auth
    }, error=>{/*console.log(error)*/});
    let login_cookie:any = this._cookie.getCookie(AppConstants.LOGIN_COOKIE);
    this.loginForm = this._formBuilder.group({
      'email': [login_cookie && JSON.parse(login_cookie) || '', Validators.compose([Validators.required, ValidationService.emailValidator])],
      password: ['', Validators.compose([Validators.required])]
    });
    this.currentUrl = this._userService.getCurrentUrl();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this._userService.getAuthCookie().then(
      isLoggedIn=> {
        if (isLoggedIn) this._router.navigate(['/']);
        changeStatus();
      }, error=> {
        changeStatus();
      }
    );

    this.setMetaTags(this.staticMsgs);


  }

  /**
   * login() used for the login functionality
   */

  login() {

    if (this.loginForm.dirty && this.loginForm.valid) {
      this.disabled = true;
      this.enableLoader = true;
      this._userService.authUser(this.loginForm.value).then(
        data => {
          this._cookie.setToken(data);
          this.getUserInfo();
        },
        error => {
          this.enableLoader = false;
          this.authenticationError = true;
          this._userService.setIsLoggedIn$(false);
          this.disabled = false;
          // console.log("Error: ", error);
        });
    } else {
      this.attemptSubmit = true;
    }
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    this._userService.getUserInfo().then(
      data => {
        this.enableLoader = false;
        this._userService.setIsLoggedIn$(true);
        this.currentUrl ? this._router.navigateByUrl(this.currentUrl) : this._router.navigateByUrl('/');
        this.disabled = false;

        this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(data), null);
        this._cookie.setCookie(AppConstants.LOGIN_COOKIE, JSON.stringify(data.email), 1);
      }, error => {
        this._cookie.delete_cookie(AppConstants.USER_COOKIE);
        this._cookie.delete_cookie(AppConstants.COOKIE_NAME);
        this.authenticationError = true;
        this.enableLoader = false;
        this._userService.setIsLoggedIn$(false);
        this.disabled = false;
      });
  }

  /**
   * setMetaTags() used to get metatags form JSON
   *
   */

  setMetaTags(data) {
    this.metaService.setTitle(data.pageTitle);
    this.metaService.setTag('description', data.metaDescription);
  }

}
