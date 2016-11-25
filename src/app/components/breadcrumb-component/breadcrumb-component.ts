/**
 * Importing core components
 */

import {Component, Input, OnInit} from '@angular/core';

/**
 * @Component
 */

@Component({
  moduleId: module.id,
  selector: 'breadcrumb',
  templateUrl: 'breadcrumb-component.html',
  styleUrls: ['breadcrumb-component.css']
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
