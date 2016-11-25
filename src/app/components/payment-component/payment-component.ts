/**
 * Importing core components
 */

import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {FormBuilder, Validators, Control, FORM_DIRECTIVES} from "@angular/common";
import {ROUTER_DIRECTIVES, Router} from "@angular/router";
import {BannerComponent} from "../banner-component";
import {CartService, NotifyService, StaticDataService, CookiesService, UserService} from "../../services";
import {TenantConstant} from "../../constants";
import {ControlMessages} from "../control-messages-component";
import * as moment from "moment";
import {AppConstants} from "../../constants/app-constants";
import {BreadCrumbComponent} from "../breadcrumb-component";
import {ValidationService} from "../../services/validation.service";
import {ToolTipComnponent} from "../tool-tip-component";
import {LoaderComponent} from "../loader-component";
import {ConstantsService} from "../../services/constants.service";
import {Title} from "@angular/platform-browser";

declare var Braintree: any;

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

@Component({
  selector: 'payment',
  templateUrl: 'payment-component.html',
  styleUrls: ['payment-component.scss'],
  directives: [LoaderComponent, ToolTipComnponent, ControlMessages, BannerComponent, BreadCrumbComponent, FORM_DIRECTIVES, ROUTER_DIRECTIVES]
})

/**
 * Exporting class (CheckoutComponent) from checkout-component
 */

