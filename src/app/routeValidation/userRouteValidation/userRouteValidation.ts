/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ROUTER_DIRECTIVES, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';

/**
 * Importing AppConstants
 */

import {AppConstants} from '../../constants/app-constants';

/**
 * Importing custom services
 */

import {CookiesService} from "../../services";

/**
 * @Component for user-route-validation
 */

@Component({
  moduleId:module.id,
  directives:[ROUTER_DIRECTIVES]
})
export class UserRouteValidation implements CanActivate {
  constructor(private _router:Router, private _cookie:CookiesService) {}
  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<boolean> | boolean {
    try {
      var userCookie = this._cookie.getCookie(AppConstants.COOKIE_NAME);
      if (userCookie) {
        return true
      } else {
        this._router.navigate(['/']);
        return false;
      }
    } catch (e) {
      this._router.navigate(['/']);
    }
  }
}
