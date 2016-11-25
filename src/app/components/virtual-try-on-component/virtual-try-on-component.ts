/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from '@angular/core';
import {MetaService} from "ng2-meta";

/**
 * @Component for virtual-try-on-component
 *
 */
import {ProductCarouselComponent} from '../product-carousel-component';
import {BannerComponent} from "../banner-component";
import {DescriptionComponent} from "../description-component";
import {ProductListingComponent} from "../product-listing-component";
import {StaticDataService} from '../../services';
import {TenantConstant} from "../../constants/tenant";
import {Title} from "@angular/platform-browser";


declare var window:any;
declare var jQuery: any;

function changeStatus() {
  window.prerenderReady = true;
}

@Component({
  selector: 'virtual-try-on',
  templateUrl: 'virtual-try-on-component.html',
  styleUrls: ['virtual-try-on-component.scss'],
  directives: [ProductCarouselComponent, BannerComponent, DescriptionComponent, ProductListingComponent]
})

/**
 * Exporting class (VirtualTryOnComponent) from virtual-try-on-component
 */

export class VirtualTryOnComponent implements OnInit {
  steps             : any = null;

  owlCarousel       : any = null;
  private defaultCarouselOptions: any = {
    items: 1,
    loop: true,
    nav: true,
    dots: true
  };
  data:any = null;

  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected metaService: MetaService, protected elementRef: ElementRef, protected staticData:StaticDataService) {
    window.scrollTo(0, 0);
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getSteps();
    this.getvto();
  }

  loadCarousel(){
    let sel = '#lens-power-steps .owl-carousel';
    setTimeout(() => {
      this.owlCarousel = jQuery(this.elementRef.nativeElement).find(sel).owlCarousel(this.defaultCarouselOptions);
    }, 5);
  }

  getSteps() {
  //   this.staticData.getDitto()
  //     .then((data)=>{
  //       this.steps = data.steps;
  //       this.loadCarousel();
  //     }, e => {
  //     });
  }

  /**
   * getvto() used to get location data
   */
  getvto() {
    this.staticData.getVto()
      .then((data)=> {
          this.data = data;
          this.setMetaTags(data);
          changeStatus();
        }, error => {
          changeStatus();
        }
      )
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
