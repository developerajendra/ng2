/**
 * Importing core components
 */

import {Component, OnInit, ElementRef, OnDestroy} from '@angular/core';
import {FormBuilder, Validators, ControlGroup, Control} from '@angular/common';
import * as moment from 'moment';


/**
 * Importing custom services
 */
import {UserService,StaticDataService, CookiesService} from '../../services';

/**
 * Importing app level constants
 */

import {TenantConstant,AppConstants} from '../../constants';

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

declare var $:any;

/**
 * @Component for user-prescriptions-component
 */

@Component({
  selector: 'user-prescriptions',
  templateUrl: 'user-prescriptions-component.html',
  styleUrls: ['user-prescriptions-component.scss']
})

/**
 * Exporting class (UserPrescriptionsComponent) from user-prescriptions-component
 */

export class UserPrescriptionsComponent implements OnInit, OnDestroy {

  private months:any = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  private days:any = [];
  private years:any = [];
  private masterRx:any = {
    "doctor_info": {
      "doctor_name": "",
      "doctor_phone": "",
      "patient_dob": ""
    },
    "entered_at": '',
    "friendly_name": "",
    "is_high_index": false,
    "is_progressive": false,
    "left": {
      "axis": 0,
      "cylinder": 0,
      "sphere": 0
    },
    "pd": {
      "bino": 0,
      "mono_left": 0,
      "mono_right": 0
    },
    "right": {
      "axis": 0,
      "cylinder": 0,
      "sphere": 0
    },
    "rx_file": null,
    "rx_type": "RX_CALL_DOCTOR",//'RX_ENTER_NOW', 'RX_SEND_LATER', 'RX_UPLOAD', 'RX_READING', 'RX_CALL_DOCTOR'
    "valid_rx": ""
  };
  private prescriptionData:any = {};
  private sub:any = null;
  private rx_index:number = 0;
  private isFileUploaded:boolean = false;

  dob_dd:string = '';
  dob_mm:string = '';
  dob_yy:string = '';

  rx_Object:any = null;
  rxForm:any = null;
  rxFile:any = null;
  isRxImage:boolean = false;
  activeForm:boolean = false;
  selectedRx:any = null;
  userInfo:any = null;
  activeRadio:string = 'enterItNow';
  isLoading:boolean = false;
  attemptSubmit:boolean = false;
  isAdding:boolean = false;
  isEditing:boolean = false;
  validationMessages:any;
  private formBuilder:any;
  showDobErrorMessage:any = '';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(private elementRef:ElementRef, private _staticDataService:StaticDataService, private _userService:UserService, private _formBuilder:FormBuilder, private _cookie:CookiesService) {
    this.formBuilder = _formBuilder;
    this._staticDataService.getDataValidation().then((data:any)=>this.validationMessages = data.checkout.validation.customize, error=> {});
    this.rxForm = this.formBuilder.group({
      'patientName': new Control(''),
      'doctorName': new Control(''),
      'doctorPhone': new Control(''),
      'month': new Control(''),
      'day': new Control(''),
      'year': new Control(''),
      'highIndex': new Control(''),
      'nameOnRx': new Control(''),
      'sphereR': new Control(''),
      'cylinderR': new Control(''),
      'axisR': new Control(''),
      'sphereL': new Control(''),
      'cylinderL': new Control(''),
      'axisL': new Control(''),
      'bino': new Control(''),
      'mono_right': new Control(''),
      'mono_left': new Control(''),
      'uploadFile': new Control('')
    });
    this.getUserInfo();
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.resetValues();
    this.getYear();
    this.getPrescription();
    this.getMonth();
  }

  /**
   * reInitValidations() used to reset validations
   */

  reInitValidations(rx?:any) {
    this.resetForm();
    if (rx) {
      switch (rx.rx_type) {
        case'RX_CALL_DOCTOR':
          this.activeRadio = 'callMyDoctor';
          this.isEditing = true;
          this.callMyDoctor(rx);
          break;
        case'RX_ENTER_NOW':
          this.activeRadio = 'enterItNow';
          this.isEditing = true;
          this.enterItNow(rx);
          break;
        case'RX_UPLOAD':
          this.activeRadio = 'digitalCopy';
          this.isEditing = true;
          this.digitalCopyUpload(rx);
          break;
      }
    } else {
      switch (this.activeRadio) {
        case'callMyDoctor':
          this.activeRadio = 'callMyDoctor';
          this.callMyDoctor();
          break;
        case'enterItNow':
          this.activeRadio = 'enterItNow';
          this.enterItNow();
          break;
        case'digitalCopy':
          this.activeRadio = 'digitalCopy';
          this.digitalCopyUpload();
          break;
      }
    }
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    this.isLoading = true;
    this._userService.getUserInfo().then(data => {
      if (data.rx && data.rx.length) {
        data.rx = data.rx.filter((rx:any)=> {
          return rx.rx_type !== 'RX_SEND_LATER';
        });
        data.rx.map((rx:any)=> {
          rx.isEdit = (TenantConstant.RX_TYPE_NOT_EDIT.indexOf(rx.rx_type) === -1);
        });
      }
      this.userInfo = data;
      this.resetValues();
      changeStatus();
    }, error => {
      this.resetValues();
      changeStatus();
    });
  }

