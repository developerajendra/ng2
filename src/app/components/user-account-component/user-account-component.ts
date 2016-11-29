/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy} from "@angular/core";
import {Router} from "@angular/router";

declare var window: any;

/**
 * @Component for user-account-component
 */

@Component({
  selector: 'user-account',
  templateUrl: 'user-account-component.html',
  styleUrls: ['user-account-component.scss']
})

/**
 * Exporting class (UserAccountComponent) from user-account-component
 */

export class UserAccountComponent implements OnInit, OnDestroy {

  activeTab: any = null;
  subs: any = [];

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _router: Router) {
    this.switchPages();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    let sub: any = this._router.events.subscribe((event)=> {
      this.switchPages();
    });
    this.subs.push(sub);
  }

  /**
   * ngOnDestroy the function
   */

  ngOnDestroy(){
    this.subs.forEach((sub:any)=> sub.unsubscribe());
  }

  /**
   * Switching the tabs
   */
  switchPages(){
    switch (window.location.pathname.split('/')[2]) {
      case'order-history':
        this.activeTab = {1: true};
        break;
      case'address':
        this.activeTab = {2: true};
        break;
      case'prescriptions':
        this.activeTab = {3: true};
        break;
      case'ditto':
        this.activeTab = {4: true};
        break;
      default :
        this.activeTab = {0: true};
        break;
    }
  }

  /**
   * changeImage() used change the Image
   * @param index
   */

  changeActiveTab(index) {
    this.activeTab = {};
    this.activeTab[index] = true;
  }
}
