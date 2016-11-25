/**
 * Importing core components
 */

import {Component, Host} from '@angular/core';
import {NgFormModel} from '@angular/common';

/**
 * Importing custom services
 */

import {ValidationService, StaticDataService} from '../../services';

/**
 * @Component for control-messages-component
 */

@Component({
  selector: 'control-messages',
  inputs: ['controlName: control', 'displayMessage: displayMessage'],
  template: `<div *ngIf="errorMessage !== null" class="error text-small">{{errorMessage}}</div>`
})

/**
 * Exporting class (ControlMessages) for control-messages-component
 */

export class ControlMessages {
  controlName:string;
  displayMessage:string;
  validationMessages:any;

  /**
   * constructor() used to initialize class level variables
   * @param _formDir
   */

  constructor(private _formDir:NgFormModel, private _staticDataService:StaticDataService) {

  }

  /**
   * errorMessage() used to print error messages
   * @returns {any}
   */

  get errorMessage() {
    let control = this._formDir.form.find(this.controlName);
    for (let propertyName in control.errors) {
      if (control.errors.hasOwnProperty(propertyName) || ( control.hasOwnProperty("controls"))) {
        return ValidationService.getValidatorErrorMessage(propertyName, this.controlName, this.displayMessage);
      }
    }
    return null;
  }
}
