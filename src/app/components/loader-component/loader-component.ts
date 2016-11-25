/**
 * Importing core components
 */

import {Component, OnInit, Input} from "@angular/core";

/**
 * @Component - loader component
 */

@Component({
  moduleId:module.id,
  selector:"loader",
  templateUrl:"loader-component.html",
  styleUrls:["loader-component.css"]
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
