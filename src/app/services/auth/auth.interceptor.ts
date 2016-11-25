import {Injectable, Inject} from "@angular/core";
import {Http, Headers, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {AppConstants} from "../../constants/app-constants";
import {CookiesService} from "./cookiesService.service";

/**
 * Declaring global variables
 */

// Avoid TS error "cannot find name escape"
declare var escape: any;

/**
 * Exporting Interface (IAuthConfig) from auth.interceptor
 */

export interface IAuthConfig {
  headerName: string;
  headerPrefix: string;
  tokenName: string;
  tokenGetter: any;
  noTokenError: boolean;
  globalHeaders: Array<Object>;
}

/**
 * Exporting class (AuthConfig) from auth.interceptor
 * Sets up the authentication configuration.
 */

export class AuthConfig {
  config: any;
  headerName: string;
  headerPrefix: string;
  tokenName: string;
  tokenGetter: any;
  noTokenError: boolean;
  noTokenScheme: boolean;
  globalHeaders: Array<Object>;


  /**
   * constructor() used to initialize class level variables
   * @param cookiesService
   * @param config
   */

  constructor(@Inject(CookiesService) private cookiesService: CookiesService) {
    this.config =   {};
    this.headerName = this.config.headerName || 'Authorization';
    if (this.config.headerPrefix) {
      this.headerPrefix = this.config.headerPrefix + ' ';
    } else if (this.config.noTokenScheme) {
      this.headerPrefix = '';
    } else {
      this.headerPrefix = 'Bearer ';
    }
    this.tokenName = AppConstants.COOKIE_NAME || this.config.tokenName || 'token';
    this.noTokenError = this.config.noTokenError || false;
    this.tokenGetter = this.config.tokenGetter || (() => {
        var token = "";
        if (this.cookiesService.getCookie(this.tokenName)) {
          token = JSON.parse(this.cookiesService.getCookie(this.tokenName)).user_auth_token
        }
        return (token && btoa("token" + ":" + token)) || null;
      });
    this.globalHeaders = this.config.globalHeaders || null;
  }

  /**
   * getConfig() used to retrieve the configuration
   * @returns {{headerName: string, headerPrefix: string, tokenName: string, tokenGetter: any, noTokenError: boolean, emptyHeaderPrefix: boolean, globalHeaders: Array<Object>}}
   */

  getConfig() {
    return {
      headerName: this.headerName,
      headerPrefix: this.headerPrefix,
      tokenName: this.tokenName,
      tokenGetter: this.tokenGetter,
      noTokenError: this.noTokenError,
      emptyHeaderPrefix: this.noTokenScheme,
      globalHeaders: this.globalHeaders
    }
  }

}

/**
 * tokenNotExpired() Checks for presence of token and that token hasn't expired.
 * @param cookiesService
 * @param tokenName
 * @param token
 * @returns {boolean}
 */

function tokenNotExpired(cookiesService: CookiesService, tokenName?: string, token?: string) {
  var authToken: string = tokenName || 'token',
    _token = token ? token : cookiesService.getCookie(authToken);

  return !!(_token);
}

/**
 * Allows for explicit authenticated HTTP requests.
 */

/**
 * @Injectable for auth.interceptor
 */

@Injectable()

/**
 * Exporting class (HttpClient) for auth.interceptor
 */

export class HttpClient {

  private _config: IAuthConfig;
  public tokenStream: Observable<string>;

  /**
   * constructor() used to initialize class level variables
   * @param cookiesService
   * @param options
   * @param http
   */

  constructor(private cookiesService: CookiesService, options: AuthConfig, private http: Http) {
    this._config = options.getConfig();

    this.tokenStream = new Observable<string>((obs: any) => {
      obs.next(this._config.tokenGetter());
    });
  }

  /**
   * setGlobalHeaders() used to set the headers globally
   * @param headers
   * @param request
   */

  setGlobalHeaders(headers: Array<Object>, request: Request | RequestOptionsArgs) {
    headers.forEach((header: Object) => {
      let key: string = Object.keys(header)[0];
      let headerValue: string = (<any>header)[key];
      request.headers.set(key, headerValue);
    });
  }

  /**
   * request() requests for a url
   * @param url
   * @param options
   * @returns {any}
   */

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    let request: any;
    let globalHeaders = this._config.globalHeaders;
    if (!tokenNotExpired(this.cookiesService, null, this._config.tokenGetter(this._config.tokenName))) {
      if (!this._config.noTokenError) {
        return new Observable<Response>((obs: any) => {
          obs.error(new Error('No token present'));
        });
      } else {
        request = this.http.request(url, options);
      }
    } else if (typeof url === 'string') {
      let reqOpts: RequestOptionsArgs = options || {};
      if (!reqOpts.headers) {
        reqOpts.headers = new Headers();
      }
      if (globalHeaders) {
        this.setGlobalHeaders(globalHeaders, reqOpts);
      }
      reqOpts.headers.set(this._config.headerName, this._config.headerPrefix + this._config.tokenGetter());
      request = this.http.request(url, reqOpts);
    } else {
      let req: Request = <Request>url;
      if (!req.headers) {
        req.headers = new Headers();
      }
      if (globalHeaders) {
        this.setGlobalHeaders(globalHeaders, req);
      }
      req.headers.set(this._config.headerName, this._config.headerPrefix + this._config.tokenGetter());
      request = this.http.request(req);
    }
    return request;
  }

  /**
   * requestHelper() used to request helper for the request
   * @param requestArgs
   * @param additionalOptions
   * @returns {Observable<Response>}
   */

  private requestHelper(requestArgs: RequestOptionsArgs, additionalOptions: RequestOptionsArgs): Observable<Response> {
    let options: RequestOptions = new RequestOptions(requestArgs);
    if (additionalOptions) {
      options = options.merge(additionalOptions)
    }
    return this.request(new Request(options))
  }

  /**
   * get() used to make a get request
   * @param url
   * @param options
   * @returns {Observable<Response>}
   */

  get(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({url: url, method: RequestMethod.Get}, options);
  }

  /**
   * post() used to make a post request
   * @param url
   * @param body
   * @param options
   * @returns {Observable<Response>}
   */

  post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({url: url, body: body, method: RequestMethod.Post}, options);
  }

  /**
   * put() used to make a put request
   * @param url
   * @param body
   * @param options
   * @returns {Observable<Response>}
   */

  put(url: string, body: string, options ?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({url: url, body: body, method: RequestMethod.Put}, options);
  }

  /**
   * delete() used to make a delete request
   * @param url
   * @param options
   * @returns {Observable<Response>}
   */

  delete(url: string, options ?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({url: url, method: RequestMethod.Delete}, options);
  }

  /**
   * patch() used to make a patch request
   * @param url
   * @param body
   * @param options
   * @returns {Observable<Response>}
   */

  patch(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({url: url, body: body, method: RequestMethod.Patch}, options);
  }

  /**
   * head() used to make a head request
   * @param url
   * @param options
   * @returns {Observable<Response>}
   */

  head(url: string, options?: RequestOptionsArgs): Observable<Response> {
    return this.requestHelper({url: url, method: RequestMethod.Head}, options);
  }

}
