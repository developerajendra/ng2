/**
 * Importing core components
 */

import {Component, OnInit} from '@angular/core';

/**
 * Importing custom components
 */

import {ProductCarouselComponent} from '../product-carousel-component';
import {BannerComponent} from "../banner-component";
import {DescriptionComponent} from "../description-component";
import {ProductListingComponent} from "../product-listing-component";
import {StorageService} from '../../services/storage.service';
import {AppConstants} from "../../constants/app-constants";


/**
 * @Component for home-component
 */

@Component({
  moduleId: module.id,
  selector: 'home',
  templateUrl: 'home-component.html',
  styleUrls: ['home-component.css'],
  directives: [ProductCarouselComponent, BannerComponent, DescriptionComponent, ProductListingComponent]
})

/**
 * Exporting class (HomeComponent) from home-component
 */

export class HomeComponent implements OnInit {
  /**
   * constructor() used to initialize class level variables
   */

  constructor(private _storageService:StorageService) {
    window.scrollTo(0, 0);
    this._storageService.removeItem(AppConstants.THANK_YOU_CART);

  }

  ngOnInit() {
  }
}
