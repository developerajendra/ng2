/**
 * Importing core components
 */

import {Component, Input, OnInit} from '@angular/core';
import {Router, ROUTER_DIRECTIVES, NavigationStart} from '@angular/router';

/**
 * Importing custom components
 */
import { StaticDataService } from '../../services';

/**
 * @Component for description-component
 */

@Component({
  selector: 'page-description',
  templateUrl: 'description-component.html',
  styleUrls: ['description-component.scss']
})

/**
 * Exporting class (DescriptionComponent) from description-component
 */

export class DescriptionComponent implements OnInit {

  @Input() contentId:string;

  private content:any = {};

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private description:StaticDataService, private _router:Router) {
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getDescription();
  }

  /**
   * getDescription() used to get static content
   */

  getDescription(){

    this.description.getDescription()
      .then((data) => {
          this.setDescription(data)
        },
        err => {}
      );
  }

  /**
   * setDescription() used to set static content
   * @param _data
   */

  setDescription(_data){
    _data && _data.map((data)=>{
      if(data.contentId == this.contentId){
        this.content = data;
      }
    })
  }

  ngAfterViewInit(){
    let sub:any = this._router.events.subscribe((event)=>{
      if(event instanceof NavigationStart){

        setTimeout(() => {
          this.getDescription();
        }, 1000);
      }
    })
  }

}
