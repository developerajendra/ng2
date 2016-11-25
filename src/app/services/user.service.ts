import {Injectable} from "@angular/core";
import {Http, Response, Headers, RequestOptions} from "@angular/http";
import {Subject} from "rxjs/Rx";
import {Router} from "@angular/router";
import {HttpClient, CookiesService} from "./auth";
import {AppConstants} from "../constants/app-constants";
import {CartService} from "./cart.service";
import {Utils} from "../shared/utils";

/**
 * @Injectable for user.service
 */
@Injectable()

/**
 * Exporting class (UserService) for user.service
 */
export class UserService {

  _isLoggedIn$: Subject<any>;
  _userInfo$: Subject<any>;
  private currentUrl: any;

  /**
   * constructor() used to initialize class level variables
   * @param _httpClient
   * @param _cookie
   */

  constructor(protected _http: Http, protected _httpClient: HttpClient, protected _cookie: CookiesService, protected _cartService: CartService,
              protected _router: Router, protected _utils: Utils) {
    this._isLoggedIn$ = <Subject<boolean>>new Subject();
    this._userInfo$ = <Subject<any>>new Subject();
    this.getAuthCookie().then(() => {
      this._isLoggedIn$.next(true);
      this.getUserInfoResponse().then(userInfo => {
        this._userInfo$.next(userInfo);
      }, error => {
        this._router.navigateByUrl('/');
      });
    }, error => {
      this._isLoggedIn$.next(false);
    });
  }

  get isLoggedIn$() {
    return this._isLoggedIn$.asObservable();
  }

  get userInfo$() {
    return this._userInfo$.asObservable();
  }

  getCurrentUrl() {
    return this.currentUrl;
  }

  setIsLoggedIn$(isLoggedIn: boolean) {
    this._isLoggedIn$.next(isLoggedIn);
  }

