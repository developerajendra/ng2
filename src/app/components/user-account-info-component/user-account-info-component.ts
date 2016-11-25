/**
 * Importing core components
 */

import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services";
import {Title} from "@angular/platform-browser";
import {TenantConstant} from "../../constants/tenant";

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for user-account-info-component
 */

@Component({
  selector: 'user-account-info',
  templateUrl: 'user-account-info-component.html',
  styleUrls: ['user-account-info-component.scss']
})

/**
 * Exporting class (UserAccountInfoComponent) from user-account-info-component
 */

export class UserAccountInfoComponent implements OnInit {

  isLoading: boolean = false;
  editableFild: string = null;
  userInfo: any = null;
  payload: any = null;
  passwordError: any = '';
  emailError: any = '';
  pageTitle: string = 'My Account';

  /**
   * constructor() used to initialize class level variables
   * @param _userService
   */

  constructor(protected _userService: UserService, protected _title: Title) {
    this.getUserInfo();
    _title.setTitle(TenantConstant.DOMAIN_NAME + ' - ' + this.pageTitle);
  }

  /**
   * editUser function used to update
   */

  editUser(name) {
    this.editableFild = name;
    this.payload = JSON.parse(JSON.stringify(this.userInfo));
  }

  /**
   * editUser function used to toggle rows
   */

  saveUser() {
    this.isLoading = true;
    if (this.editableFild !== 'password') {
      delete this.payload.password;
    } else if (!this.payload.password || (this.payload.password && this.payload.password.length < 6)) {
      this.passwordError = 'Password must be at least 6 characters.';
      this.isLoading = false;
      return;
    }

    if (!this.payload.email || (this.payload.email && !this.payload.email.match(/\S+@\S+\.\S+/))) {
      this.emailError = 'Please enter a valid email.';
      this.isLoading = false;
      return;
    }

    this._userService.updateUser(this.userInfo.email, this.payload).then(data => {
      this.userInfo = data;
      this.editableFild = null;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.editableFild = null;
      this.getUserInfo();
    });
  }

  /**
   * (click)="editUser('name') function
   */

  ngOnInit() {
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    this._userService.getUserInfo().then(
      data => {
        this.userInfo = data;
        changeStatus();
      }, error => {
        changeStatus();
      });
  }
}
