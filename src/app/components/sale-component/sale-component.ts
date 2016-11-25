/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for sale-component
 */

@Component({
  selector: 'sale',
  templateUrl: 'sale-component.html',
  styleUrls: ['sale-component.scss']
})

/**
 * Exporting class (SaleComponent) from sale-component
 */

export class SaleComponent implements OnInit {

  /**
   * constructor function
   */

  constructor() {
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    changeStatus();
  }

}
