import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Rx";
import "rxjs/add/operator/map";

/**
 * @Injectable() for notiy Message Service
 */
@Injectable()


export class MessageService{

  /**
   * class level variables
   */

  private _message$: Subject<string>;


  /**
   *Constructor function
   */
  constructor() {
    this._message$ = <Subject<any>>new Subject();
  }

  /**
   *getMessage$ get message
   */

  get getMessage$() {
    return this._message$.asObservable();
  }

  /**
   * set message
   * @parem value:string
   */

  setMessage(value: string) {
    this._message$.next(value);
  }
}
