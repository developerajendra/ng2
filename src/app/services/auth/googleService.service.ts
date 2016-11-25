import {Injectable} from "@angular/core";
import {AppConstants} from "../../constants/app-constants";

/**
 * @Injectable for googleService.service
 */

@Injectable()

/**
 * Exporting class (GoogleService) for googleService.service
 */

export class GoogleService {

  /**
   * constructor() used to initialize class level variables
   */

  constructor() {
  }

  /**
   * delete_cookie() used delete a cookie from client's machine/device
   * @param name
   */

  delete_cookie = (name): void => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  };

  /**
   * getCookie() used get the cookie from the client's machine/device
   * @param token
   * @returns {any}
   */

  getCookie = (token): string => {
    var name = token + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  };

  /**
   * setCookie() used to set cookie on client's machine/device
   * @param cname
   * @param cvalue
   * @param noOfDays
   */

  setCookie = (cname, cvalue, noOfDays)=> {
    var exdays = noOfDays || 1000;
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
  }

  /**
   * setToken() used to set the token(cookie) on client's machine/device
   * @param data
   */

  setToken(data) {
    var userToken = this.getCookie(AppConstants.COOKIE_NAME);
    if (userToken === null || (typeof data.email != "undefined" && typeof JSON.parse(userToken).email != "undefined" && data.email != JSON.parse(userToken).email)) {
      this.setCookie(AppConstants.COOKIE_NAME, JSON.stringify(data), null);
    }
  }

}
