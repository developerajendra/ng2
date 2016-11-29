/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy, OnChanges, SimpleChanges} from "@angular/core";
import {AppConstants} from "../../constants/app-constants";
import {FormBuilder, Validators, Control} from "@angular/common";
import {ControlMessages} from "../control-messages-component";
import {Router} from "@angular/router";
import {UserService, CartService, ProductService, CookiesService, StaticDataService, NotifyService, OrderService} from "../../services";
import {BreadCrumbComponent} from "../breadcrumb-component";
import {ToolTipComnponent} from "../tool-tip-component";
import {LoaderComponent} from "../loader-component";
import {TenantConstant} from "../../constants/tenant";


declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for checkout-component
 */

@Component({
  selector: 'check-out',
  templateUrl: 'checkout-component.html',
  styleUrls: ['checkout-component.scss'],
  directives: [ToolTipComnponent, ControlMessages, BreadCrumbComponent, LoaderComponent]
})

/**
 * Exporting class (CheckoutComponent) from checkout-component
 */

export class CheckoutComponent implements OnInit, OnDestroy {

  protected isLoggedIn: boolean = true;
  hasAddresses: boolean = false;
  isCustomerPickup: boolean = false;
  isSelectingExisting: boolean = false;
  subscriptionOptIn: boolean = true;

