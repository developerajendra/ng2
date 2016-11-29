/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy} from "@angular/core";
import {Router} from "@angular/router";
import {AppConstants} from "../../constants/app-constants";
import {FormBuilder, Validators} from "@angular/common";
import {CustomizeLensService, UserService, CookiesService, ValidationService, CartService, NotifyService, StaticDataService} from "../../services";
import {ControlMessages} from "../control-messages-component";
import {BreadCrumbComponent} from "../breadcrumb-component";
import {LoaderComponent} from "../loader-component";


declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for checkout-guest-component
 */

@Component({
  selector: 'checkout-guest',
  templateUrl: 'checkout-guest-component.html',
  styleUrls: ['checkout-guest-component.scss'],
  directives: [ControlMessages, BreadCrumbComponent, LoaderComponent]
})

/**
 * Exporting class (CheckoutGuestComponent) from checkout-guest-component
 */

export class CheckoutGuestComponent implements OnInit, OnDestroy {

  loginForm: any;
  emailForm: any;
  authenticationError: boolean = false;
  attemptSubmit: boolean = false;
  attemptSubmitEmailForm: boolean = false;
  disabled: boolean = false;
  disabledEmailForm: boolean = false;
  haveCustomizeLenses: any = false;

  private currentUrl: any = null;
  validationMessages: any = null;
  staticMsgs: any = null;
  emailExist: any = false;
  enableLoader: boolean = false;


  customizeLensesId: any = 0;

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _customizeLensService:CustomizeLensService, private _staticDataService: StaticDataService, private _formBuilder: FormBuilder, private _userService: UserService, private _cookie: CookiesService, private _router: Router, private _cartService: CartService, private _notifyHeader: NotifyService) {
    this._staticDataService.getDataValidation().then(data=> {
      this.validationMessages = data.checkout.validation.start;
      this.staticMsgs = data.signIn;
    }, error=> {
    });

    this.isCustomizeLenses();
    let login_cookie: any = this._cookie.getCookie(AppConstants.LOGIN_COOKIE);
    this.loginForm = this._formBuilder.group({
      'email': [login_cookie && JSON.parse(login_cookie) || '', Validators.compose([Validators.required, ValidationService.emailValidator])],
      password: ['', Validators.compose([Validators.required])]
    });
    this.emailForm = this._formBuilder.group({
      'guestEmail': ['', Validators.compose([Validators.required, ValidationService.emailValidator])]
    });
    //this.currentUrl =this._userService.getCurrentUrl();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this._notifyHeader.currentPage(true);
    changeStatus();
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this._notifyHeader.currentPage(false);
  }

  /**
   * guestEmailSubmit() used for the login functionality
   */

  guestEmailSubmit() {
    if (this.emailForm.dirty && this.emailForm.valid) {
      this.disabledEmailForm = true;
      this.enableLoader = true;
      this._userService.isUserExists(this.emailForm.value.guestEmail).then(isExists => {
        if (!isExists) {
          this._cartService.getCartData().then((cartData: any)=> {
            if (!cartData.cart.customer) {
              cartData.cart.customer_email = this.emailForm.value.guestEmail;
              this._cookie.setCookie(AppConstants.CHECKOUT_TYPE, "guest", null);
              this._cartService.updateCart(cartData.cart.cart_id, cartData.cart).then(data => {
                this._cartService.writeCartToLocalStorage(cartData);
                let redirectTo = '';
                if (this.haveCustomizeLenses) {
                  redirectTo = 'checkout/customize/' + this.customizeLensesId;
                } else {
                  redirectTo = 'checkout/shipping';
                }
                this._router.navigateByUrl(redirectTo);
              }, error => {
                if (error.code === "E_CART_UNAVAILABLE") {
                  this._cartService.removeCache();
                  this._router.navigate(['/']);
                }
              });
            } else {
              let redirectTo = '';
              if (this.haveCustomizeLenses) {
                redirectTo = 'checkout/customize/' + this.customizeLensesId;
              } else {
                redirectTo = 'checkout/shipping';
              }
              this._router.navigateByUrl(redirectTo);
            }
          }, error => {
          });
        } else {
          this.enableLoader = false;
          this.emailExist = true;
          this.disabledEmailForm = false;
        }
      }, error => {});
    } else {
      this.attemptSubmitEmailForm = true;
    }
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
          this.authenticationError = true;
          this.disabled = false;
          this._userService.setIsLoggedIn$(false);
          this.enableLoader = false;
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
      userInfo => {
        this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(userInfo), null);
        this._cartService.getCartData().then((cartData: any)=> {
          this._cookie.setCookie(AppConstants.CHECKOUT_TYPE, "customer", null);
          this._userService.setIsLoggedIn$(true);
          if (!cartData.cart.customer) {
            cartData.cart.customer_email = userInfo.email;
            this._cartService.updateCart(cartData.cart.cart_id, cartData.cart).then(data => {
              this._cartService.writeCartToLocalStorage(cartData);
              let redirectTo = '';
              if (this.haveCustomizeLenses) {
                redirectTo = 'checkout/customize/' + this.customizeLensesId;
              } else {
                redirectTo = 'checkout/shipping';
              }
              this._router.navigateByUrl(redirectTo);
              this.disabled = false;
            }, error => {
              if (error.code === "E_CART_UNAVAILABLE") {
                this._cartService.removeCache();
                this._router.navigate(['/']);
              }
            });
          } else {
            this._router.navigateByUrl('checkout/customize/' + this.customizeLensesId);
            this.disabled = false;
          }
        }, error => {
        });
      },
      error => {
        this._cookie.delete_cookie(AppConstants.USER_COOKIE);
        this._cookie.delete_cookie(AppConstants.COOKIE_NAME);
        this.authenticationError = true;
        this.disabled = false;
        this._userService.setIsLoggedIn$(false);
      });
  }

  /**
   * checkoutGuest() used for guest checkout process
   */

  checkoutGuest() {
    this._cartService.getCartData().then((cartData: any)=> {
      cartData.cart.customer_email = null;
      delete cartData.cart.customer;
      delete cartData.cart.rx;
      this._cartService.updateCart(cartData.cart.cart_id, cartData.cart).then(data => {
        this._cartService.writeCartToLocalStorage(cartData);
        if (this.haveCustomizeLenses)
          this._router.navigate(['/checkout/customize/' + this.customizeLensesId]);
        else
          this._router.navigate(['/checkout/shipping']);
        this.disabled = false;
      }, error => {
        if (error.code === "E_CART_UNAVAILABLE") {
          this._cartService.removeCache();
          this._router.navigate(['/']);
        }
      });
    }, error => {
    });
  }

  /**
   * isCustomizeLenses Function
   *
   */
  isCustomizeLenses() {
    this._customizeLensService.getCustomizeLense().then((data)=>{
      this.customizeLensesId = data.id;
      this.haveCustomizeLenses = data.isCustomize;
    },(error)=>{
      console.log("error", error);
    });

  }


}
