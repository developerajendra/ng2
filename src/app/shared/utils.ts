import {Injectable} from "@angular/core";
import {ConstantsService} from "../services/constants.service";

@Injectable()

export class Utils {
  constructor(protected _constantsService: ConstantsService) {

  }

  public get apiBaseURL(): string {
    return this.makeURL(this.makeURL(this._constantsService.envConstants.API_PROTOCOL, this._constantsService.envConstants.API_HOST),
      this._constantsService.envConstants.API_VERSION);
  }

  public get apiKey() {
    return this._constantsService.envConstants.API_KEY;
  }

  public makeAPIURL(path: string): string {
    return this.makeURL(this.apiBaseURL, path) + '?key=' + this.apiKey;
  }

  public makeURL(part1: string, part2: string): string {
    var retVal = part1;
    if (retVal.charAt(retVal.length - 1) != '/' && part2.charAt(0) != '/') retVal = retVal + "/";
    retVal = retVal + part2;
    return retVal;
  }
}
