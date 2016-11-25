/**
 * Importing core components
 */

import {Component, OnInit} from "@angular/core";
import {UserService} from "../../services";
import * as moment from "moment";
import {TenantConstant} from "../../constants/tenant";
import {Title} from "@angular/platform-browser";

/**
 * Importing custom services
 */

declare var window: any;
declare var jQuery: any;
declare var ditto: any;

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for user-ditto-component
 */

@Component({
  moduleId: module.id,
  selector: 'user-ditto',
  templateUrl: 'user-ditto-component.html',
  styleUrls: ['user-ditto-component.css']
})

/**
 * Exporting class (UserDittoComponent) from user-ditto-component
 */

export class UserDittoComponent implements OnInit {

  orders: any = null;
  userInfo: any = null;
  isTryOn: boolean = false;
  public moment: any;
  cssLink: any;
  isDittoStarted: boolean = false;
  pageTitle: string = 'My Ditto';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected _userService: UserService, protected _title: Title) {
    this.moment = moment;
    _title.setTitle(TenantConstant.DOMAIN_NAME + ' - ' + this.pageTitle);
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getUserInfo();
  }

  /**
   * getUserOrderList() used to return the user info
   */

  getUserOrderList() {
    this._userService.getUsersOrderList(this.userInfo.email).then(data => {
      this.orders = data;
    }, error => {
    });
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    this._userService.getUserInfo().then(data => {
      this.userInfo = data;
      if (this.userInfo && this.userInfo.hasOwnProperty("ditto") && this.userInfo.ditto.hasOwnProperty("ditto_id")) {
        this.tryOn(this.userInfo.ditto.ditto_id);
      }
      this.getUserOrderList();
      changeStatus();
    }, error => {
      changeStatus();
    });
  }

  tryOn(dittoId) {
    return new ditto.api.TryOn({
      selector: "#ditto",
      thumbnailSelector: "#ditto-thumbnail",
      dittoId: dittoId,
      sku: ''//productId
    }, {
      success: ()=> {
        this.isTryOn = true;
        this.isDittoStarted = false;
        // console.log("Try-on success.");
      }, failure: ()=> {
        // console.log("Try-on failure.")
      },
    })
  }

  createDitto() {
    this.isDittoStarted = true;
    window.dittoCreation = new ditto.api.DittoCreation({selector: "#creation"}, {
      success: (q)=> {
        this.isDittoStarted = false;
        if (!(this.userInfo && this.userInfo.email)) {
          window.location = "/auth/login/?ditto_id=" + q.dittoId;
        } else {
          this.updateDittoApi(this.userInfo.email, q.dittoId);
          this.tryOn(q.dittoId);
        }
      }, failure: (p)=> {
        this.isDittoStarted = false;
        // console.log("Error: ", p)
      }, progress: (p)=> {
        // console.log("progress", p)
      }, close: (p)=> {
        this.isDittoStarted = false;
        // console.log("close", p)
      }
    });
    this.cssLink = document.createElement("link");
    this.cssLink.href = "/app/components/user-ditto-component/user-ditto-component.css";
    this.cssLink.rel = "stylesheet";
    this.cssLink.type = "text/css";
    jQuery("#creation>iframe").contents().find('head').append(this.cssLink);


  }

  updateDittoApi(email, dittoId) {
    let payload = {
      "ditto": {
        "ditto_id": dittoId
      }
    };

    this._userService.addDittoToUser(email, payload)
    .then(user=> {
      this.userInfo = user;
      this._userService.setUserInfo$(user);
      jQuery('#creation').empty();
    }, err=> {
    });
  }

  deleteDittoApi() {
    this.isDittoStarted = false;
    if (!(this.userInfo && this.userInfo.email)) {
      // console.log('You are not logged-in currently');
      return;
    }
    if (confirm("Confirm Deletion?")) {
      this._userService.deleteDittoFromUser(this.userInfo.email)
      .then(user=> {
        this.userInfo = user;
        this._userService.setUserInfo$(user);
        jQuery('#creation').empty();
        jQuery('#ditto').empty();
      }, err=> {
      });
    }
  }
}