  setUserInfo$(userInfo: any) {
    this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(userInfo), null);
    this._userInfo$.next(userInfo);
  }

  setCurrentUrl(currentUrl: string) {
    this.currentUrl = currentUrl;
  }

  /**
   * authUser() used to authenticate a user
   * @param user
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  authUser(user): Promise<any> {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/auth/?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/auth/'),
      body: string = JSON.stringify({"email": (user.email).toLowerCase(), "password": user.password}),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});

    return this._http.post(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * saveUserAddress() used register a user
   * @param user
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  updateUser(email: any, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + email + '?key=' + TenantConstant.API_KEY,
      let _path: string = this._utils.makeAPIURL('/users/' + email),
        body: string = JSON.stringify(payload),
        headers = new Headers({'Content-Type': 'application/json'}),
        options = new RequestOptions({headers: headers});
      this._http.put(_path, body, options)
      .toPromise()
      .then(this.extractData)
      .catch(this.handleError)
      .then(data => {
        this._userInfo$.next(payload);
        this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(payload), null);
        resolve(data);
      }, error => reject(error));
    });
  }

  /**
   * registerUser() used register a user
   * @param user
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  registerUser(user): Promise<any> {
    if (!user.email || (!user.password && !user.matchingPassword && !user.matchingPassword.password)) {
      return Promise.reject('Email or password is missing.');
    }
    user.email_opt_in = user.email_opt_in ? true : false;
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/'),
      body: string = JSON.stringify({
        "first_name": user.first_name || '',
        "last_name": user.last_name || '',
        "email": user.email.toLowerCase(),
        "password": user.password || user.matchingPassword.password,
        "marketing": {"email_opt_in": user.email_opt_in}
      }),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});

    return this._http.post(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  /**
   * subscribeUser() used to subscribe a user/guest for newsLetter
   * @param user
   * @returns {Promise<T>|Promise<ErrorObservable>}
   */

  subscribeUser(user): Promise<any> {
    user.email_opt_in = true;
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/'),
      body: string = JSON.stringify({
        "first_name": user.first_name || '',
        "last_name": user.last_name || '',
        "email": (user.email).toLowerCase(),
        "guest": true,
        "marketing": {"email_opt_in": user.email_opt_in}
      }),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});

    return this._httpClient.post(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  /**
   * getUserInfo() used to get a user's info
   * @returns {any}
   */

  getUserInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      let userCookie: any = this._cookie.getCookie(AppConstants.USER_COOKIE);
      try {
        userCookie = userCookie && JSON.parse(userCookie) || null;
        userCookie && this._userInfo$.next(userCookie);
      } catch (e) {
        userCookie = null;
      }
      if (!userCookie || !userCookie.email) {
        this.getUserInfoResponse().then(data => {
          this._cookie.delete_cookie(AppConstants.USER_COOKIE);
          this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(data), null);
          this._userInfo$.next(data);
          resolve(data);
        }, error => {
          this._userInfo$.next(null);
          this._cookie.delete_cookie(AppConstants.USER_COOKIE);
          this._cookie.delete_cookie(AppConstants.COOKIE_NAME);
          this.setIsLoggedIn$(false);
          reject(error);
        })
      } else {
        resolve(userCookie);
      }
    })
  }

  /**
   * getUserInfoResponse() used to get the response for getUserInfo
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  getUserInfoResponse(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getAuthCookie().then((authCookie: any) => {
        // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + authCookie.email + '?key=' + TenantConstant.API_KEY;
        let _path: string = this._utils.makeAPIURL('/users/' + authCookie.email);// + '?key=' + TenantConstant.API_KEY;
        this._httpClient.get(_path)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
        .then(data => {
          this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(data), null);
          resolve(data);
        }, error => {
          this._cookie.delete_cookie(AppConstants.USER_COOKIE);
          this._cookie.delete_cookie(AppConstants.COOKIE_NAME);
          this.setIsLoggedIn$(false);
          reject(error);
        });
      }, (error: any) => {
        reject(error)
      });
    });
  }

  /**
   * getUsersOrderList() used to get the response for order history
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  getUsersOrderList(email: string): Promise<any> {
    if (!email || typeof email !== 'string') {
      return Promise.reject("Invalid Email provided to fetch order history");
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + email + '/orders?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/users/' + email + '/orders');//?key=' + TenantConstant.API_KEY;
    return this._httpClient.get(_path)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * isUserExists() know user exist or not
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  isUserExists(email: string): Promise<any> {
    if (!email || typeof email !== 'string') {
      return Promise.reject("Invalid Email provided to check use exists");
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/users/');//?key=' + TenantConstant.API_KEY;
    return this._http.get(_path)
    .toPromise()
    .then((data)=> {
      let allExistingUsers = this.extractData(data);
      let userInfo = allExistingUsers.filter((userInfo)=> userInfo.email == email);
      return (userInfo.length == 0) ? false : true;
    })
    .catch(this.handleError)
  }

  /**
   * getAuthCookie() used to get Auth cookie
   * @returns {any}
   */

  getAuthCookie(): Promise<any> {
    return new Promise((resolve, reject) => {
      let authCookie: any = this._cookie.getCookie(AppConstants.COOKIE_NAME);
      try {
        authCookie = authCookie && JSON.parse(authCookie) || null;
      } catch (e) {
        authCookie = null;
        // console.log('Error:', e);
      }
      (authCookie && authCookie.email && authCookie.user_auth_token) ? resolve(authCookie) : reject('Invalid auth token');
    });
  }

  /**
   * logout() used to logout a user from Application
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getAuthCookie().then(authCookie => {
        // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + authCookie.email + '/logout/' + '?key=' + TenantConstant.API_KEY,
        let _path: string = this._utils.makeAPIURL('/users/' + authCookie.email + '/logout/'),
          body: string = JSON.stringify({}),
          headers = new Headers({'Content-Type': 'application/json'}),
          options = new RequestOptions({headers: headers});

        this._httpClient.post(_path, body, options)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
        .then(data => resolve(data), error => reject(error));
      }, error => reject(error));
    })
  }

  /**
   * createRxObject() used to logout a user from Application
   * @param payload
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  createRxObject(payload): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getUserInfo().then(userInfo => {
        // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + userInfo.email + '/rx/?key=' + TenantConstant.API_KEY,
        let _path: string = this._utils.makeAPIURL('/users/' + userInfo.email + '/rx/'),
        body: string = JSON.stringify(payload),
          headers = new Headers({'Content-Type': 'application/json'}),
          options = new RequestOptions({headers: headers});
        this._httpClient.post(_path, body, options)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
        .then(data => {
          userInfo.rx = userInfo.rx || [];
          userInfo.rx.push(data);
          this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(userInfo), null);
          this.setUserInfo$(userInfo);
          resolve(data)
        }, error => reject(error));
      }, error => reject(error));
    })
  }

  /**
   * updateRxObject() used to update prescrioption
   * @param payload
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  updateRxObject(payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getUserInfo().then(userInfo => {
        // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + userInfo.email + '/rx/' + payload.id + '/?key=' + TenantConstant.API_KEY,
        let _path: string = this._utils.makeAPIURL('/users/' + userInfo.email + '/rx/' + payload.id + '/'),
        body: string = JSON.stringify(payload),
          headers = new Headers({'Content-Type': 'application/json'}),
          options = new RequestOptions({headers: headers});
        this._httpClient.put(_path, body, options)
        .toPromise()
        .then(this.extractData)
        .catch(this.handleError)
        .then(data => resolve(data), error => reject(error));
      }, error => reject(error));
    })
  }

  /**
   * getRxFile() used to get an uploaded rx file
   * @param fileName
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  getRxFile(fileName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getAuthCookie().then((authCookie: any) => {
        if (!authCookie || !authCookie.user_auth_token || !authCookie.email) {
          reject('Invalid auth token');
        }
        if (!fileName) {
          reject('Missing fileName');
        }
        // this._httpClient.get(TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + authCookie.email + '/rx/file/' + fileName + '?key=' + TenantConstant.API_KEY)
        this._httpClient.get(this._utils.makeAPIURL('/users/' + authCookie.email + '/rx/file/' + fileName))
        .toPromise()
        .then((res: any)=> {
          resolve(res._body);
        })
        .catch(this.handleError);
      }, error=>reject(error));
    });
  }

  /**
   * forgotPassword() used to retrieve forgotten password
   * @param email
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  forgotPassword(email: string): Promise<any> {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + email + '/forgot_password/' + '?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/' + email + '/forgot_password/'),
    body: string = JSON.stringify({}),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});

    return this._http.post(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  /**
   * resetPassword() used to reset password for a user
   * @param userInfo
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  resetPassword(userInfo): Promise<any> {
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + userInfo.email + '/reset_password/' + '?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/' + userInfo.email + '/reset_password/'),
    body: string = JSON.stringify({token: userInfo.token, password: userInfo.password}),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});

    return this._http.post(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError);
  }

  /**
   * addDittoToUser() used to update a user
   * @param email;
   * @param payload;
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  addDittoToUser(email, payload): Promise<any> {
    if (!email) {
      return Promise.reject('email is a required field.')
    }
    if (!payload.ditto && !payload.ditto.ditto_id) {
      return Promise.reject('ditto.ditto_id is a required field.')
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + email + '/ditto?key=' + TenantConstant.API_KEY,
    let _path: string = this._utils.makeAPIURL('/users/' + email + '/ditto'),
    body: string = JSON.stringify(payload),
      headers = new Headers({'Content-Type': 'application/json'}),
      options = new RequestOptions({headers: headers});
    return this._http.put(_path, body, options)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * deleteDittoFromUser() used to update a user
   * @param email;
   * @returns {Promise<ErrorObservable>|Promise<T>}
   */

  deleteDittoFromUser(email): Promise<any> {
    if (!email) {
      return Promise.reject('email is a required field.')
    }
    // let _path: string = TenantConstant.API_PROTOCOL + TenantConstant.API_HOST + TenantConstant.API_VERSION + '/users/' + email + '/ditto?key=' + TenantConstant.API_KEY;
    let _path: string = this._utils.makeAPIURL('/users/' + email + '/ditto');//?key=' + TenantConstant.API_KEY;

    return this._httpClient.delete(_path, null)
    .toPromise()
    .then(this.extractData)
    .catch(this.handleError)
  }

  /**
   * extractData() used to extract data from response
   * @param res
   * @returns {Uint8ClampedArray|ArrayBuffer|string|any|{}}
   */

  private extractData(res: Response) {
    let body = res.json();
    return body.data || {};
  }

  /**
   * handleError() used to handle errors through appropriate messages
   * @param error
   * @returns {Promise}
   */

  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let _error = error.json() && error.json().data || error;
    return Promise.reject(_error);
  }
}
