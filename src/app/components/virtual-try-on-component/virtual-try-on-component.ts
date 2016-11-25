/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from '@angular/core';


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
  moduleId: module.id,
  selector: 'virtual-try-on',
  templateUrl: 'virtual-try-on-component.html',
  styleUrls: ['virtual-try-on-component.css'],
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
  pageTitle: string = '3D Virtual Try On';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected elementRef: ElementRef, protected staticData:StaticDataService, protected _title: Title) {
    window.scrollTo(0, 0);
    _title.setTitle(TenantConstant.DOMAIN_NAME + ' - ' + this.pageTitle);
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getSteps();

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
}
