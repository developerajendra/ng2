import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Rx";
import "rxjs/add/operator/map";

/**
 * @Injectable() for notiy service
 */
@Injectable()

export class NotifyService {

  /**
   * class level variables
   */

  private _checkoutPage$: Subject<boolean>;
  private _kioskName$: Subject<string>;
  private _currentPage$: Subject<boolean>;

  /**
   *Constructor function
   */
  constructor() {
    this._checkoutPage$ = <Subject<any>>new Subject();
    this._kioskName$ = <Subject<any>>new Subject();
    this._currentPage$ = <Subject<any>>new Subject();
  }

  /**
   *hideElement$ hide element
   */

  get hideElement$() {
    return this._checkoutPage$.asObservable();
  }

  /**
   *get kioskMode$ to get kioskName
   */

  getKioskMode$() {
    return this._kioskName$.asObservable();
  }

  /**
   *set kioskMode$ to set kioskName
   */

  setKioskMode$(value: string) {
    this._kioskName$.next(value);
  }

  /**
   * currentPage get the current page
   * @parem value:boolean
   */

  currentPage(value: boolean) {
    this._checkoutPage$.next(value);
  }

  /**
   * activePage get the current active page
   * @parem value:any
   */
  activePage(value: any){
    this._currentPage$.next(value);
  }

  /**
   * getCurrentPage set the current active page
   */
  getCurrentPage(){
    return this._currentPage$.asObservable();
  }
}
