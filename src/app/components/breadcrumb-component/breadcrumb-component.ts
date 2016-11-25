/**
 * Importing core components
 */

import {Component, Input, OnInit} from '@angular/core';

/**
 * @Component
 */

@Component({
  selector: 'breadcrumb',
  templateUrl: 'breadcrumb-component.html',
  styleUrls: ['breadcrumb-component.scss']
})

/**
 * Exporting class BreadCrumbComponent
 */
export class BreadCrumbComponent implements OnInit {

  @Input() options:any = null;

  /**
   * constructor()
   */

  constructor() {
  }

  /**
   * ngOnInit() function
   */

  ngOnInit() {
  }

}
