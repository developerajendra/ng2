/**
 * Importing core components
 */

import {Component, OnInit, Input} from "@angular/core";

/**
 * @Component for tool-tip component
 */

@Component({
  moduleId:module.id,
  selector:"tool-tip",
  templateUrl:"tool-tip-component.html",
  styleUrls:["tool-tip-component.css"]
})

/**
 * Exporting class ToolTipComnponent
 */

export class ToolTipComnponent implements OnInit{

  isClickedPhone:boolean = false;
  @Input() title:any;
  @Input() text:any;

  /**
   * Constructor class
   */
  constructor(){

  }

  /**
   * ngOnInit for intial load
   */
  ngOnInit(){

  }

  /**
   * toggleWhyPhone() why phone tooltip
   */
  toggleWhyPhone() {
    if(!this.isClickedPhone){
      setTimeout(()=> {
        this.isClickedPhone = false;
      }, 3000);
    }
    this.isClickedPhone = true;

  }

}
