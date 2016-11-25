/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';

/**
 * Importing custom components
 */
import {BannerComponent} from '../banner-component';
import {StaticDataService} from '../../services';

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for press-component
 */

@Component({
  moduleId:module.id,
  selector:"quality",
  templateUrl:"quality-component.html",
  styleUrls:["quality-component.css"],
  directives: [BannerComponent]
})

/**
 * Exporting class (QualityComponent) from quality-component
 */

export class QualityComponent implements OnInit{

  private data:any = [];

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private quality:StaticDataService){

  }
  /**
   * OnInit function
   */

  ngOnInit(){
    this.getQuality();
    window.scrollTo(0, 0);
  }

  /**
   * getQuality() used to get faq data
   */
  getQuality(){
    this.quality.getQuality()
      .then((data)=>{
        this.data = data;
        changeStatus();
      }, error => {
        changeStatus();
      }
    )
  }

}
