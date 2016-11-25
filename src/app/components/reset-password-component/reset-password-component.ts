/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';
import {FormBuilder, Validators, ControlGroup} from '@angular/common';
import {UserService, ValidationService, StaticDataService} from '../../services';

/**
 * Importing custom components
 */

import {ControlMessages} from "../control-messages-component";

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for reset-password-component
 */

@Component({
  moduleId: module.id,
  selector: 'reset-password',
  templateUrl: 'reset-password-component.html',
  styleUrls: ['reset-password-component.css'],
  directives: [ROUTER_DIRECTIVES, ControlMessages]
})

/**
 * Exporting class (resetPasswordComponent) from reset-password-component
 */

export class resetPasswordComponent implements OnInit {

  resetPasswordForm:any;
  emailExistError:boolean = false;
  attemptSubmit:boolean = false;
  submitted:boolean = false;
  validationMessages:any = null;
  pageTitle:any = null;

  /**
   * constructor() used to initialize class level variables
   * @param _formBuilder
   * @param _userService
   * @param _router
   * @param _route
   */

  constructor(private _staticDataService:StaticDataService, private _formBuilder:FormBuilder, private _userService:UserService, private _router:Router, private _route:ActivatedRoute) {
    this._staticDataService.getDataValidation().then(data=> {
      this.validationMessages = data.auth.validation.reset, this.pageTitle = data.auth
    }, error=>{});
    this.resetPasswordForm = this._formBuilder.group({
      'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])],
      matchingPassword: _formBuilder.group({
        password: ['', Validators.compose([Validators.required, Validators.minLength(7)])],
        confirm_password: ['', Validators.required]
      }, {validator: ValidationService.areEqual}),
    });
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    changeStatus();
  }

  /**
   * Submit() used to submit the form
   */

  submit() {
    let token = this._route.snapshot.params['token'];
    if (token) {
      if (this.resetPasswordForm.dirty && this.resetPasswordForm.valid) {
        let userInfo = {
          email: this.resetPasswordForm.value.email,
          password: this.resetPasswordForm.value.matchingPassword.password,
          token: token
        };
        this._userService.resetPassword(userInfo).then(
          data => {
            this.submitted = true;
            this._router.navigate(['auth/login/']);
          },
          error => {
            this.emailExistError = true;
          });
      } else {
        this.attemptSubmit = true;
      }
    } else {
      this._router.navigateByUrl('/');
    }
  }
}
