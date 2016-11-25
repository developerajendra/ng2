/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy} from '@angular/core';


/**
 * Importing custom services
 */

import {MessageService, CartService} from '../../services';

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for must-haves-component
 */

@Component({
  selector: 'must-haves',
  templateUrl: 'must-haves-component.html',
  styleUrls: ['must-haves-component.scss']
})

/**
 * Exporting class (MustHavesComponent) from must-haves-component
 */

export class MustHavesComponent implements OnInit, OnDestroy {

  subs:any = [];
  modalId:string = 'myModal';
  limitMessage:string = '';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _messageService:MessageService, private _cartService:CartService) {

  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    changeStatus();
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub:any)=> sub.unsubscribe());
  }

  addToBagModel() {
    // this._cartService.isIteamLimitExceed(this.productId);
    this._messageService.setMessage("To order more than 5 pairs, please call us at 888-509-5499");

    let sub:any = this._cartService.haveProductLimitExceed$
      .subscribe(
        data => {
        if (data) {
          this.modalId = "limitModal";
        } else {
          this.modalId = "myModal";
        }
      },
        error => {/*console.log(error)*/}
    );
    this.subs.push(sub);
  }

}
