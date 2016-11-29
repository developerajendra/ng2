/**
 * Importing core component
 */
import {Component, OnInit, AfterViewInit, ElementRef} from '@angular/core';
import {Router, NavigationStart} from '@angular/router';


/**
 * Global level variable "Google Analytics"
 */
declare var ga:any;
declare var window:any;
declare var jQuery:any;
function cleanupPrerenderView() {
  var el = jQuery('prerender');
  if (el.length) {
    el.remove();
  }
}

/**
 * @Component for app-component
 */
@Component({
  selector: 'app',
  templateUrl: 'app.html',
  styleUrls: ['app.scss']
})

/**
 * Export class(AppComponent) for app-component
 */
export class AppComponent implements OnInit {

  subs:any = [];
  error:any = null;
  collections:any = null;
  staticRoutes:any = null;
  limitMessage:string = '';

  /**
   * constructor() used to initialize class level variables
   * @param _userService
   * @param _cookie
   * @param _router
   * @param _ProductService
   */
  constructor( ) {

  }

  /**
   * ngOnInit() used to initialize class level variables after loading of DOM
   */
  ngOnInit() {
  }

}

