import {Component, Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ROUTER_DIRECTIVES, Router} from '@angular/router';
import { StorageService } from '../../services';
import {AppConstants} from '../../constants/app-constants'


@Component({
  moduleId: module.id,
  directives: [ROUTER_DIRECTIVES]
})
export class CheckoutRouteValidation implements CanActivate {
  constructor(private router:Router, private _storageService:StorageService) {
  }

  canActivate(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<boolean> | boolean {
    try {
      var _cart = this._storageService.getItem(AppConstants.CART, null);
      if (_cart.selectedItems && _cart.selectedItems.length > 0) {
        return true
      } else {
        this.router.navigate(['/']);
        return false;
      }
    } catch (e) {
      this.router.navigate(['/']);
    }
  }

}
