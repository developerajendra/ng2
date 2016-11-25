import {Injectable} from "@angular/core";
import {Http, Response} from "@angular/http";

/**
 * @Injectable() for static.data.service
 */

@Injectable()

/**
 * Exporting class (StaticDataService)
 */

export class StaticDataService {

  subs: any = [];
  data: any = {};
  promises: any = {};
  staticData: any = {}

  /**
   * Constructor function
   * @param http
   */
  constructor(private http: Http) {

  }

  /**
   * getData() common fucntion to get json data
   * @param fileName
   * @returns {Promise<any>}
   */

  getData(fileName: string) {
    return new Promise<any>((resolve, reject) => {
      if (this.data.hasOwnProperty(fileName)) {
        resolve(this.data[fileName]);
      } else {
        let sub: any = this.http.get("app/data/" + fileName)
        .map((data: Response) => {
          return data.json();
        }).subscribe((data) => {
          this.data[fileName] = data;
          resolve(this.data[fileName]);
        });
        this.subs.push(sub);
      }
    });
  }


  /**
   * getDescription() used get the description json data
   * @returns {Observable<R>}
   */

  getDescription(): Promise<any> {
    return this.getData("description.json");
  }

  /**
   * getLensPower() used get the description json data
   * @returns {Observable<R>}
   */

  getLensPower(): Promise<any> {
    return this.getData("lens-power.json");
  }

  /**
   * getDitto() used get the description json data
   * @returns {Observable<R>}
   */

  getDitto(): Promise<any> {
    return this.getData("ditto.json");
  }

  /**
   * getUniversalFitData() used get the description json data
   * @returns {Observable<R>}
   */

  getUniversalFitData(): Promise<any> {
    return this.getData("universal-fit.json");
  }

  /**
   * getAboutUs() used get the about us json data
   * @returns {Observable<R>}
   */

  getAboutUs(): Promise<any> {
    return this.getData("about-us.json");
  }

  /**
   * getFaq() used get the faq json data
   * @returns {Observable<R>}
   */

  getFaq() {
    return this.getData("faq.json");
  }

  /**
   * getVto() used get the vto json data
   * @returns {Observable<R>}
   */

  getVto() {
    return this.getData("vto.json");
  }

  /**
   * getProductListing() used get the vto json data
   * @returns {Observable<R>}
   */

  getProductListing() {
    return this.getData("productListing.json");
  }

  /**
   * getLocation() used get the Location json data
   * @returns {Observable<R>}
   */

  getLocation() {
    return this.getData("location.json");
  }


  /**
   * getPress() used get the Press json data
   * @returns {Observable<R>}
   */

  getPress() {
    return this.getData("press.json");
  }


  /**
   * getQuality() used get the Quality json data
   * @returns {Observable<R>}
   */

  getQuality() {
    return this.getData("quality.json");
  }


  /**
   * getImageData() used get the iamge json data
   * @returns {Observable<R>}
   */

  getConfigData() {
    return this.getData("image-data.json");
  }

  /**
   * getContact() used get the contact details
   * @returns {Observable<R>}
   */

  getContact() {
    return this.getData("contact.json");
  }

  /**
   * getDataValidation() used get the contact details
   * @returns {Observable<R>}
   */

  getDataValidation() {
    return this.getData("validation.json");
  }


  /**
   * getRedirectionRoutes() used get the redirection routes
   * @returns {Observable<R>}
   */

  getRedirectionRoutes() {
    if (!this.promises["redirection"]) {
      this.promises["redirection"] = this.getData("redirection.json");
    }
    return this.promises["redirection"];
  }


  /**
   * getPrescription() used get the prescription data
   * @returns {Observable<R>}
   */

  getCustomizeLenses() {
    return this.http.get("app/data/customize-lenses.json")
    .map((data: Response) => data.json());
  }

  /**
   * getCountries() used get the country data
   * @returns {Observable<R>}
   */

  getCountries() {
    return this.http.get("app/data/countries.json")
    .map((data: Response) => data.json());
  }


  /**
   * getLandingPage() requests a specified page from the server
   */
  getLandingPage(page: string) {
    if (!this.data.hasOwnProperty("pages")) {
      this.data.pages = {};
    }
    return new Promise<any>((resolve, reject) => {
      if (this.data.pages.hasOwnProperty(page)) {
        resolve(page);
      } else {
        let sub: any = this.http.get("app/landing/" + page + ".html")
        .map((data: Response) => {
          return data.text();
        }).subscribe((data) => {
          this.data.pages[page] = data;
          resolve(this.data.pages[page]);
        }, (err) => {
          // console.log("error fetching html", err);
          reject(err);
        });
        this.subs.push(sub);
      }
    });
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.subs.forEach((sub: any)=> sub.unsubscribe());
  }
}
