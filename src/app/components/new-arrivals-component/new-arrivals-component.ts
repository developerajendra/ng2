/**
 * Importing core components
 */

import {Component} from '@angular/core';
import {ProductListingComponent} from '../product-listing-component';


declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}


/**
 * @Component for new-arrivals-component
 */

@Component({
  selector: 'new-arrivals',
  templateUrl: 'new-arrivals-component.html',
  styleUrls: ['new-arrivals-component.scss'],
  directives: [ProductListingComponent]
})

/**
 * Exporting class (NewArrivalsComponent) from new-arrivals-component
 */

export class NewArrivalsComponent {

  /**
   * constructor() used to initialize class level variables
   */

  constructor() {

    window.setTimeout(5000, changeStatus());

  }

}
