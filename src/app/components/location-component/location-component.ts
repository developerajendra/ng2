/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from '@angular/core';

/**
 * Importing custom components
 */

import {DescriptionComponent} from '../description-component';
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
  moduleId: module.id,
  selector: "location",
  templateUrl: "location-component.html",
  styleUrls: ["location-component.css"],
  directives: [DescriptionComponent]
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

  constructor(private location:StaticDataService, private elementRef:ElementRef) {

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
}
