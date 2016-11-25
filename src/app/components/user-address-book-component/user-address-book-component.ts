/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from "@angular/core";
import {FormBuilder, Validators} from "@angular/forms";
import {UserService, StaticDataService} from "../../services";
import {ControlMessages} from "../control-messages-component";
import {ToolTipComnponent} from "../tool-tip-component";
import {Title} from "@angular/platform-browser";
import {TenantConstant} from "../../constants/tenant";


/**
 * Global level variable "jQuery"
 */

declare var jQuery: any;

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for user-address-book-component
 */

@Component({
  selector: 'user-address-book',
  templateUrl: 'user-address-book-component.html',
  styleUrls: ['user-address-book-component.scss'],
  directives: [ControlMessages, ToolTipComnponent]
})

/**
 * Exporting class (UserAddressBookComponent) from user-address-book-component
 */

export class UserAddressBookComponent implements OnInit {

  userInfo: any = null;
  isLoading: boolean = false;
  attemptSubmit: boolean = false;
  isEditMode = false;
  addressForm: any = null;
  validationMessages: any = null;
  countriesData: any = null;
  sub: any = null;
  private index: number = 0;
  isToolTipOpen: boolean = false;
  pageTitle: string = 'My Saved Addresses';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected elementRef: ElementRef, protected _staticDataService: StaticDataService, protected _userService: UserService,
              protected _formBuilder: FormBuilder, protected _title: Title) {

    _title.setTitle(TenantConstant.DOMAIN_NAME + ' - ' + this.pageTitle);

    this._staticDataService.getDataValidation().then((data: any)=> {
      this.validationMessages = data.checkout.validation.address;
    }, e => {
    });
    this.getUserInfo();
    this.getCountries();

    this.addressForm = this._formBuilder.group({
      'first_name': ['', Validators.required], // billing address
      'last_name': ['', Validators.required], // billing address
      'address1': ['', Validators.required], // billing address
      'address2': [''], // billing address
      'country': ['', Validators.required], // billing address
      'city': ['', Validators.required], // billing address
      'state': ['', Validators.required], // billing address
      'zip': ['', Validators.required],// billing address
      'phone': ['', Validators.required]// billing address
    });
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    this.isLoading = true;
    this._userService.getUserInfo().then(data => {
      this.isLoading = false;
      this.userInfo = data;
      changeStatus();
    }, error => {
      this.isLoading = false;
      changeStatus();
    });
  }

  /**
   * addAddress() used to add new user address
   */

  addAddress() {
    this.resetForm();
    this.addressForm.controls['first_name'].updateValue('');
    this.addressForm.controls['last_name'].updateValue('');
    this.addressForm.controls['address1'].updateValue('');
    this.addressForm.controls['address2'].updateValue('');
    this.addressForm.controls['country'].updateValue('');
    this.addressForm.controls['city'].updateValue('');
    this.addressForm.controls['state'].updateValue('');
    this.addressForm.controls['zip'].updateValue('');
    this.addressForm.controls['phone'].updateValue('');
    this.isEditMode = false;
    this.attemptSubmit = false;
  }

  /**
   * editAddress() used to update the user address info
   *@param index
   */

  editAddress(index) {
    this.index = index;
    this.attemptSubmit = false;
    let selectedAddress = this.userInfo.addresses[index];
    this.addressForm.controls["first_name"].updateValue(selectedAddress.name.split(" ")[0]);
    this.addressForm.controls["last_name"].updateValue(selectedAddress.name.split(" ")[1]);
    this.addressForm.controls["address1"].updateValue(selectedAddress.address1);
    this.addressForm.controls["address2"].updateValue(selectedAddress.address2);
    this.addressForm.controls["country"].updateValue(selectedAddress.country);
    this.addressForm.controls["city"].updateValue(selectedAddress.city);
    this.addressForm.controls["state"].updateValue(selectedAddress.state);
    this.addressForm.controls["zip"].updateValue(selectedAddress.zip);
    this.addressForm.controls["phone"].updateValue(selectedAddress.phone);
    this.isEditMode = true;
  }

  /**
   * removeAddress() used to update the user address info
   *@param index
   */

  removeAddress(index) {
    this.isLoading = true;
    this.userInfo.addresses.splice(index, 1);
    this._userService.updateUser(this.userInfo.email, this.userInfo).then(data => {
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.getUserInfo();
    });
  }

  /**
   * saveAddress() used to save the updated user address info
   */

  saveAddress() {
    this.attemptSubmit = true;

    if (!this.addressForm.valid || !this.userInfo) {
      return;
    } else {
      jQuery(this.elementRef.nativeElement).find('#addressModal').modal('hide');
    }

    this.isLoading = true;
    this.addressForm.value.name = this.addressForm.value.first_name + " " + this.addressForm.value.last_name;

    this.addressForm.value.zip = this.addressForm.value.zip.toString();
    this.addressForm.value.phone = this.addressForm.value.phone.toString();

    delete this.addressForm.value.first_name;
    delete this.addressForm.value.last_name;

    if (!this.isEditMode) {
      this.userInfo.addresses = this.userInfo.addresses || [];
      this.userInfo.addresses.push(this.addressForm.value);
    } else {
      this.userInfo.addresses[this.index] = this.addressForm.value;
    }

    this._userService.updateUser(this.userInfo.email, this.userInfo).then(data => {
      this.isLoading = false;
      this.attemptSubmit = false;
      this.isEditMode = false;
    }, error => {
      this.isLoading = false;
      this.attemptSubmit = false;
      this.isEditMode = false;
      // console.log('Error: ', error);
      this.getUserInfo();
    });
  }

  /**
   * close() used to reset info
   */

  close() {
    this.getUserInfo();
    this.attemptSubmit = false;
    this.isEditMode = false;
  }

  openToolTip(){
    this.isToolTipOpen = !this.isToolTipOpen;
  }
  /**
   * getCountries() used to get countries data
   */

  getCountries() {
    this.sub = this._staticDataService.getCountries().subscribe(
      data => this.countriesData = data,
      err => {/*console.log(err)*/
      }
    );
  }

  /**
   * ngOnChanges() used to detect changes
   */

  ngOnChanges(changes) {
    this.sub.unsubscribe();
  }


  /**
   * resetForm() used to reset form values
   */

  private resetForm() {
    Object.keys(this.addressForm.controls).map((key)=> {
      this.addressForm.controls[key]._touched = false;
    });
  }


}
