/**
 * Importing core components
 */

import {Component, OnInit} from "@angular/core";
import {FormBuilder, Validators} from "@angular/common";
import {UserService, CookiesService, ValidationService, StaticDataService} from "../../services";
import {Router} from "@angular/router";
import {ControlMessages} from "../control-messages-component";
import {BannerComponent} from "../banner-component";

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for forgot-password-component
 */

@Component({
  moduleId: module.id,
  selector: 'forgot-password',
  templateUrl: 'forgot-password-component.html',
  styleUrls: ['forgot-password-component.css'],
  directives: [ControlMessages, BannerComponent]
})

/**
 * Exporting class (forgotPasswordComponent) from forgot-password-component
 */

export class forgotPasswordComponent implements OnInit {
  forgotPasswordForm: any;
  attemptSubmit: boolean = false;
  submitted: boolean = false;
  disabled: boolean = false;
  validationMessages: any = null;
  height: number = 722;

  /**
   * constructor() used to initialize class level variables
   * @param _formBuilder
   * @param _userService
   * @param _cookie
   */

  constructor(private _staticDataService: StaticDataService, private _formBuilder: FormBuilder, private _userService: UserService,
              private _cookie: CookiesService, private _router: Router) {
    this._staticDataService.getDataValidation().then(data=>this.validationMessages = data.auth.validation.reset, error=> {/*console.log(error)*/
    });
    this.forgotPasswordForm = this._formBuilder.group({
      'email': ['', Validators.compose([Validators.required, ValidationService.emailValidator])]
    });
    this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 850) - 220;
  }

  onResize(event) {
    if (event && event.type === 'resize')
      this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 850) - 220;
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    /* this._userService.getAuthCookie().then(
     isLoggedIn=> {
     if (isLoggedIn) this._router.navigate(['/']);
     changeStatus();
     }, error=> {
     // console.log(error);
     changeStatus();
     }
     );*/
    changeStatus();
  }

  /**
   * Submit() used to submit the form
   */

  submit() {
    if (this.forgotPasswordForm.dirty && this.forgotPasswordForm.valid) {
      this.disabled = true;
      this._userService.forgotPassword(this.forgotPasswordForm.value.email).then(data => {
          this.disabled = false;
          this.submitted = true;
        },
        error => {
          this.disabled = false;
          this.submitted = true;
        }
      );
    } else {
      this.attemptSubmit = true;
    }
  }

}
