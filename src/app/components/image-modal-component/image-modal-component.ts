/**
 * Importing core components
 */

import {Component, Input, OnInit, ElementRef} from '@angular/core';

/**
 * Importing custom components
 */

import {Router} from '@angular/router';

/**
 * @Component for email-modal-component
 */

/**
 * Global variable
 */
declare var jQuery:any;

@Component({
  selector: 'image-modal',
  templateUrl: 'image-modal-component.html',
  styleUrls: ['image-modal-component.scss']
})

/**
 * Exporting class (ImageModalComponent) from image-modal-component
 */

export class ImageModalComponent implements OnInit {

  @Input() imageName:string;
  @Input() imageData:string;
  @Input() modalId:string;
  
  /**
   * constructor() used to initialize class level variables
   */

  constructor() {
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
  }
  
}