  isGuest:boolean = false;
  showPreOrder:boolean = false;
  subs: any = [];
  shippingForm: any;
  addressIndex: number;
  disabled: boolean = false;
  attemptSubmit: boolean = false;
  rxItems: any = null;
  countriesData: any = [];
  bag: any = [];
  userInfo: any = null;
  cartItems: any = null;
  bagTotal: any = 0;
  cartItemsCount: any = 0;
  cartData: any = 0;
  haveCustomizeLenses: any = false;
  sameBillingAddress: any = true;
  formObj: any = {};
  isKioskMode: boolean = false;
  isAddressSaved: String = 'undefined';
  validationMessages: any = null;
  customerValidationMessages: any = null;
  haveItems: number = 0;
  haveHtkItems: number = 0;
  staticMsgs: any = null;
  displayCustomizedProducts: any = [];
  displayNonCustomizedProducts: any = [];
  totalCustomize: any = 0;
  totalNonCustomize: any = 0;
  kioskAddress: any = [];
  isCustomerPickUp: boolean = false;
  kioskRx: any = {};
  isClickedPhone: boolean = false;
  enableLoader: boolean = false;
  enableClick: boolean = false;
  errorMessage: any = '';
  addressErrorMessage: any = '';
  htkErrorMessage: any = '';
  cart: any = {};
  shippingCountry: string = "";
  isToolTipOpen: boolean = false;


  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected _kioskAddress: OrderService, protected _staticDataService: StaticDataService, protected _formBuilder: FormBuilder,
              protected _userService: UserService, protected _cartService: CartService, protected _productService: ProductService,
              protected _router: Router, protected _notifyHeader: NotifyService, protected _cookie: CookiesService) {
    this._staticDataService.getDataValidation().then(data=> {
      this.validationMessages = data.checkout.validation.address;
      this.staticMsgs = data.signIn;
    }, e => {
    });
    this._staticDataService.getDataValidation().then(data=>this.customerValidationMessages = data.checkout.validation.register, error=> {/*console.log(error)*/
    });
    this.isCustomizeLenses();
    this.loadUpdatedData();
    this._cartService.getCounts();
    let cartStorage = this._cartService.getCartDataFromLocalStorage();
    if (cartStorage && cartStorage.cart && (cartStorage.cart.customer_email || cartStorage.cart.customer)) {
      this.showPreOrder = true;
    }
    this.getKiosks();
    this.initShippingForm();
    this.updateAddressStatus(true);
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getCountries();
    this._notifyHeader.currentPage(true);

    this.getKioskAddress();
    changeStatus();
  }

  initShippingForm() {
    this.formObj = {
      'shipping_first_name': new Control(null, Validators.required),
      'shipping_last_name': new Control(null, Validators.required),
      'shipping_address': new Control(null, Validators.required),
      'shipping_address2': new Control(null),
      'shipping_country': new Control('', Validators.required),
      'shipping_city': new Control(null, Validators.required),
      'shipping_state': new Control('', Validators.required),
      'shipping_zip_code': new Control(null, Validators.required),
      'shipping_phone_number': new Control(null, Validators.required),
      'isBillingAddrSame': new Control(true),

      'billing_first_name': new Control(null), // billing address
      'billing_last_name': new Control(null), // billing address
      'billing_address': new Control(null), // billing address
      'billing_address2': new Control(null), // billing address
      'billing_country': new Control(''), // billing address
      'billing_city': new Control(null), // billing address
      'billing_state': new Control(''), // billing address
      'billing_zip_code': new Control(null),// billing address
      'billing_phone_number': new Control(null),// billing address

      'save_address': new Control(''),
      'isAddressSaved': new Control(''),

      'savedAddress': new Control(''),

      'shipping_email': new Control(null),
      'password': new Control(null)
    };
    let _cart: any = this._cartService.getCartDataFromLocalStorage();
    this.shippingForm = this._formBuilder.group(this.formObj);
    this.setupValidators();

    //Check guest user

    if (!this.isKioskMode) {
      if (this._cookie.getCookie(AppConstants.CHECKOUT_TYPE) == 'customer') {
        this.isGuest = false;
        this.shippingForm = this._formBuilder.group(this.formObj);
        this.getUserInfo();
      } else {
        this.isGuest = true;
        this.formObj.password = new Control('', Validators.compose([Validators.required, Validators.minLength(7)]));
        this.shippingForm = this._formBuilder.group(this.formObj);
      }
    } else {
      this.shippingForm = this._formBuilder.group(this.formObj);
    }
  }

  protected setupValidators() {
    this.formObj.shipping_address2.validator = null;
    this.formObj.billing_address2.validator = null;

    if (this.sameBillingAddress) {
      this.formObj.billing_first_name.validator = null;
      this.formObj.billing_last_name.validator = null;
      this.formObj.billing_address.validator = null;
      this.formObj.billing_country.validator = null;
      this.formObj.billing_city.validator = null;
      this.formObj.billing_state.validator = null;
      this.formObj.billing_zip_code.validator = null;
      this.formObj.billing_phone_number.validator = null;
    } else {
      this.formObj.billing_first_name.validator = Validators.required;
      this.formObj.billing_last_name.validator = Validators.required;
      this.formObj.billing_address.validator = Validators.required;
      this.formObj.billing_country.validator = Validators.required;
      this.formObj.billing_city.validator = Validators.required;
      this.formObj.billing_state.validator = Validators.required;
      this.formObj.billing_zip_code.validator = Validators.required;
      this.formObj.billing_phone_number.validator = Validators.required;
    }
    if (!this.isLoggedIn) {
      this.formObj.shipping_email.validator = Validators.required;
      this.formObj.password.validator = Validators.compose([Validators.required, Validators.minLength(7)]);
    } else {
      this.formObj.shipping_email.validator = null;
      this.formObj.password.validator = null;
    }
    if (this.isAddressSaved) {
      this.formObj.shipping_first_name.validator = Validators.required;
      this.formObj.shipping_last_name.validator = Validators.required;
      this.formObj.shipping_address.validator = Validators.required;
      this.formObj.shipping_country.validator = Validators.required;
      this.formObj.shipping_city.validator = Validators.required;
      this.formObj.shipping_state.validator = Validators.required;
      this.formObj.shipping_zip_code.validator = Validators.required;
      this.formObj.shipping_phone_number.validator = Validators.required;
    } else {
      this.formObj.shipping_first_name.validator = null;
      this.formObj.shipping_last_name.validator = null;
      this.formObj.shipping_address.validator = null;
      this.formObj.shipping_country.validator = null;
      this.formObj.shipping_city.validator = null;
      this.formObj.shipping_state.validator = null;
      this.formObj.shipping_zip_code.validator = null;
      this.formObj.shipping_phone_number.validator = null;
    }
    this.formObj.billing_first_name.updateValueAndValidity();
    this.formObj.billing_last_name.updateValueAndValidity();
    this.formObj.billing_address.updateValueAndValidity();
    this.formObj.billing_address2.updateValueAndValidity();
    this.formObj.billing_country.updateValueAndValidity();
    this.formObj.billing_city.updateValueAndValidity();
    this.formObj.billing_state.updateValueAndValidity();
    this.formObj.billing_zip_code.updateValueAndValidity();
    this.formObj.billing_phone_number.updateValueAndValidity();

    this.formObj.shipping_email.updateValueAndValidity();
    this.formObj.password.updateValueAndValidity();

    this.formObj.shipping_first_name.updateValueAndValidity();
    this.formObj.shipping_last_name.updateValueAndValidity();
    this.formObj.shipping_address.updateValueAndValidity();
    this.formObj.shipping_address2.updateValueAndValidity();
    this.formObj.shipping_country.updateValueAndValidity();
    this.formObj.shipping_city.updateValueAndValidity();
    this.formObj.shipping_state.updateValueAndValidity();
    this.formObj.shipping_zip_code.updateValueAndValidity();
    this.formObj.shipping_phone_number.updateValueAndValidity();
  }




  /**
   * Submit shipping function
   */

  submitShippingForm() {

    this.enableLoader = true;
    this.htkErrorMessage = '';
    if (this.haveHtkItems && this.shippingForm.dirty && this.shippingForm.valid && this.shippingForm.value.shipping_country &&
      this.shippingForm.value.shipping_country != 'US') {
      this.htkErrorMessage = 'Currently, we only ship home trial kits inside the US.';
      return;
    }
    if (this.userInfo) {
      this.addressErrorMessage = '';
      if (!this.isAddressSaved && !this.userInfo.addresses[this.addressIndex]) {
        this.addressErrorMessage = 'Please select an Address';
        return;
      }
    }
    this.attemptSubmit = true;
    this._cartService.getCartData().then(cartData => {
      let formData:any;

      if (!this.isAddressSaved && this.userInfo != null && this.userInfo.addresses && this.userInfo.addresses[this.addressIndex]) {
        this.enableLoader = true;
        formData = {
          shipping_address: this.userInfo.addresses[this.addressIndex].address1,
          shipping_address2: this.userInfo.addresses[this.addressIndex].address2,
          shipping_city: this.userInfo.addresses[this.addressIndex].city,
          shipping_country: this.userInfo.addresses[this.addressIndex].country,
          shipping_phone_number: this.userInfo.addresses[this.addressIndex].phone,
          shipping_state: this.userInfo.addresses[this.addressIndex].state,
          shipping_zip_code: this.userInfo.addresses[this.addressIndex].zip,
          shipping_first_name: this.userInfo.addresses[this.addressIndex].name.split(' ')[0] || '',
          shipping_last_name: this.userInfo.addresses[this.addressIndex].name.split(' ')[1] || '',
          isBillingAddrSame: true
        };
        this.updateCartAndUser(cartData, formData);
      }
      else if (this.isCustomerPickUp) {
        this.enableLoader = true;
        formData = {
          shipping_address: this.kioskAddress.address1,
          shipping_address2: this.kioskAddress.address2,
          shipping_city: this.kioskAddress.city,
          shipping_country: this.kioskAddress.country,
          shipping_phone_number: this.kioskAddress.phone,
          shipping_state: this.kioskAddress.state,
          shipping_zip_code: this.kioskAddress.zip,
          shipping_first_name: this.kioskAddress.name.split(' ')[0] || '',
          shipping_last_name: this.kioskAddress.name.split(' ')[1] || '',
          isBillingAddrSame: true
        };

        this.updateCartAndUser(cartData, formData);
      }
      else if (this.shippingForm.dirty && this.shippingForm.valid && !this.htkErrorMessage) {
        formData = this.shippingForm.value;
        this.enableLoader = true;
        if (!this.isKioskMode) {
          if (this.isGuest) {
            if (formData.password) {
              let payload = {
                email: cartData.cart.customer_email,
                password: formData.password,
                first_name: formData.shipping_first_name,
                last_name: formData.shipping_last_name || ''
              };
              this._userService.registerUser(payload).then(user=> {
                this._userService.authUser(payload).then(tokenInfo=> {
                  this._cookie.setToken(tokenInfo);
                  this.userInfo = user;
                  this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(user), null);
                  this._userService.setIsLoggedIn$(true);
                  this.updateCartAndUser(cartData, formData);
                }, error=> {
                  this.enableLoader = false;
                });
              }, e => {
                this.enableLoader = false;
              });
            }
          } else {
            this.updateCartAndUser(cartData, formData);
          }
        } else {
          this.updateCartAndUser(cartData, formData);
        }
      } else {
        this.enableLoader = false;
        window.scrollTo(0, 0);
      }
    }, e => {
      this.enableLoader = false;
    });
    return false;
  }

  /**
   * bagItemCount function
   * @returns {number}
   */

  loadUpdatedData() {
    this.getCartItemsCount();
    this.getCartItems();
    this.getBagTotal();
    this.getCartData();
    this.getHaveItems();
    this.getHaveHtkItems();
    this._cartService.getCartData().then(data=> {
      this.cart = data.cart;
    }, e => {
    });
  }

  /**
   * getBagTotal function
   * @returns {any}
   */

  getBagTotal() {
    let sub:any = this._cartService.bagTotal$.subscribe(bagTotal => this.bagTotal = bagTotal);
    this.subs.push(sub);
  }

  /**
   * getCartItemsCount function
   * @returns {number}
   */

  getCartItemsCount() {
    let sub: any = this._cartService.cartItemsCount$.subscribe(cartItemsCount => {
      this.cartItemsCount = cartItemsCount;
    });
    this.subs.push(sub);
  }

  /**
   * getCartData function
   * @returns {number}
   */

  getCartData() {
    let sub: any = this._cartService.cartData$.subscribe(cartData => {
      this.cartData = cartData
    });
    this.subs.push(sub);
  }

  /**
   * getCartItems function
   * @returns {any}
   */

  getCartItems() {
    this.cartItems = this._cartService.getCartDataFromLocalStorage().selectedItems;

    this.displayCustomizedProducts = [];
    this.displayNonCustomizedProducts = [];

    this.totalCustomize = 0;
    this.totalNonCustomize = 0;

    this.cartItems.forEach((elem)=> {
      if (elem && elem.rx && elem.item_type != 'home_trial_kit') {
        Object.keys(elem.rx).forEach((item)=> {
          this.totalCustomize += elem.rx[item].price;
          this.displayCustomizedProducts.push(elem.rx[item]);
        });
      }
      if (elem && !elem.rx && elem.item_type != 'home_trial_kit') {
        for (let cursor = 0; cursor < elem.qty; cursor++) {
          this.totalNonCustomize += elem.prices[elem.lens_type + '_PRICE'];
          this.displayNonCustomizedProducts.push(elem);
        }
      }
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
   * deleteItem function
   * deleteItem() used to remove a item from cart/bag
   * @param product_id
   */

  deleteItem(product) {
    this._cartService.deleteItem(product)
    .then(() => {
      let _cart = this._cartService.getCartDataFromLocalStorage();
      this.cartItems = _cart && _cart.selectedItems || null;
      this.bagTotal = _cart && _cart.cart && _cart.cart.totals && _cart.cart.totals.subtotal || 0;
      if (!this.cartItemsCount) {
        this._router.navigate(['/checkout/continue-shopping']);
      }
    }, e => {
    });
  }

  /**
   * isCustomizeLenses Function
   *
   */
  isCustomizeLenses() {
    this._cartService.getCartData().then(cartData => {
      cartData.selectedItems.map((item) => {
        if (item && this.checkIsCustomizable(item.lens_type)) {
          this.haveCustomizeLenses = true;
        }
      })
    });
  }


  checkIsCustomizable(lens_type) {
    let NON_CUSTOMIZABLE_LENS = {
      ONHAND_NO_LENS: true,
      ONHAND_NON_RX_SUN_LENS: true,
      NO_LENS: true,
      PLANO_LENS: true
    };

    if (!this.isKioskMode) {
      NON_CUSTOMIZABLE_LENS['NON_RX_SUN_LENS'] = true;
    }

    return ((!NON_CUSTOMIZABLE_LENS[lens_type]) || false);
  }


  /**
   * toggleBillingAddress Function
   *
   */
  toggleBillingAddress(event) {
    this.sameBillingAddress = event.target.checked;
    // this.sameBillingAddress = !this.sameBillingAddress;
    this.formObj.isBillingAddrSame = new Control(event.target.checked);
    this.setupValidators();
    this.attemptSubmit = false;
    return this.sameBillingAddress;
  }


  /**
   * getCountries() used to get countries data
   */

  getCountries() {
    let sub: any = this._staticDataService.getCountries().subscribe(data => this.countriesData = data);
    this.subs.push(sub);
  }

  /**
   * updateAddressStatus() used for for address view data
   */

  updateAddressStatus(status) {
    if (status) {
      this.initShippingForm();
      this.isCustomerPickUp = !status;
    } else {
      this.addressIndex = -1;
    }
    this.attemptSubmit = false;
    this.isAddressSaved = status;
    this.enableClick = false;
  }

  /**
   * shipToStore() used for for kiosk mode
   */

  shipToStore(status) {
    this.isAddressSaved = status;
    this.isCustomerPickUp = !status;
    this.enableClick = true;

    this.formObj.shipping_first_name = new Control('');
    this.formObj.shipping_last_name = new Control('');
    this.formObj.shipping_address = new Control('');
    this.formObj.shipping_country = new Control('');
    this.formObj.shipping_city = new Control('');
    this.formObj.shipping_state = new Control('');
    this.formObj.shipping_zip_code = new Control('');
    this.formObj.shipping_phone_number = new Control('');

    this.formObj.billing_first_name = new Control('');
    this.formObj.billing_last_name = new Control('');
    this.formObj.billing_address = new Control('');
    this.formObj.billing_country = new Control('');
    this.formObj.billing_city = new Control('');
    this.formObj.billing_state = new Control('');
    this.formObj.billing_zip_code = new Control('');
    this.formObj.billing_phone_number = new Control('');
    this.shippingForm = this._formBuilder.group(this.formObj);
  }

  /**
   * getKiosks() used for get kiosk mode data
   */
  getKiosks() {
    if (this._cookie.getCookie("kioskId")) {
      this.isKioskMode = true;
    }
    if (!this.isKioskMode) {
      this.getUserInfo();
    }
  }

  private genetateAddressPayload(payload) {
    let billing_address:any = {};
    let shipping_address = {
      address1: payload.shipping_address,
      address2: payload.shipping_address2,
      city: payload.shipping_city,
      country: payload.shipping_country,
      phone: "" + payload.shipping_phone_number,
      state: payload.shipping_state,
      zip: "" + payload.shipping_zip_code,
      name: payload.shipping_first_name + ' ' + payload.shipping_last_name
    };
    if (payload.isBillingAddrSame) {
      billing_address = Object.assign({}, shipping_address);
      delete billing_address.name;
      billing_address['first_name'] = payload.shipping_first_name;
      billing_address['last_name'] = payload.shipping_last_name;
    } else {
      billing_address = {
        address1: payload.billing_address,
        address2: payload.billing_address2,
        city: payload.billing_city,
        country: payload.billing_country,
        phone: "" + payload.billing_phone_number,
        state: payload.billing_state,
        zip: "" + payload.billing_zip_code,
        first_name: payload.billing_first_name,
        last_name: payload.billing_last_name
      }
    }
    return {shipping_address: shipping_address, billing_address: billing_address};
  }

  private updateCartAndUser(cartData, formData) {

    if (!this.userInfo && !this.isKioskMode) {
      console.error('User not found, kindly try again...');
      return;
    }
    let address = this.genetateAddressPayload(formData);
    cartData['cart']['shipping_address'] = address.shipping_address;
    cartData['cart']['payment']['billing_address'] = address.billing_address;
    cartData['cart']['timezone'] = 'America\/New_York';
    if (formData.save_address) {
      let billing_address = JSON.parse(JSON.stringify(address.billing_address));
      delete billing_address.first_name;
      delete billing_address.last_name;
      billing_address.name = address.billing_address.first_name + ' ' + address.billing_address.last_name;
      this.userInfo && this.userInfo.addresses.push(billing_address);
      this._userService.updateUser(this.userInfo.email, this.userInfo).then(data => {
        this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(data), null);
        this.updateCurrentCart(cartData);
      });
    } else {
      this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(this.userInfo), null);
      this.updateCurrentCart(cartData);
    }
  }

  protected updateCurrentCart(_cartData) {
    if (!this.isKioskMode) {
      delete  _cartData.cart['customer'];
      delete  _cartData.cart['rx'];
      _cartData.cart.customer_email = this.userInfo.email;
    }
    this._cartService.setCurrentBag(_cartData).then((cartData: any) => {
      if (cartData.validation && cartData.validation.shipping_address) {
        this.errorMessage = cartData.validation.shipping_address;
        this.enableLoader = false;
        return;
      }
      let promiseArray: any = [];
      cartData && cartData.selectedItems.forEach((item: any)=> {
        item.rx && Object.keys(item.rx).forEach((key: any, index: any)=> {
          if (item.rx[key] && item.rx[key].rx_id) {
            let new_payload:any = {};
            let payload:any = {
              "id": item.rx[key].id || key,
              "doctor_info": {
                "doctor_name": item.rx[key].doctor_info.doctor_name,
                "doctor_phone": JSON.stringify(item.rx[key].doctor_info.doctor_phone),
                "patient_dob": item.rx[key].doctor_info.patient_dob
              },
              "entered_at": item.rx[key].entered_at,
              "friendly_name": item.rx[key].friendly_name,
              "is_high_index": item.rx[key].is_high_index,
              "is_progressive": item.rx[key].is_progressive,
              "left": {
                "axis": +item.rx[key].left.axis || null,
                "cylinder": +item.rx[key].left.cylinder || null,
                "sphere": +item.rx[key].left.sphere || null
              },
              "name_on_rx": item.rx[key].name_on_rx || item.rx[key].patient_name,
              "pd": {
                "bino": +item.rx[key].pd.bino || null,
                "mono_left": +item.rx[key].pd.mono_left || null,
                "mono_right": +item.rx[key].pd.mono_right || null
              },
              "right": {
                "axis": +item.rx[key].right.axis || null,
                "cylinder": +item.rx[key].right.cylinder || null,
                "sphere": +item.rx[key].right.sphere || null
              },
              "rx_type": item.rx[key].rx_type,
              "valid_rx": "NEW"
            };
            if (item.rx[key].rx_file && item.rx[key].rx_file.data) {
              payload['rx_file'] = {
                "data": item.rx[key].rx_file.data,
                "filename": item.rx[key].rx_file.filename,
                "content_type": item.rx[key].rx_file.content_type
              };
            } else if (item.rx[key].rx_file && typeof item.rx[key].rx_file === 'string') {
              payload.rx_file = item.rx[key].rx_file;
            }

            if (!this.isKioskMode) {
              new_payload = {};
              switch (payload.rx_type) {
                case 'RX_SEND_LATER':
                  new_payload['pd'] = {
                    "bino": payload.pd.bino,
                    "mono_left": payload.pd.mono_left,
                    "mono_right": payload.pd.mono_right
                  };
                  new_payload['rx_type'] = 'RX_SEND_LATER';
                  break;

                case 'RX_CALL_DOCTOR':
                  new_payload['pd'] = {
                    "bino": payload.pd.bino,
                    "mono_left": payload.pd.mono_left,
                    "mono_right": payload.pd.mono_right
                  };
                  new_payload['doctor_info'] = {
                    "doctor_name": payload.doctor_info.doctor_name,
                    "doctor_phone": payload.doctor_info.doctor_phone,
                    "patient_dob": payload.doctor_info.patient_dob
                  };
                  new_payload['rx_type'] = 'RX_CALL_DOCTOR';
                  new_payload['name_on_rx'] = payload.name_on_rx;
                  break;

                case 'RX_ENTER_NOW':
                  new_payload['pd'] = {
                    "bino": payload.pd.bino,
                    "mono_left": payload.pd.mono_left,
                    "mono_right": payload.pd.mono_right
                  };
                  new_payload['left'] = {
                    "sphere": payload.left.sphere,
                    "cylinder": payload.left.cylinder,
                    "axis": payload.left.axis
                  };
                  new_payload['right'] = {
                    "sphere": payload.right.sphere,
                    "cylinder": payload.right.cylinder,
                    "axis": payload.right.axis
                  };
                  new_payload['rx_type'] = 'RX_ENTER_NOW';
                  new_payload['name_on_rx'] = payload.name_on_rx;
                  break;

                case 'RX_UPLOAD':
                  new_payload['pd'] = {
                    "bino": payload.pd.bino,
                    "mono_left": payload.pd.mono_left,
                    "mono_right": payload.pd.mono_right
                  };
                  new_payload.rx_file = payload.rx_file;
                  new_payload['rx_type'] = 'RX_UPLOAD';
                  new_payload['name_on_rx'] = payload.name_on_rx;
                  break;

                case 'STANDARD_INDEX_LENS':
                case 'RX_READING':
                  new_payload['pd'] = {
                    "bino": null,
                    "mono_left": null,
                    "mono_right": null
                  };
                  new_payload['left'] = {
                    "sphere": payload.left.sphere,
                    "cylinder": 0,
                    "axis": 0
                  };
                  new_payload['right'] = {
                    "sphere": payload.right.sphere,
                    "cylinder": 0,
                    "axis": 0
                  };
                  new_payload['rx_type'] = 'RX_READING';
                  new_payload['name_on_rx'] = payload.name_on_rx;
                  break;
              }
              let p = new Promise((resolve, reject)=> {
                if (item.rx[key].isExistingRx) {
                  item.rx[key] = Object.assign({}, item.rx[key], JSON.parse(JSON.stringify(payload)));
                  resolve(payload.id);
                } else {
                  this._userService.createRxObject(new_payload).then(data=> {
                    item.rx[key] = Object.assign({}, item.rx[key], JSON.parse(JSON.stringify(data)));
                    resolve(data.id);
                  }, e=> {
                    reject(e)
                  });
                }
              });
              promiseArray.push(p);
            } else {
              if (payload.rx_type === "ONHAND_NON_RX_SUN_LENS") {
                delete payload.id;
              } else {
                this.kioskRx[key] = JSON.parse(JSON.stringify(payload));
                delete this.kioskRx[key].id;
              }
              item.rx[key] = Object.assign({}, item.rx[key], JSON.parse(JSON.stringify(payload)));
            }
          }
        })
      });
      Promise.all(promiseArray).then(values => {
        this._cartService.writeCartToLocalStorage(cartData);
        this._cartService.updateItemWithRxId(cartData).then(data => {
          if (this.isKioskMode) {
            delete  cartData.cart.customer_email;
            cartData.cart.customer = cartData.cart.customer || {};
            cartData.cart.customer.first_name = this.kioskAddress.name.split(' ')[0] || '';
            cartData.cart.customer.last_name = this.kioskAddress.name.split(' ')[1] || '';
            cartData.cart.customer.roles = ["customer"];
            cartData.cart.customer.marketing = {
              "email_opt_in": true
            };
            cartData.cart.customer.ditto = {
              "ditto_id": ""
            };
            cartData.cart.kiosk_id = this._cookie.getCookie("kioskId") || null;
            cartData.cart.rx = this.kioskRx;
            cartData.cart.customer.guest = true;
            this._cartService.writeCartToLocalStorage(cartData);
            this._cartService.updateCart(cartData.cart.cart_id, cartData.cart).then(() => {
              this._router.navigate(['/checkout/payment']);
            }, error=> {
              this.enableLoader = false;
              if (error.code === "E_CART_UNAVAILABLE") {
                this._cartService.removeCache();
                this._router.navigate(['/']);
              }
            });
          } else {
            this._router.navigate(['/checkout/payment']);
          }
        }, error => {
          if (error.code === "E_CART_UNAVAILABLE") {
            this._cartService.removeCache();
            this._router.navigate(['/']);
            this.enableLoader = false;
          }
        });
      });
    }, error=>this.enableLoader = false);
  }

  /**
   * get user info function
   */
  getUserInfo() {
    this._userService.getUserInfo()
      .then((userInfo:any) => {
        this.userInfo = {};
        this.userInfo = userInfo;
        if (!userInfo.addresses.length) {
          this.showPreOrder = false;
        }
      });
  }

  /**
   * getKioskAddress function
   */
  getKioskAddress() {
    var kioskId = this._cookie.getCookie("kioskId");
    this._kioskAddress.getKioskMode("store_locations").then((data) => {
      for (var d in data) {
        if (data[d].kiosk_id == kioskId) {
          this.kioskAddress = data[d].address;
        }
      }
    }, e => {
    })
  }

  /**
   * toggleWhyPhone() why phone tooltip
   */
  toggleWhyPhone() {
    if (!this.isClickedPhone) {
      setTimeout(()=> {
        this.isClickedPhone = false;
      }, 100);
    }
    this.isClickedPhone = true;
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this._notifyHeader.currentPage(false);
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }

  errorFlag(addressIndex) {
    if (!isNaN(addressIndex)) {
      this.addressErrorMessage = '';
    } else {
      this.addressErrorMessage = 'Please select an Address';
    }
    this.errorMessage = '';
  }

  resetShippingStateValue() {
    this.shippingForm.controls['shipping_state'].updateValue('');
  }
}
