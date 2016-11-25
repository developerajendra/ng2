/**
 * Importing core components
 */

import {Component, OnInit, ElementRef} from "@angular/core";
import {StaticDataService} from "../../services";
import {BannerComponent} from "../banner-component";
import {Title} from "@angular/platform-browser";
import {TenantConstant} from "../../constants/tenant";

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}
/**
 * Global level variable "jQuery"
 */

declare var jQuery: any;

/**
 * @Component for faq-component
 */

@Component({
  moduleId: module.id,
  selector: "faq",
  templateUrl: "faq-component.html",
  styleUrls: ["faq-component.css"],
  directives: [BannerComponent]
})


/**
 * Exporting clas (FaqComponent) from faq-component
 */

export class FaqComponent implements OnInit {

  private data: any = [];
  pageTitle: string = 'FAQ';

  /**
   * constructor() used to initialize class lavel variables
   */

  constructor(protected faq: StaticDataService, protected elementRef: ElementRef, protected _title: Title) {
    _title.setTitle(TenantConstant.DOMAIN_NAME + ' - ' + this.pageTitle);
  }

  /**
   * OnInit function
   */

  ngOnInit() {
    this.getFaq();
    window.scrollTo(0, 0);
  }

  /**
   * getFaq() used to get faq data
   */
  getFaq() {
    this.faq.getFaq()
    .then((data) => {
      this.data = data;
      changeStatus();
    }, error => {
      changeStatus();
    })
  }

  selectFaq(value) {
    if (value.length) {
      jQuery('html, body').stop().animate({
        scrollTop: jQuery('#' + value).offset().top - 150
      }, 1000);
    }
    // window.scrollTo(jQuery('#'+value).offset().left, jQuery('#'+value).position().top+720)
  }

  /**
   * searchFaq() used for searching the faq
   */
  searchFaq(value) {
    var value = value.toLowerCase().replace(/[^a-zA-Z 0-9]+/g, '');

    this.data.sections.map((data, index, array)=> {
      var selected = false;
      data.selected = !!(data.name.toLowerCase().search(value.toLowerCase()) > -1 && value && value != " ");
      data.questions.map((data, index, array)=> {
        data.selected = !!(data.question.toLowerCase().search(value) > -1 && value && value != " ") || !!(data.answer.toLowerCase().search(value) > -1 && value && value != " ");
        selected = selected || data.selected;
      });
      data.selected = data.selected || selected;
    })
  }

}
