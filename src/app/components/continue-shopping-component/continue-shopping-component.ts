/**
 * Importing core components
 */

import {Component} from "@angular/core";
import {ActivatedRoute, Router} from '@angular/router';


/**
 * @Component
 */

@Component({
  selector:'continue-shopping',
  templateUrl:'continue-shopping-component.html',
  styleUrls:['continue-shopping-component.scss']
})

/**
 * ContinueShoppingComponent class
 */

export class ContinueShoppingComponent {

  /**
   * constructor ()
   */

  constructor(private _router:Router){

  }
}
