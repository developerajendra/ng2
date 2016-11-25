/**
 * Importing core components
 */

import {Component} from "@angular/core";
import {ROUTER_DIRECTIVES, ActivatedRoute, Router} from '@angular/router';


/**
 * @Component
 */

@Component({
  selector:'continue-shopping',
  templateUrl:'continue-shopping-component.html',
  styleUrls:['continue-shopping-component.scss'],
  directives:[ROUTER_DIRECTIVES]
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