  /**
   * removeRx() used to remove a prescription
   */
  removeRx(index) {
    if (this.isAdding || this.isEditing) {
      this.reInitValidations();
    }
    this.resetValues();
    this.isLoading = true;
    this.userInfo.rx.splice(index, 1);
    this._userService.updateUser(this.userInfo.email, this.userInfo).then(data => {
      this.userInfo = data;
      this.isLoading = false;
    }, error => {
      this.isLoading = false;
      this.getUserInfo();
    });
  }

  /**
   * editRx() used to edit a prescription
   */
  editRx(index) {
    this.resetValues();
    this.rx_index = index;
    let rx:any = this.userInfo.rx[index];
    this.rx_Object = JSON.parse(JSON.stringify(rx));
    this.activeForm = false;
    setTimeout(() => this.activeForm = true, 0);
    this.reInitValidations(this.rx_Object);

    let diff:any = $(this.elementRef.nativeElement).find("#editRx").offset().top - $(this.elementRef.nativeElement).parents('body').find('header').height();
    $('body, html').animate({scrollTop: diff}, 1000);
  }

  /**
   * viewRx() used to view uploaded prescription
   */
  viewRx(index) {
    if (this.isAdding || this.isEditing) {
      this.reInitValidations();
    }
    this.resetValues();
    this.selectedRx = this.userInfo.rx[index];
    if (this.selectedRx.rx_file) {
      this.isLoading = true;
      let imgExt = this.selectedRx.rx_file.split('.').slice(-1)[0].toLowerCase();
      this.isRxImage = (TenantConstant.IMAGE_EXT_TO_VIEW.toString().toLowerCase().indexOf(imgExt) > -1);
      this._userService.getRxFile(this.selectedRx.rx_file).then(data=> {
        this.isLoading = false;
        this.rxFile = data;
      }, error=> {
        this.isLoading = false;
      });
    }
  }

  /**
   * addRx() used to add a new prescription
   */
  addRx() {
    this.resetValues();
    this.isAdding = true;
    this.rx_Object = JSON.parse(JSON.stringify(this.masterRx));
    let diff:any = $(this.elementRef.nativeElement).find("#editRx").offset().top - $(this.elementRef.nativeElement).parents('body').find('header').height();
    $('body, html').animate({scrollTop: diff}, 1000);
    this.activeForm = false;
    setTimeout(() => this.activeForm = true, 0);
    this.reInitValidations();
  }

  /**
   * getYear function used for get the years
   */
  getYear() {
    let year:number = (new Date()).getFullYear();
    for (let i = 1917; i <= year; i++) {
      this.years.push(i);
    }
  }

  /**
   * getMonth function for get the months
   */
  getMonth() {
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
  }

  /**
   * change() used to refresh rx_object
   */
  change(value) {
    this.activeRadio = value;
    this.rx_Object = JSON.parse(JSON.stringify(this.masterRx));
    this.activeForm = false;
    setTimeout(() => this.activeForm = true, 0);
    this.reInitValidations();
  }

