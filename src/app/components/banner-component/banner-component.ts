/**
 * Importing core components
 */

import {Component,Input, OnInit} from '@angular/core';

/**
 * Importing custom components
 */
import {StaticDataService} from '../../services/';


/**
 * @Component for banner-component
 */

@Component({
  selector: 'plain-banner',
  templateUrl: 'banner-component.html',
  styleUrls: ['banner-component.scss']
})

/**
 * Exporting class (BannerComponent) from banner-component
 */

export class BannerComponent implements OnInit {
  @Input() imageFor: any;
  @Input() image: any;
  @Input() altFor: any;
  @Input() alt: any;
  @Input() textFor: any;
  @Input() text: any;
  isData:any = null;

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private staticData: StaticDataService) {

  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getImageData();
  }

  getImageData() {
    this.staticData.getConfigData().then(data=> {
      this.isData =  data[this.image][this.imageFor];
      this.image = data[this.image][this.imageFor] || data[this.image].default;
      if('altText' in data)
        this.alt = data.altText[this.altFor][this.alt] || data.altText.default;
      if('bannerText' in data)
        this.text =  data.bannerText[this.textFor][this.text] || data.bannerText.default;
    }, error => {
      console.log(error);
    });
  }
}
