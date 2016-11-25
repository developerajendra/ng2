import {FormGroup} from "@angular/forms";
import {StaticDataService} from "./static.data.service";
import {Inject} from "@angular/core";


/**
 * Exporting Service ValidationService
 */
export class ValidationService {

  constructor(@Inject(StaticDataService)  private _staticDataService: StaticDataService) {

  }

  getDataValidations() {
    this._staticDataService.getDataValidation().then(data=> {/*console.log(data,"123123")*/
    }, error=> {/*console.log(error,"45645664566")*/
    });
  }

  /**
   * getValidatorErrorMessage() used for Validator Error Messages
   * @param code
   * @param controlName
   * @returns {any}
   */

  static getValidatorErrorMessage(controlProperty: string, controlName: any, displayMessage: any) {
    controlName = controlName.replace(/_/g, " ");
    controlName = controlName.toUpperCase().charAt(0) + controlName.slice(1);
    if (displayMessage && typeof displayMessage === "string") {
      return displayMessage;
    }
    return displayMessage[controlProperty] || controlName;
    /*

     displayName = displayName || controlName;
     let config = {
     'required': displayName,
     'minlength': "Password must be at least 7 characters long.",
     'areEqual': 'Password not matched.',
     'invalidCreditCard': 'Is invalid credit card number',
     'invalidEmailAddress': 'Invalid email address',
     'invalidPassword': 'Invalid password.,it must include atleast 1 special character and one letter in upper case.'
     };
     return config[code];*/
  }

  /**
   * creditCardValidator() used to validate CreditCard
   * @param control
   * @returns {any}
   */
  static creditCardValidator(control) {
    /*Visa, MasterCard, American Express, Diners Club, Discover, JCB*/
    if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      return null;
    } else {
      return {'invalidCreditCard': true};
    }
  }

  /**
   * emailValidator() used to validate email
   * @param control
   * @returns {any}
   */
  static emailValidator(control) {
    /*RFC 2822 compliant regex*/
    if (control.value.match(/\S+@\S+\.\S+/)) {
      return null;
    } else {
      return {'valid_email': true};
    }
  }

  /**
   * cvvValidator() used to validate email
   * @param control
   * @returns {any}
   */
  static cvvValidator(control) {
    /* RFC 2822 compliant regex*/
    if (control.value.match(/^([0-9]{3,4})$/)) {
      return null;
    } else {
      return {'required': true};
    }
  }

  /**
   * passwordValidator() used to validate password
   * @param control
   * @returns {any}
   */
  static passwordValidator(control) {
    /* {6,100}           - Assert password is between 6 and 100 characters
     (?=.*[0-9])       - Assert a string has at least one number*/
    if (control.value.match(/^(?=.*[A-Z])(?=.*[$@$!%*#-?&<>?/.,';":"]).{1,200}$/)) {
      return null;
    } else {
      return {'invalidPassword': true};
    }
  }

  /**
   * areEqual() used to check the equality
   * @param ControlGroup
   * @returns {Object}
   */

  static areEqual(group: FormGroup) {
    let val;
    let valid = true;
    for (name in group.controls) {
      if (val === undefined) {
        val = group.controls[name].value
      } else {
        if (val !== group.controls[name].value) {
          valid = false;
          break;
        }
      }
    }
    if (valid) {
      return null;
    }
    return {
      areEqual: true
    };
  }
}