  /**
   * save() used to save prescription.
   */
  save() {
    this.attemptSubmit = true;
    if ((this.rxForm.valid || this.isFileUploaded) && this.userInfo) {
      this.isLoading = true;
      let data:any = this.rxForm.value;
      this.rx_Object.friendly_name = data.patientName;
      this.rx_Object.doctor_info.doctor_name = data.doctorName;
      this.rx_Object.doctor_info.doctor_phone = data.doctorPhone;
      this.rx_Object.is_high_index = data.highIndex;
      this.rx_Object.name_on_rx = data.nameOnRx || data.patientName;
      this.rx_Object.right.sphere = +data.sphereR;
      this.rx_Object.right.cylinder = +data.cylinderR;
      this.rx_Object.right.axis = +data.axisR;
      this.rx_Object.left.sphere = +data.sphereL;
      this.rx_Object.left.cylinder = +data.cylinderL;
      this.rx_Object.left.axis = +data.axisL;
      this.rx_Object.pd.bino = +data.bino;
      this.rx_Object.pd.mono_right = +data.mono_right;
      this.rx_Object.pd.mono_left = +data.mono_left;
      if (this.rx_Object.rx_type === 'RX_CALL_DOCTOR') {
        var _dob = data.month + '-' + data.day + '-' + data.year;
        if (!data.day || data.day == 'Day' || !data.month || data.month == 'Month' || !data.year || data.year == 'Year' || moment(_dob).toString().trim() == 'Invalid date') {
          this.showDobErrorMessage = 'Please enter a valid date.';
          this.isLoading = false;
          return;
        }
        this.rx_Object.doctor_info.patient_dob = _dob;

        var _month = m = 1 + this.months.indexOf(data.month);
        var m = "";
        if (_month < 10) {
          m = "0" + _month;
        } else {
          m = _month;
        }

        let changedDate = data.year + m + data.day;

        let patientDOB = moment(changedDate).utcOffset(0).toString();
        let currentDate = moment().utcOffset(0).toString();


        if (moment(patientDOB).format('x') > moment(currentDate).format('x')) {
          this.showDobErrorMessage = 'Date should be either current date or less than current date.';
          return;
        } else {
          this.showDobErrorMessage = '';
        }


      } else {
        this.rx_Object.doctor_info.patient_dob = '';
      }

      if (!this.rx_Object.rx_file) {
        delete this.rx_Object.rx_file;
      }
      delete  this.rx_Object.isEdit;

      if (!this.isAdding && this.isEditing) {
        this.rx_Object.valid_rx = 'VALID';
        this.rx_Object.id = this.userInfo.rx[this.rx_index].id;
        this._userService.updateRxObject(this.rx_Object).then(data => {
          data.isEdit = (TenantConstant.RX_TYPE_NOT_EDIT.indexOf(data.rx_type) === -1);
          this.userInfo.rx[this.rx_index] = JSON.parse(JSON.stringify(data));
          this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(this.userInfo), null);
          this.resetValues();
        }, error => {
          this.getUserInfo();
          this.isLoading = false;
        });
      } else {
        this.rx_Object.valid_rx = 'NEW';
        this._userService.createRxObject(this.rx_Object).then(data => {
          data.isEdit = (TenantConstant.RX_TYPE_NOT_EDIT.indexOf(data.rx_type) === -1);
          this.userInfo.rx = this.userInfo.rx || [];
          this.userInfo.rx.push(data);
          this._cookie.setCookie(AppConstants.USER_COOKIE, JSON.stringify(this.userInfo), null);
          this.resetValues();
        }, error => {
          this.resetValues();
        });
      }
    }
  }

  /**
   * getPrescription() used to get static content
   */

  getPrescription() {
    this.sub = this._staticDataService.getCustomizeLenses().subscribe((data) => {
        this.prescriptionData = data;
      },
        err => {/*console.log(err)*/
      }
    );
  }


  /**
   * fileUpload Event
   * @param event
   */
  fileUpload(event) {
    this.attemptSubmit = false;
    this.isLoading = true;
    let reader = new FileReader();
    reader.onload = ()=> {
      this.rx_Object.rx_file = {
        data: btoa(reader.result),
        filename: event.target.files[0].name,
        content_type: event.target.files[0].type
      };
      this.isFileUploaded = true;
      this.isLoading = false;
      this.reInitValidations(this.rx_Object);
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  /**
   * resetValues() used to reset default values
   */

  private resetValues() {
    this.showDobErrorMessage = '';
    this.activeRadio = 'enterItNow';
    this.isLoading = false;
    this.attemptSubmit = false;
    this.isAdding = false;
    this.isEditing = false;
    this.selectedRx = null;
    this.rxFile = null;
    this.rx_index = 0;
  }

  /**
   * resetForm() used to reset form values
   */

  private resetForm() {
    Object.keys(this.rxForm.controls).map((key)=> {
      this.rxForm.controls[key].updateValueAndValidity('');
      this.rxForm.controls[key].validator = null;
      this.rxForm.controls[key].setErrors(null);
    });
    this.attemptSubmit = false;
  }

  /**
   * callMyDoctor() used to reset validations for call my doctor rx
   */

  private callMyDoctor(rx?:any) {
    let dob = rx && rx.doctor_info.patient_dob.split('-') || '';
    this.rx_Object.entered_at = rx && rx.entered_at || moment().toString();
    this.rx_Object.rx_type = 'RX_CALL_DOCTOR';
    this.rx_Object.is_high_index = true;
    this.dob_mm = dob && dob[0] || '';
    this.dob_dd = dob && dob[1] || '';
    this.dob_yy = dob && dob[2] || '';
    this.rxForm.controls['patientName'].updateValue(rx && rx.friendly_name || '');
    this.rxForm.controls['nameOnRx'].updateValue(rx && rx.friendly_name || '');
    this.rxForm.controls['doctorName'].updateValue(rx && rx.doctor_info.doctor_name || '');
    this.rxForm.controls['doctorPhone'].updateValue(rx && rx.doctor_info.doctor_phone || '');
    this.rxForm.controls['day'].updateValue(this.dob_dd);
    this.rxForm.controls['month'].updateValue(this.dob_mm);
    this.rxForm.controls['year'].updateValue(this.dob_yy);
    this.rxForm.controls['highIndex'].updateValue(this.rx_Object.is_high_index);
    this.rxForm.controls['patientName'].validator = Validators.required;
    this.rxForm.controls['doctorName'].validator = Validators.required;
    this.rxForm.controls['doctorPhone'].validator = Validators.required;
    this.rxForm.controls['day'].validator = Validators.required;
    this.rxForm.controls['month'].validator = Validators.required;
    this.rxForm.controls['year'].validator = Validators.required;
    this.rxForm.controls['highIndex'].validator = Validators.required;
  }

  /**
   * enterItNow() used to reset validations for enter now rx
   */

  private enterItNow(rx?:any) {
    this.rx_Object.entered_at = rx && rx.entered_at || moment().toString();
    this.rx_Object.rx_type = 'RX_ENTER_NOW';
    this.rxForm.controls['nameOnRx'].updateValue(rx && rx.name_on_rx || '');
    this.rxForm.controls['sphereR'].updateValue(rx && rx.right.sphere || '');
    this.rxForm.controls['cylinderR'].updateValue(rx && rx.right.cylinder || '');
    this.rxForm.controls['axisR'].updateValue(rx && rx.right.axis || '');
    this.rxForm.controls['sphereL'].updateValue(rx && rx.left.sphere || '');
    this.rxForm.controls['cylinderL'].updateValue(rx && rx.left.cylinder || '');
    this.rxForm.controls['axisL'].updateValue(rx && rx.left.axis || '');
    this.rxForm.controls['bino'].updateValue(rx && rx.pd.bino || '');
    this.rxForm.controls['mono_right'].updateValue(rx && rx.pd.mono_right || '');
    this.rxForm.controls['mono_left'].updateValue(rx && rx.pd.mono_left || '');
    this.rx_Object.is_high_index = this.isHighIndex();
    this.rxForm.controls['highIndex'].updateValue(this.rx_Object.is_high_index);

    this.rxForm.controls['nameOnRx'].validator = Validators.required;
    this.rxForm.controls['sphereR'].validator = Validators.required;
    this.rxForm.controls['cylinderR'].validator = Validators.required;
    this.rxForm.controls['axisR'].validator = Validators.required;
    this.rxForm.controls['sphereL'].validator = Validators.required;
    this.rxForm.controls['cylinderL'].validator = Validators.required;
    this.rxForm.controls['axisL'].validator = Validators.required;
    this.rxForm.controls['highIndex'].validator = Validators.required;
  }

  /**
   * digitalCopy() used to reset validations for digital copy upload
   */

  private digitalCopyUpload(rx?:any) {
    this.rx_Object.entered_at = rx && rx.entered_at || moment().toString();
    this.rx_Object.is_high_index = true;
    this.rx_Object.rx_type = 'RX_UPLOAD';
    this.rxForm.controls['nameOnRx'].updateValue('Uploaded');
    this.rxForm.controls['uploadFile'].updateValue(rx && rx.rx_file || '');
    this.rxForm.controls['highIndex'].updateValue(this.rx_Object.is_high_index);
    this.rxForm.controls['uploadFile'].validator = Validators.required;
    this.rxForm.controls['highIndex'].validator = Validators.required;
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.resetValues();
  }

  isHighIndex() {
    let left_sphere = Math.abs(+this.rxForm.controls['sphereL'].value),
      right_sphere = Math.abs(+this.rxForm.controls['sphereR'].value),
      left_cylinder = Math.abs(+this.rxForm.controls['cylinderL'].value),
      right_cylinder = Math.abs(+this.rxForm.controls['cylinderR'].value);

    if ((left_sphere > 4) || (right_sphere > 4)) {
      return true;
    }
    else if (( (left_cylinder) && (left_cylinder > 2) ) || ( (right_cylinder) && (right_cylinder > 2) )) {
      return true;
    }
    else {
      let max_sphere = Math.max(left_sphere, right_sphere);
      let max_cylinder = Math.max(left_cylinder, right_cylinder);
      return ((max_sphere + max_cylinder) >= 4);
    }
  }

  downloadRxFile() {
    var $pom = document.createElement('a');
    $pom.setAttribute('href', this.rxFile);
    $pom.setAttribute('download', this.selectedRx.rx_file);
    $pom.click();
  }
}
