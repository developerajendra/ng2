/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';

/**
 * Importing custom components
 */
import {StaticDataService} from '../../services';

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for press-component
 */

@Component({
  selector: "press",
  templateUrl: "press-component.html",
  styleUrls: ["press-component.scss"]
})

/**
 * Exporting class (PressComponent) from press-component
 */

export class PressComponent implements OnInit {

  private data:any = [];

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private press:StaticDataService) {

  }

  /**
   * OnInit function
   */

  ngOnInit() {
    this.getPress();
    window.scrollTo(0, 0);
  }

  /**
   * getPress() used to get faq data
   */

  getPress() {
    this.press.getPress()
      .then((data)=> {
          this.data = data;
          changeStatus();
        }, error => {
          changeStatus();
        }
      )
  }

}
