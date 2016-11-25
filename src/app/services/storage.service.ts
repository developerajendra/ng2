import {Injectable} from "@angular/core";

declare var CSEncoder: any;

/**
 * @Injectable() for storage.service
 */
@Injectable()

/**
 * Exporting class (StorageService)
 */
export class StorageService {
  constructor() {
  }

  /**
   * setItem(key, item, type = localStorage) to set the item to specified storage cache
   */
  setItem(key: string, data: any, storageType: string = 'localStorage'): any {
    let _storage: any = localStorage;
    if (storageType !== 'localStorage') {
      //sessionStorage maybe?
      _storage = sessionStorage;
    }

    let _data = this.transform('set', (typeof data === "string") ? data : JSON.stringify(data));
    _storage.setItem(key, _data);
  }

  /**
   * removeItem(key, type = localStorage) to remove the item from specified storage cache
   */
  removeItem(key: string, storageType: string = 'localStorage'): any {
    let _storage: any = localStorage;
    if (storageType !== 'localStorage') {
      //sessionStorage maybe?
      _storage = sessionStorage;
    }

    _storage.removeItem(key);
  }

  /**
   * getItem(key) returns the cache object from storage
   */
  getItem(key: string, ifNotFound: any = {}, storageType: string = 'localStorage'): any {
    let _storage: any = localStorage;
    if (storageType !== 'localStorage') {
      //sessionStorage maybe?
      _storage = sessionStorage;
    }

    let _data = _storage.getItem(key);
    if (_data) {
      try {
        return JSON.parse(this.transform('get', _data));
      } catch (e) {
        return ifNotFound;
      }
    }
    return ifNotFound;
  }

  /**
   * transform() returns the object transformed to storage
   */
  private transform(type: string = 'set', data: any): any {
    if (type === 'set') {
      //compress the data to Base64 and then do unicode encoding
      return CSEncoder.compress(data);
    } else {
      //transform for fetch
      return CSEncoder.decompress(data);
    }
  }
}
