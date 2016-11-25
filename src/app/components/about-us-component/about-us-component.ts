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
 * @Component about us
 */

@Component({
  selector: 'about-us',
  templateUrl: "about-us-component.html",
  styleUrls: ['about-us-component.scss'],
  directives: [BannerComponent]
})


/**
 * Export class (AboutUsComponent) for about-us component
 */

export class AboutUsComponent implements OnInit {

  private aboutUs:any = [];

  /**
   * Constructor function
   */
  constructor(private aboutus:StaticDataService) {

  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getAboutUs();
    window.scrollTo(0, 0);
  }

  /**
   * getAboutUs() used to get static content
   */

  getAboutUs() {
    this.aboutus.getAboutUs()
      .then((data)=> {
        this.aboutUs = data;
        changeStatus();
      }, error => {
        // console.log(" error : ", error);
        changeStatus();
      })
  }


}
