/**
 * Importing core components
 */

import {Component, OnInit, Input} from "@angular/core";

/**
 * @Component - loader component
 */

@Component({
  selector:"loader",
  templateUrl:"loader-component.html",
  styleUrls:["loader-component.scss"]
})

/**
 * Exporting LoaderComponent class
 */
export  class LoaderComponent implements OnInit {

  @Input() overlay:any;
  
  /**
   * Constructor
   */
  constructor(){

  }


    /**
     * ngOnInit() - When application initialize
     */
  ngOnInit(){

  }
}
