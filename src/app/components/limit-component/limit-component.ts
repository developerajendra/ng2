/**
 * Importing core components
 */

import {Component, OnInit, Input} from '@angular/core';


/**
 * @Component limit component
 */

@Component({
  selector:'limit-popup',
  templateUrl:"limit-component.html",
  styleUrls:['limit-component.scss'],
})


/**
 * Export class (limitComponent) for limit-component
 */

export class LimitComponent implements OnInit{


  @Input() modalId:string;
  @Input() message:string;
  
  /**
   * constructor() used to initialize class level variables
   */

  constructor() {
  }
  /**
  * ngOnInit function
  */

  ngOnInit() {
  }
}
