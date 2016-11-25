import {Injectable} from "@angular/core";
import {environment} from "../../environments/environment";
import {AppConstants as AppConstants} from "../constants/app-constants";
import {DevEnvironmentConstant, ProdEnvironmentConstant} from "../constants";

@Injectable()

export class ConstantsService {
  public get appConstants() {
    return AppConstants;
  }

  public get envConstants() {
    if (environment.production) return ProdEnvironmentConstant;
    return DevEnvironmentConstant;
  }
}
