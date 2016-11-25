import {Injectable} from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import "rxjs/add/operator/map";
import {Utils} from "../shared/utils";

/**
 * Global variable
 */

declare var $: any;

/**
 * @Injectable for order.service
 */
@Injectable()

/**
 * Exporting class (OrderService) for order.service
 */
export class OrderService {

  /**
   * constructor function
   * @param _http
   */

  constructor(private _http: Http, protected _utils: Utils) {
  }

  /**
   * getOrderList function
   * @returns {Promise<R>}
   */
  getOrderList() {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/');//?key=' + TenantConstant.API_KEY;
    return this._http.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * getOrder function
   * @returns {Promise<R>}
   */
  getOrder(id) {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/' + id + '?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/' + id);//+ '?key=' + TenantConstant.API_KEY;
    return this._http.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * getKioskMode() function
   * @returns {Promise<R>}
   */

  getKioskMode(id) {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/' + id + '/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/' + id + '/');//?key=' + TenantConstant.API_KEY;
    return this._http.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * updateOrder function
   * @returns {Promise<R>}
   */

  updateOrder(id, data) {
    let _body: string = '',
      _headers = new Headers({"Content-Type": "application/json"}),
      _options = new RequestOptions({headers: _headers});

    try {
      _body = JSON.stringify(data);
    } catch (e) {
      return Promise.reject(e);
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/orders/' + id + '/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/orders/' + id + '/');//?key=' + TenantConstant.API_KEY;
    return this._http.post(_path, _body, _options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * extractData function
   * @param res
   * @returns {any|{}}
   */

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  /**
   * handleError function
   * @param error
   * @returns {ErrorObservable}
   */

  private  handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    return Promise.reject(errMsg);
  }
}