export class PaymentComponent implements OnInit, OnDestroy {
  @Input() products: [{}];
  listOfMonth: any = TenantConstant.MONTH;
  listOfYear: any = TenantConstant.YEAR;
  card_number: Control;
  save: Control;
  paymentForm: any;
  productList: any = [];
  braintree: any = {};
  cart: any = {};
  selectedMonth: String;
  selectedYear: String;
  storedCardList: any = [];
  userInfo: any = null;
  cardIndex: number = null;
  isCardInfoFromSaved: boolean = false;
  isFormValid: boolean = false;
  validationMessages: any = null;
  bag: any = [];
  cartItems: any = null;
  bagTotal:any = 0;
  cartItemsCount:any = 0;
  haveItems: number = 0;
  haveHtkItems: number = 0;
  staticMsgs: any = null;
  isKioskMode: boolean = false;
  isGuest: boolean = false;
  formObj: any;
  displayCustomizedProducts: any = [];
  displayNonCustomizedProducts: any = [];
  totalCustomize:any = 0;
  totalNonCustomize:any = 0;
  promoCodeErrorMessage: any = "";
  cardNumberErrorMessage: any = "";
  expiryErrorMessage: any = '';
  cardErrorMessage: any = "";
  attemptSubmit: boolean = false;
  isCustomerPickUp: boolean = false;
  promoCode = "";
  enableLoader: boolean = false;
  subs: any = [];
  haveCustomizeLenses: any = false;
  discount: number = 0;
  promoCodeAppliedMessage: any = '';
  customerExists: any = '';
  cvvErrorMessage: any = '';
  store_credit_used: boolean[] = [];
  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected _cookie: CookiesService, protected _staticDataService: StaticDataService, protected _notifyHeader: NotifyService,
              protected formBuilder: FormBuilder, protected _cartService: CartService, protected _router: Router, protected _userService: UserService,
              protected _constantsService: ConstantsService) {
    this.loadUpdatedData();
    this.getKiosks();
    this.isCustomizeLenses();
    this._staticDataService.getDataValidation().then((data: any)=> {
      this.validationMessages = data.checkout.validation.payment;
      this.staticMsgs = data;
    }, error=> {
    });
    this.braintree = Braintree.create(this._constantsService.envConstants.BRAINTREE_KEY);
    this.formObj = {
      card_number: new Control('', Validators.compose([Validators.required])),
      expire_month: new Control('', Validators.required),
      expire_year: new Control('', Validators.required),
      CVV_number: new Control('', Validators.compose([Validators.required, ValidationService.cvvValidator])),
      save: new Control(''),
      isSavedCard: new Control(''),
      promoCode: new Control(''),
      selectedCard: new Control(''),
      pinCode: new Control('')
    };
    if (this.isKioskMode)
      this.formObj.email = new Control('', Validators.compose([ValidationService.emailValidator]));

    this.paymentForm = formBuilder.group(this.formObj);
  }

  applyPromoCode() {
    let cartId = this.cart.cart_id;

    if (this.promoCode) {
      this.enableLoader = true;
      this.promoCodeErrorMessage = '';
    } else {
      this.promoCodeErrorMessage = 'Please Enter a valid discount code.';
      return;
    }

    if (this.cart.discount_codes.indexOf(this.promoCode) !== -1) {
      this.promoCode = '';
      this.paymentForm.controls['promoCode'].updateValue('');
      this.promoCodeErrorMessage = 'This code has already been applied';
      this.enableLoader = false;
    } else {
      this.cart.discount_codes = [this.promoCode];
      // this.cart.discount_codes.push(this.promoCode);
      this.promoCodeErrorMessage = 'Please Enter a valid discount code.';

      this.promoCode && this._cartService.updateCart(cartId, this.cart).then(
        data => {
          let localCart = {};
          this._cartService.getCartData().then(dataLocal=> {
            localCart = dataLocal;
            this.cart = data['cart'];
            localCart['cart'] = this.cart;
            this._cartService.writeCartToLocalStorage(localCart);
            this.getDiscountFromCart();
            this.setStoreCreditFromCart();
          }, e => {
          });

          this.promoCodeErrorMessage = '';
          this.promoCode = '';
          this.paymentForm.controls['promoCode'].updateValue('');
          this.enableLoader = false;

        },
        error => {
          this.enableLoader = false;
          // this.cart.discount_codes = [];
          this.cart.discount_codes.pop(this.promoCode);
          if (error.code === "E_CART_UNAVAILABLE") {
            this._cartService.removeCache();
            this._router.navigate(['/']);
          }

          if (this.promoCode == '') {
            this.promoCodeErrorMessage = 'Please Enter a valid discount code.';
          } else {
            this.promoCodeErrorMessage = error.message;
            this.promoCode = "";
            this.paymentForm.controls['promoCode'].updateValue('');
          }
        });
    }
  }

  makePayment() {
    this.attemptSubmit = true;
    this.isFormValid = true;
    this.cardNumberErrorMessage = '';

    let formData = this.paymentForm.value;

    if (this.isCardInfoFromSaved && (!this.cardIndex || !this.userInfo['credit_cards'][this.cardIndex])) {
      this.cardErrorMessage = 'Please select a Card';
      return;
    } else {
      this.cardErrorMessage = '';
    }

    if (this.paymentForm.valid === true || (this.isCardInfoFromSaved && this.cardIndex && this.userInfo['credit_cards'][this.cardIndex])) {
      this.enableLoader = true;

      if (this.promoCode) {
        this.promoCodeErrorMessage = 'Please apply this discount before proceeding';
        this.enableLoader = false;
        return;
      }

      if (formData && formData.expire_month && formData.expire_year) {

        let currentYear = moment().format("YYYY").toString();
        let currentMonth = moment().format("MM").toString();

        if ((+currentYear > +formData.expire_year) || ((+currentYear == +formData.expire_year) && (+currentMonth > +formData.expire_month))) {
          this.expiryErrorMessage = 'This card has expired';
          this.enableLoader = false;
          return;
        } else {
          this.expiryErrorMessage = '';
        }

      }

      if (this.isKioskMode) {
        this.cart.customer = this.cart.customer || {};
        this.cart.customer.email = this.paymentForm.value.email || "";
        delete  this.cart.customer_email;
      }

      if (!this.isCardInfoFromSaved) {
        this.cart.payment.credit_card = {
          cc: this.braintree.encrypt(formData.card_number),
          cvv: this.braintree.encrypt(formData.CVV_number),
          type: "CC_BRAINTREE_NEW",
          expiration: this.braintree.encrypt(this.selectedMonth + '/' + this.selectedYear)
        };
        this.cart.payment.save = formData.save || false;
      } else {
        this.cart.payment.credit_card = {
          type: "CC_EXISTING",
          card_id: this.storedCardList[this.cardIndex].card_id
        };
      }

      let cartId = this.cart.cart_id;
      this._cartService.updateCart(cartId, this.cart).then(
        data => {
          if (!this.isKioskMode) {
            this.checkout(cartId);
          } else {
            this.guestCheckout(cartId);
          }
          this.attemptSubmit = false;
        },
        error => {
          this.enableLoader = false;
          if (error.code === "E_CART_UNAVAILABLE") {
            this._cartService.removeCache();
            this._router.navigate(['/']);
          }
        });
    } else {
      this.enableLoader = false;
      // console.log('form is not valid')
    }
  }

  checkout(cartId) {
    this._cartService.checkoutCart(cartId).then(
      (response: any) => {
        response.cartId = cartId;
        this._cartService.setFinalCheckoutCart(response);
        this._router.navigate(['/checkout/done']);
      },
      error => {
        if (error.code === "E_INVALID_CC_NUMBER") {
          this.cardNumberErrorMessage = 'Invalid card number';
        } else if (error.code === "E_DECLINED") {
          this.cvvErrorMessage = 'CVV must be 4 digits for American Express and 3 digits for other card types.';
        }
        this.enableLoader = false;
      });
  }

  guestCheckout(cartId) {
    this._cartService.guestCheckoutCart(cartId).then(
      (response: any) => {
        response.cartId = cartId;
        this._cartService.setFinalCheckoutCart(response);
        this._router.navigate(['/checkout/done']);
      },
      error => {
        if (error.code === "E_INVALID_CC_NUMBER") {
          this.cardNumberErrorMessage = 'Invalid card number';
        } else if (error.code === "E_CART_UNAVAILABLE") {
          this._cartService.removeCache();
          this._router.navigate(['/']);
        } else if (error.code === "E_CUSTOMER_EXISTS") {
          this.customerExists = error.message;
        } else if (error.code === "E_DECLINED") {
          this.cvvErrorMessage = 'CVV must be 4 digits for American Express and 3 digits for other card types.';
        }
        this.enableLoader = false;
      });
  }

  generatePayload(status) {
    let payload: any;
    payload = {
      card_number: new Control('', Validators.compose([Validators.required])),
      expire_month: new Control('', Validators.required),
      expire_year: new Control('', Validators.required),
      CVV_number: new Control('', Validators.compose([Validators.required, ValidationService.cvvValidator])),
      save: new Control(''),
      isSavedCard: new Control(''),
      promoCode: new Control(''),
      selectedCard: new Control(''),
      pinCode: new Control(''),
    };
    return payload;
  }

  updateSavedCardStatus(status) {
    if (status) {
      this.promoCodeErrorMessage = '';
      this.promoCode = '';
      this.paymentForm = this.formBuilder.group(this.generatePayload(status));
      this.isCustomerPickUp = !status;
    } else {
      this.cardIndex = null;
    }
    this.isCardInfoFromSaved = status;
    this.attemptSubmit = false;
  }

  /**
   * bagItemCount function
   * @returns {number}
   */

  loadUpdatedData() {
    this.getUserInfo();
    this.getCartItems();
    this.getHaveItems();
    this.getHaveHtkItems();
    this._cartService.getCartData().then(data=> {
      let rxCounter: number = 0;
      this.cart = data.cart;
      this.getDiscountFromCart();
      this.setStoreCreditFromCart();

      if (this.isKioskMode)
        this.cart = this._cartService.getCartDataFromLocalStorage().cart;

      this.productList = data.selectedItems.map((element: any)=> {
        if (element.lens_type === "RX_SUN_LENS") {
          element.rxIndex = rxCounter++;
        }
        return element;
      });
    }, e => {
    });
  }

  protected setStoreCreditFromCart() {
    if (this.cart && this.cart.store_credit) {
      this.store_credit_used = new Array(this.cart.store_credit.length);
      for (var iLoop = 0; iLoop < this.cart.store_credit.length; iLoop++) {
        this.store_credit_used[iLoop] = true;
        if ((+this.cart.store_credit[iLoop].used_now <= 0) || (this.cart.store_credit[iLoop].hasOwnProperty('use_now') && !this.cart.store_credit[iLoop].use_now))
          this.store_credit_used[iLoop] = false;
      }
    }

  }

  protected getDiscountFromCart() {
    let discountApplied = '';
    this.discount = 0;
    if (this.cart && this.cart.totals && this.cart.totals.discount_code_amounts) {
      for (let discount of this.cart.totals.discount_code_amounts) {
        this.discount += +discount.amount_redeemed;
        discountApplied += ' "' + discount.discount_code + '" ($' + discount.amount_redeemed + ' off)';
      }
    }
    this.promoCodeAppliedMessage = '';
    if (discountApplied && discountApplied.length > 0)
      this.promoCodeAppliedMessage = 'Applied Discount' + discountApplied;
  }

  /**
   * getCartItems function
   * @returns {any}
   */

  getCartItems() {
    this._cartService.getCartData().then(data=> {
      this.cartItems = data.selectedItems || null;
      this.displayCustomizedProducts = [];
      this.displayNonCustomizedProducts = [];
      if (this.cartItems) {
        this.cartItems.forEach((elem)=> {
          if (elem && elem.rx && elem.item_type != 'home_trial_kit') {
            Object.keys(elem.rx).forEach((item)=> {
              this.displayCustomizedProducts.push(elem.rx[item]);
            });
          }
          if (elem && !elem.rx && elem.item_type != 'home_trial_kit') {
            for (let cursor = 0; cursor < elem.qty; cursor++) {
              this.displayNonCustomizedProducts.push(elem);
            }
          }
        });
        this.haveHtkItems = this.getIsHaveHtkItems(this.cartItems);
        this.haveItems = this.getIsHaveItems(this.cartItems);
      }
    }, e => {
    });
  }

  /**
   * getHaveItems$ function
   * @returns {any}
   */

  getHaveItems() {
    let sub: any = this._cartService.haveItems$.subscribe(have=> this.haveItems = have);
    this.subs.push(sub);
  }

  /**
   * getHaveHtkItems$ function
   * @returns {any}
   */

  getHaveHtkItems() {
    let sub: any = this._cartService.haveHtkItems$.subscribe(have=> this.haveHtkItems = have);
    this.subs.push(sub);
  }

  /**
   * getIsHaveItems function
   * @param cart
   * @returns {bool}
   */

  private getIsHaveItems(items: any): number {
    let cartItems = items.filter((item)=>item.item_type != 'home_trial_kit');
    return cartItems && cartItems.length;
  }

  /**
   * getIsHaveHtkItems function
   * @param cart
   * @returns {bool}
   */

  private getIsHaveHtkItems(items: any): number {
    let cartHtkItems = items.filter((item)=>item.item_type == 'home_trial_kit');
    return cartHtkItems && cartHtkItems.length;
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this._notifyHeader.currentPage(true);
    if (this._cookie.getCookie(AppConstants.CHECKOUT_TYPE) == 'customer') {
      this.isGuest = false;
    } else {
      this.isGuest = true;
    }
    this.updateSavedCardStatus(false);
    changeStatus();
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this._notifyHeader.currentPage(false);
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }

  /**
   * getKiosks() used for get kiosk mode data
   */
  getKiosks() {
    if (this._cookie.getCookie("kioskId"))
      this.isKioskMode = true;
  }


  /**
   * get user info function
   */
  getUserInfo() {
    this._userService.getUserInfo()
    .then((userInfo: any) => {
      this.userInfo = {};
      this.userInfo = userInfo;
      this.storedCardList = userInfo.credit_cards;
    }, e=> {
    });
  }

  /**
   * isCustomizeLenses Function
   *
   */
  isCustomizeLenses() {
    this._cartService.getCartData().then(cartData => {
      cartData.selectedItems.map((item) => {
        if (this.checkIsCustomizable(item.lens_type)) {
          this.haveCustomizeLenses = true;
        }
      })
    }, e => {
    });
  }


  checkIsCustomizable(lens_type) {
    let NON_CUSTOMIZABLE_LENS = {
      ONHAND_NO_LENS: true,
      ONHAND_NON_RX_SUN_LENS: true,
      NO_LENS: true,
      PLANO_LENS: true
    };

    if (!this.isKioskMode)
      NON_CUSTOMIZABLE_LENS['NON_RX_SUN_LENS'] = true;

    return ((!NON_CUSTOMIZABLE_LENS[lens_type]) || false);
  }

  errorFlag(cardIndex) {
    if (!isNaN(cardIndex)) {
      this.cardErrorMessage = '';
    } else {
      this.cardErrorMessage = 'Please select an Card';
    }
  }

  useStoreCredit(i, credit_id) {
    let cartId = this.cart.cart_id;

    for (let credit of this.cart.store_credit) {
      if (credit.credit_id === credit_id) {
        credit.use_now = !this.store_credit_used[i];
        break;
      }
    }
    this._cartService.updateCart(cartId, this.cart).then(
      data => {
        let localCart = {};
        this._cartService.getCartData().then(dataLocal=> {
          localCart = dataLocal;
          this.cart = data['cart'];
          localCart['cart'] = this.cart;
          this._cartService.writeCartToLocalStorage(localCart);
          this.getDiscountFromCart();
          this.setStoreCreditFromCart();
        }, e => {
        });
        this.enableLoader = false;
      },
      error => {
        this.enableLoader = false;
        if (error.code === "E_CART_UNAVAILABLE") {
          this._cartService.removeCache();
          this._router.navigate(['/']);
        }
      });
  }
}
