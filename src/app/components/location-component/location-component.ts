/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from '@angular/core';
import {MetaService} from "ng2-meta";

/**
 * Importing custom components
 */

import {StaticDataService} from '../../services';

/**
 * @Component for location-component
 */

declare var $:any;

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

@Component({
  selector: "location",
  templateUrl: "location-component.html",
  styleUrls: ["location-component.scss"]
})

/**
 * Exporting class (LocationComponent) from location-component
 */

export class LocationComponent implements OnInit {

  private data:any = [];
  cities:any = null;
  selectedvalue:string = '';
  storesInCity = [];
  private cityId:string = '';
  elem:string = '';
  diff:any = '';


  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected metaService: MetaService, private location:StaticDataService, private elementRef:ElementRef) {

  }

  /**
   * OnInit function
   */

  ngOnInit() {
    this.getLocation();
    window.scrollTo(0, 0);
  }

  /**
   * cityName() used to get remove white spaces from city name to use it as particular id.
   */
  removeCitySpaces(val) {
    return val.replace(/ /g, '');
  }


  /**
   * getLocation() used to get location data
   */
  getLocation() {
    this.location.getLocation()
      .then((data)=> {
        this.data = data;
        this.cities = data.cities;
        this.setMetaTags(data);
        changeStatus();
      }, error => {
        changeStatus();
      }
    )
  }

  onChange(newValue) {
    this.selectedvalue = newValue;
    if (newValue === '') {
      this.cities = this.data.cities;
    } else {
      this.elem = this.elementRef.nativeElement;
      this.diff = $(this.elem).find('#' + newValue).offset().top - $(this.elem).parents('body').find('header').height();
      $('body, html').animate({scrollTop: this.diff}, 1000);
    }
  }

  /**
   * setMetaTags() used to get metatags form JSON
   *
   */

  setMetaTags(data) {
    this.metaService.setTitle(data.pageTitle);
    this.metaService.setTag('description', data.metaDescription);
  }

}
