/**
 * Importing core components
 */

import {Component, OnInit, OnDestroy} from "@angular/core";
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from "@angular/router";
import {FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES, FormBuilder} from "@angular/forms";
import * as moment from "moment";
import {AppConstants} from "../../constants/app-constants";
import {TenantConstant} from "../../constants/tenant";
import {Validators, Control} from "@angular/common";
import {CookiesService, CartService, StaticDataService, NotifyService, UserService} from "../../services";
import {ControlMessages} from "../control-messages-component";
import {ProductTileComponent} from "../product-tile-component";
import {BreadCrumbComponent} from "../breadcrumb-component";
import {RxModel} from "../../models";

declare var window:any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for customize-lenses-component
 */

@Component({
  selector: 'customize-lenses',
  templateUrl: 'customize-lenses-component.html',
  styleUrls: ['customize-lenses-component.scss'],
  directives: [BreadCrumbComponent, ControlMessages, ROUTER_DIRECTIVES, ProductTileComponent, FORM_DIRECTIVES, REACTIVE_FORM_DIRECTIVES],
  providers: [FormBuilder]

})

/**
 * Exporting class (CustomizeLensesComponent) from customize-lenses-componentgit
 */

export class CustomizeLensesComponent implements OnInit, OnDestroy {

  private prescriptionData:any = {};
  private selectedLens:any = "";
  private selectedGroup:any = "";
  private currentUrl:any = null;
  public moment:any;

  customizeLens:any;
  selectedRxIndex:any = {0: true};
  attemptSubmit:boolean = false;
  showIsHighIndex:boolean = false;
  userInfo:any = null;
  staticMsgs:any = null;

  onHandDemoYesGroup = null;
  onHandDemoNoGroup = null;

  callMyDoctorGroup = null;
  uploadDigitalCopyGroup = null;
  iWillSendItLaterGroup = null;
  iWillEnterNowGroup = null;

  _callMyDoctorGroup = null;
  _uploadDigitalCopyGroup = null;
  _iWillSendItLaterGroup = null;

  readingGroup = null;

  planoLensGroup = null;

  noLensGroup = null;

  lensDescription:string = 'Including lenses';
  lensPrice:any = null;

  isExistingRx:boolean = false;

  isKioskMode:boolean = false;

  isLoading:boolean = false;

  isFileuploaded:boolean = false;

  isRxSun:boolean = false;

  dayValue:string = '';
  monthValue:string = '';
  yearValue:string = '';

  doctorName:string = '';
  doctorPhone:string = '';
  patientName:string = '';

  lensStrengthValue:string = '';

  rightSphereValue:string = '';
  rightCylinderValue:string = '';
  rightAxisValue:string = '';

  leftSphereValue:string = '';
  leftCylinderValue:string = '';
  leftAxisValue:string = '';

  pdBinoValue:string = '';
  pdRightValue:string = '';
  pdLeftValue:string = '';

  isHighIndex:boolean = true;

  rxFile:any = {
    "data": "",
    "filename": "",
    "storage_type": "",
    "content_type": ""
  };

  showFlag:boolean = true;
  showDobErrorMessage:any = '';

  private months:any = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  private days:any = [];
  private years:any = [];
  private subs:any = [];
  cartItems:any = null;
  rx_product_ids:any = [];
  rx_product:any = null;
  rx_product_price:any = 0;
  private count:any = 0;
  rx_id:any = 0;
  validationMessages:any;
  clickedToggle:boolean = false;


  rx_Options = {
    prescriptionSendItLater: 'RX_SEND_LATER',
    progressiveSendItLater: 'RX_SEND_LATER',
    prescriptionCallMyDoctor: 'RX_CALL_DOCTOR',
    progressiveCallMyDoctor: 'RX_CALL_DOCTOR',
    prescriptionEnterItNow: 'RX_ENTER_NOW',
    prescriptionDigitalCopy: 'RX_UPLOAD',
    progressiveDigitalCopy: 'RX_UPLOAD',
    reading: 'RX_READING',
    noCorrectiveLens: 'RX_READING',
    noLenses: 'RX_READING',
    /*onHandInventoryYes: 'RX_INVENTORY',
     onHandInventoryNo: 'RX_INVENTORY',*/
    onHandInventoryYes: 'ONHAND_NON_RX_SUN_LENS',
    onHandInventoryNo: '',
  };

  lensType = {
    prescription: 'STANDARD_INDEX_LENS',
    prescription_high_index: 'STANDARD_INDEX_LENS',

    progressive: 'PRG_STANDARD_LENS',
    progressive_high_index: 'PRG_STANDARD_LENS',

    reading: 'READING_LENS',
    noCorrectiveLens: 'PLANO_LENS',
    noLenses: 'NO_LENS',
    onHandInventoryYes: 'ONHAND_NON_RX_SUN_LENS',
  };
  rx_lensType = {
    prescription: 'RX_SUN_LENS',
    progressive: 'PRG_RX_SUN_LENS',
    onHandInventoryYes: 'ONHAND_NON_RX_SUN_LENS',
  };

  lensType_rx = {
    STANDARD_INDEX_LENS: 'prescription',
    HIGH_INDEX_LENS: 'prescription',
    RX_SUN_LENS: 'prescription',

    PRG_STANDARD_LENS: 'progressive',
    PRG_HIGH_INDEX_LENS: 'progressive',
    PRG_RX_SUN_LENS: 'progressive',

    READING_LENS: 'reading',
    PLANO_LENS: 'nonPrescription',
    NO_LENS: 'nonPrescription',
    ONHAND_NON_RX_SUN_LENS: 'onHandInventoryYes'
  };

  options_rx = {
    RX_SEND_LATER: 'SendItLater',
    RX_CALL_DOCTOR: 'CallMyDoctor',
    RX_ENTER_NOW: 'EnterItNow',
    RX_UPLOAD: 'DigitalCopy',
    RX_READING: '',
    RX_INVENTORY: '',
  };

  priceDescription_rx = TenantConstant.priceDescription;
  rx_Object:any = null;

  /**
   * constructor() used to initialize class level variables
   */


  constructor(private _staticDataService:StaticDataService, private _cookie:CookiesService, private _notifyHeader:NotifyService,
              private prescription:StaticDataService, private builder:FormBuilder, private _cartService:CartService, private _router:Router,
              private _route:ActivatedRoute, private _userService:UserService) {
    this.moment = moment;
    this._staticDataService.getDataValidation().then((data:any)=> {
      this.validationMessages = data.checkout.validation.customize;
      this.staticMsgs = data.signIn;
    }, e => {
    });
    this.initGroups();
    this.getUserInfo();
    this.getKiosks();
    this.showCustomizeLenses();
    let sub1 = this._cartService.cartItems$.subscribe(cartItems=> {
      this.cartItems = cartItems;
      this.getRxProduct(this.cartItems);
      this.getRxProductIds(this.cartItems);
    }, e=> {
    });
    let sub2 = this._route.params.subscribe(params => {
      this.rx_id = params['rx'];
      this.cartItems && this.getRxProduct(this.cartItems);
    });
    this.subs.push(sub1);
    this.subs.push(sub2);
  }

  initGroups() {
    this.customizeLens = this.builder.group({
      'prescription': this.builder.group({
        'iWillSendItLater': new Control(''),
        'iWillSendItLaterGroup': this.builder.group(this.iWillSendItLaterGroup || {
            'iWillSendItLater': new Control(''),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control(''),
          }),
        'callMyDoctor': new Control(''),
        'callMyDoctorGroup': this.builder.group(this.callMyDoctorGroup || {
            'patientName': new Control(''),
            'doctorName': new Control(''),
            'doctorPhone': new Control(''),
            'patientDateOfMonth': new Control(''),
            'patientBirthDay': new Control(''),
            'patientBirthYear': new Control(''),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control('')
          }),
        'iWillEnterNow': new Control(''),
        'iWillEnterNowGroup': this.builder.group(this.iWillEnterNowGroup || {
            'nameOnPrescription': new Control(''),
            'rightOd': this.builder.group({
              'sphere': new Control(''),
              'cylinder': new Control(''),
              'axis': new Control('')
            }),
            'leftOs': this.builder.group({
              'sphere': new Control(''),
              'cylinder': new Control(''),
              'axis': new Control('')
            }),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control('')
          }),
        'uploadDigitalCopy': new Control(''),
        'uploadDigitalCopyGroup': this.builder.group(this.uploadDigitalCopyGroup || {
            'uploadFile': new Control(''),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control('')
          })
      }),
      'progressive': this.builder.group({
        'iWillSendItLater': new Control(''),
        '_iWillSendItLaterGroup': this.builder.group(this._iWillSendItLaterGroup || {
            'iWillSendItLater': new Control(''),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control(''),
          }),
        'callMyDoctor': new Control(''),
        '_callMyDoctorGroup': this.builder.group(this._callMyDoctorGroup || {
            'patientName': new Control(''),
            'doctorName': new Control(''),
            'doctorPhone': new Control(''),
            'patientDateOfMonth': new Control(''),
            'patientBirthDay': new Control(''),
            'patientBirthYear': new Control(''),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control('')
          }),
        'uploadDigitalCopy': new Control(''),
        '_uploadDigitalCopyGroup': this.builder.group(this._uploadDigitalCopyGroup || {
            'uploadFile': new Control(''),
            'pupillaryDistance': this.builder.group({
              'binocular': new Control(''),
              'right': new Control(''),
              'left': new Control('')
            }),
            'highIndex': new Control('')
          })
      }),
      'reading': new Control(''),
      'readingGroup': this.builder.group(this.readingGroup || {
          'glassesStrength': new Control('')
        }),
      'planoLens': new Control(''),
      'planoLensGroup': this.builder.group(this.planoLensGroup || {
          'planoLens': new Control('')
        }),
      'noLens': new Control(''),
      'noLensGroup': this.builder.group(this.noLensGroup || {
          'noLens': new Control('')
        }),
      'onHandInventoryYes': new Control(''),
      'onHandDemoYesGroup': this.builder.group(this.onHandDemoYesGroup || {
          'onHandInventoryYes': new Control('')
        }),
      'onHandInventoryNo': new Control(''),
      'onHandDemoNoGroup': this.builder.group(this.onHandDemoNoGroup || {
          'onHandInventoryNo': new Control('')
        })
    });
  }

  initGroupsSelectedLens() {
    this.customizeLens.controls['prescription'].controls['uploadDigitalCopyGroup'].controls['uploadFile'].updateValue("");
    this.customizeLens.controls['progressive'].controls['_uploadDigitalCopyGroup'].controls['uploadFile'].updateValue("");

    this.callMyDoctorGroup = null;
    this.iWillSendItLaterGroup = null;
    this.iWillEnterNowGroup = null;
    this._callMyDoctorGroup = null;
    this._iWillSendItLaterGroup = null;
    this.readingGroup = null;
    this.planoLensGroup = null;
    this.noLensGroup = null;
    this.onHandDemoYesGroup = null;
    this.onHandDemoNoGroup = null;
    this.showIsHighIndex = false;
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getYear();
    this.getMonth();
    this.getPrescription();
    this._notifyHeader.currentPage(true);
    this.getKiosks();
    changeStatus();
    this.getRxObject();
  }

  /**
   * getRxObject() from models
   */
  getRxObject(){
    this.rx_Object = new RxModel();
    this.rx_Object = this.rx_Object.rxObject;
  }

  /**
   * ngOnDestroy() used to destroy notify
   */

  ngOnDestroy() {

    this._notifyHeader.currentPage(false);
    this.subs.forEach((sub:any)=> {
      sub.unsubscribe();
    });
  }


  /**
   * Select lens
   * @param val
   */
  selectLens(val) {
    this.showDobErrorMessage = '';

    this.initGroupsSelectedLens();

    this.initGroups();

    this.dayValue = '';
    this.monthValue = '';
    this.yearValue = '';

    this.doctorName = '';
    this.doctorPhone = '';
    this.patientName = '';

    this.lensStrengthValue = '';

    this.rightSphereValue = '';
    this.rightCylinderValue = '';
    this.rightAxisValue = '';

    this.leftSphereValue = '';
    this.leftCylinderValue = '';
    this.leftAxisValue = '';

    this.pdBinoValue = '';
    this.pdRightValue = '';
    this.pdLeftValue = '';

    this.isFileuploaded = false;

    this.isHighIndex = true;

    this.rxFile = {
      "data": "",
      "filename": "",
      "storage_type": "",
      "content_type": ""
    };

    this.attemptSubmit = false;

    switch (val) {
      case "onHandInventoryYes":
        this.selectedGroup = 'onHandInventoryYes';
        break;
      case "prescriptionSendItLater":
        this.iWillSendItLaterGroup = {
          'iWillSendItLater': [true],
          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        if (this.isRxSun === true)
          this.selectedGroup = 'prescription';
        else
          this.selectedGroup = 'prescription_high_index';
        break;
      case "prescriptionCallMyDoctor":
        this.callMyDoctorGroup = {
          'patientName': ['', Validators.required],
          'doctorName': ['', Validators.required],
          'doctorPhone': ['', Validators.required],
          'patientDateOfMonth': ['', Validators.required],
          'patientBirthDay': ['', Validators.required],
          'patientBirthYear': ['', Validators.required],
          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        if (this.isRxSun === true)
          this.selectedGroup = 'prescription';
        else
          this.selectedGroup = 'prescription_high_index';
        break;
      case "prescriptionEnterItNow":
        this.iWillEnterNowGroup = {
          'nameOnPrescription': ['', Validators.required],

          'rightOd': this.builder.group({
            'sphere': ['', Validators.required],
            'cylinder': ['', Validators.required],
            'axis': ['', Validators.required],
          }),

          'leftOs': this.builder.group({
            'sphere': ['', Validators.required],
            'cylinder': ['', Validators.required],
            'axis': ['', Validators.required],
          }),

          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        this.selectedGroup = 'prescription';
        break;
      case "prescriptionDigitalCopy":
        this.uploadDigitalCopyGroup = {
          'uploadFile': [''],
          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        if (this.isRxSun === true)
          this.selectedGroup = 'prescription';
        else
          this.selectedGroup = 'prescription_high_index';
        break;
      case "progressiveSendItLater":
        this._iWillSendItLaterGroup = {
          'iWillSendItLater': [true],
          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        if (this.isRxSun === true)
          this.selectedGroup = 'progressive';
        else
          this.selectedGroup = 'progressive_high_index';
        break;
      case "progressiveCallMyDoctor":
        this._callMyDoctorGroup = {
          'patientName': ['', Validators.required],
          'doctorName': ['', Validators.required],
          'doctorPhone': ['', Validators.required],
          'patientDateOfMonth': ['', Validators.required],
          'patientBirthDay': ['', Validators.required],
          'patientBirthYear': ['', Validators.required],
          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        if (this.isRxSun === true)
          this.selectedGroup = 'progressive';
        else
          this.selectedGroup = 'progressive_high_index';
        break;
      case "progressiveDigitalCopy":
        this._uploadDigitalCopyGroup = {
          'uploadFile': [''],
          'pupillaryDistance': this.builder.group({
            'binocular': [''],
            'right': [''],
            'left': ['']
          }),
          'highIndex': [true]
        };
        if (this.isRxSun === true)
          this.selectedGroup = 'progressive';
        else
          this.selectedGroup = 'progressive_high_index';
        break;
      case "reading":
        this.readingGroup = {
          'glassesStrength': ['', Validators.required],
        };
        break;
      case "noCorrectiveLens":
        this.planoLensGroup = {
          'planoLens': [true]
        };
        break;
      case "noLenses":
        this.noLensGroup = {
          'noLens': [true]
        };
        break;
    }

    this.initGroups();
    this.selectedLens = val;
    this.showDescription();
  }

  /**
   * Form submit
   */

  submitForm() {
    this.attemptSubmit = true;

    if (this.isExistingRx && this.rx_product) {
      let selectedRxIndex:any = Object.keys(this.selectedRxIndex)[0];
      let rx_Object:any = JSON.parse(JSON.stringify(this.userInfo.rx[selectedRxIndex]));

      rx_Object.rx_id = this.rx_id;
      rx_Object.isExistingRx = true;
      rx_Object.img_url = this.rx_product.imageUrl;
      rx_Object.color = this.rx_product.color;
      rx_Object.name = this.rx_product.name;
      rx_Object.product_id = this.rx_product.product_id;

      if (this.isRxSun === true) {
        rx_Object.rx_lens_type = this.rx_lensType['prescription'];
      } else {
        let rx_type:string = rx_Object.is_high_index ? 'prescription_high_index' : 'prescription';
        rx_Object.rx_lens_type = this.lensType[rx_type];
      }

      rx_Object.price = this.rx_product.prices[rx_Object.rx_lens_type + '_PRICE'];
      this.rx_product.rx[this.rx_id] = rx_Object;

      this.isExistingRx = false;
      this.selectedGroup = "";
      this.selectedLens = "";
      this.lensDescription = '';
      this.lensPrice = null;

      let isEdit = this._route.snapshot.params['edit'] || null;
      this.setRxProducts();
      if (this.rx_product_ids.length - 1 > this.count && !isEdit) {
        this._router.navigate(['/checkout/customize/' + this.rx_product_ids[++this.count]]);
      } else {
        this._router.navigate(['/checkout/review']);
      }
    } else if (!this.isExistingRx && ((this.customizeLens.valid && this.rx_product) || this.isFileuploaded)) {
      let rx_file:any = this.rx_product && this.rx_product.rx && this.rx_product.rx[this.rx_id] && this.rx_product.rx[this.rx_id].rx_file || {};
      let rx_Object:any = JSON.parse(JSON.stringify(this.rx_Object));

      switch (this.selectedGroup) {
        case 'onHandInventoryYes':
          switch (this.selectedLens) {
            case 'onHandInventoryYes':
              rx_Object.rx_lens_type = this.lensType[this.selectedLens];
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              break;
            case 'onHandInventoryNo':
              rx_Object.rx_lens_type = this.lensType[this.selectedLens];
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              break;
          }
          break;
        case 'prescription':
        case 'prescription_high_index':
          if (this.isRxSun === true)
            rx_Object.rx_lens_type = this.rx_lensType[this.selectedGroup];
          else
            rx_Object.rx_lens_type = this.lensType[this.selectedGroup];
          rx_Object.rx_type = this.rx_Options[this.selectedLens];
          switch (this.selectedLens) {
            case "prescriptionSendItLater":
              rx_Object.pd.bino = this.customizeLens.value.prescription.iWillSendItLaterGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.prescription.iWillSendItLaterGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.prescription.iWillSendItLaterGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.prescription.iWillSendItLaterGroup.highIndex;
              break;
            case "prescriptionCallMyDoctor":
              rx_Object.pd.bino = this.customizeLens.value.prescription.callMyDoctorGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.prescription.callMyDoctorGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.prescription.callMyDoctorGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.prescription.callMyDoctorGroup.highIndex;
              rx_Object.patient_name = this.customizeLens.value.prescription.callMyDoctorGroup.patientName;
              rx_Object.name_on_rx = this.customizeLens.value.prescription.callMyDoctorGroup.patientName;
              rx_Object.doctor_info.doctor_name = this.customizeLens.value.prescription.callMyDoctorGroup.doctorName;
              rx_Object.doctor_info.doctor_phone = this.customizeLens.value.prescription.callMyDoctorGroup.doctorPhone;
              rx_Object.doctor_info.patient_dob = this.customizeLens.value.prescription.callMyDoctorGroup.patientBirthDay + '-' +
                this.customizeLens.value.prescription.callMyDoctorGroup.patientDateOfMonth + '-' +
                this.customizeLens.value.prescription.callMyDoctorGroup.patientBirthYear;

              var _month = m = 1 + this.months.indexOf(this.customizeLens.value.prescription.callMyDoctorGroup.patientDateOfMonth);
              var m = "";
              if (_month < 10) m = "0" + _month;
              else m = _month;

              let changedDate = this.customizeLens.value.prescription.callMyDoctorGroup.patientBirthYear + m +
                this.customizeLens.value.prescription.callMyDoctorGroup.patientBirthDay;
              let patientDOB = moment(changedDate).utcOffset(0).toString();
              let currentDate = moment().utcOffset(0).toString();

              if (moment(patientDOB).format('x') > moment(currentDate).format('x')) {
                this.showDobErrorMessage = 'Date should be either current date or less than current date.';
                return;
              } else this.showDobErrorMessage = '';
              break;
            case "prescriptionEnterItNow":
              rx_Object.name_on_rx = this.customizeLens.value.prescription.iWillEnterNowGroup.nameOnPrescription;
              rx_Object.left.axis = this.customizeLens.value.prescription.iWillEnterNowGroup.leftOs.axis;
              rx_Object.left.cylinder = this.customizeLens.value.prescription.iWillEnterNowGroup.leftOs.axis;
              rx_Object.left.cylinder = this.customizeLens.value.prescription.iWillEnterNowGroup.leftOs.cylinder;
              rx_Object.left.sphere = this.customizeLens.value.prescription.iWillEnterNowGroup.leftOs.sphere;
              rx_Object.right.axis = this.customizeLens.value.prescription.iWillEnterNowGroup.rightOd.axis;
              rx_Object.right.cylinder = this.customizeLens.value.prescription.iWillEnterNowGroup.rightOd.cylinder;
              rx_Object.right.sphere = this.customizeLens.value.prescription.iWillEnterNowGroup.rightOd.sphere;
              rx_Object.pd.bino = this.customizeLens.value.prescription.iWillEnterNowGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.prescription.iWillEnterNowGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.prescription.iWillEnterNowGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.prescription.iWillEnterNowGroup.highIndex;
              break;
            case "prescriptionDigitalCopy":
              rx_Object.name_on_rx = 'Uploaded';
              rx_Object.pd.bino = this.customizeLens.value.prescription.uploadDigitalCopyGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.prescription.uploadDigitalCopyGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.prescription.uploadDigitalCopyGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.prescription.uploadDigitalCopyGroup.highIndex;
              break;
          }
          break;
        case 'progressive':
        case 'progressive_high_index':
          if (this.isRxSun === true)
            rx_Object.rx_lens_type = this.rx_lensType[this.selectedGroup];
          else
            rx_Object.rx_lens_type = this.lensType[this.selectedGroup];
          switch (this.selectedLens) {
            case "progressiveSendItLater":
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              rx_Object.pd.bino = this.customizeLens.value.progressive._iWillSendItLaterGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.progressive._iWillSendItLaterGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.progressive._iWillSendItLaterGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.progressive._iWillSendItLaterGroup.highIndex;
              rx_Object.is_progressive = true;
              break;
            case "progressiveCallMyDoctor":
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              rx_Object.pd.bino = this.customizeLens.value.progressive._callMyDoctorGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.progressive._callMyDoctorGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.progressive._callMyDoctorGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.progressive._callMyDoctorGroup.highIndex;
              rx_Object.patient_name = this.customizeLens.value.progressive._callMyDoctorGroup.patientName;
              rx_Object.name_on_rx = this.customizeLens.value.progressive._callMyDoctorGroup.patientName;
              rx_Object.doctor_info.doctor_name = this.customizeLens.value.progressive._callMyDoctorGroup.doctorName;
              rx_Object.doctor_info.doctor_phone = this.customizeLens.value.progressive._callMyDoctorGroup.doctorPhone;
              rx_Object.doctor_info.patient_dob = this.customizeLens.value.progressive._callMyDoctorGroup.patientBirthDay + '-' + this.customizeLens.value.progressive._callMyDoctorGroup.patientDateOfMonth + '-' + this.customizeLens.value.progressive._callMyDoctorGroup.patientBirthYear;
              rx_Object.is_progressive = true;

              var _month = m = 1 + this.months.indexOf(this.customizeLens.value.progressive._callMyDoctorGroup.patientDateOfMonth);
              var m = "";
              if (_month < 10) m = "0" + _month;
              else m = _month;

              let changedDate = this.customizeLens.value.progressive._callMyDoctorGroup.patientBirthYear + m + this.customizeLens.value.progressive._callMyDoctorGroup.patientBirthDay;

              let patientDOB = moment(changedDate).utcOffset(0).toString();
              let currentDate = moment().utcOffset(0).toString();

              if (moment(patientDOB).format('x') > moment(currentDate).format('x')) {
                this.showDobErrorMessage = 'Date should be either current date or less than current date.';
                return;
              } else
                this.showDobErrorMessage = '';

              break;
            case "progressiveDigitalCopy":
              rx_Object.name_on_rx = 'Uploaded';
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              rx_Object.pd.bino = this.customizeLens.value.progressive._uploadDigitalCopyGroup.pupillaryDistance.binocular;
              rx_Object.pd.mono_left = this.customizeLens.value.progressive._uploadDigitalCopyGroup.pupillaryDistance.left;
              rx_Object.pd.mono_right = this.customizeLens.value.progressive._uploadDigitalCopyGroup.pupillaryDistance.right;
              rx_Object.is_high_index = this.customizeLens.value.progressive._uploadDigitalCopyGroup.highIndex;
              rx_Object.is_progressive = true;
              break;
          }
          break;
        case 'reading':
          switch (this.selectedLens) {
            case "reading":
              rx_Object.rx_lens_type = this.lensType[this.selectedGroup];
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              rx_Object.left.sphere = +this.customizeLens.value.readingGroup.glassesStrength;
              rx_Object.right.sphere = +this.customizeLens.value.readingGroup.glassesStrength;
              rx_Object.name_on_rx = 'Reading';
              break;
          }
          break;
        case 'nonPrescription':
        {
          switch (this.selectedLens) {
            case "noCorrectiveLens":
              rx_Object.rx_lens_type = this.lensType[this.selectedLens];
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              rx_Object.left.sphere = 0.25;
              rx_Object.right.sphere = 0.25;
              break;
            case "noLenses":
              rx_Object.rx_lens_type = this.lensType[this.selectedLens];
              rx_Object.rx_type = this.rx_Options[this.selectedLens];
              rx_Object.left.sphere = 0.25;
              rx_Object.right.sphere = 0.25;
              break;
          }
          break;
        }
      }

      if (this.isFileuploaded) {
        rx_Object.rx_file = {
          data: rx_file.data || this.rxFile.data || '',
          content_type: rx_file.content_type || this.rxFile.content_type || '',
          filename: rx_file.filename || this.rxFile.filename || '',
          storage_type: rx_file.storage_type || this.rxFile.storage_type || ''
        };
      }
      rx_Object.isExistingRx = false;
      rx_Object.rx_id = this.rx_id;
      rx_Object.img_url = this.rx_product.imageUrl;
      rx_Object.color = this.rx_product.color;
      rx_Object.name = this.rx_product.name;
      rx_Object.product_id = this.rx_product.product_id;
      (rx_Object.rx_lens_type === 'ONHAND_NON_RX_SUN_LENS') ?
        rx_Object.price = this.rx_product.prices['NON_RX_SUN_LENS_PRICE'] :
        rx_Object.price = this.rx_product.prices[rx_Object.rx_lens_type + '_PRICE'];

      if (this.isRxSun === true)
        rx_Object.is_high_index = false;

      rx_Object.prices = this.rx_product.prices;

      this.selectedGroup = "";
      this.selectedLens = "";
      this.lensDescription = '';
      this.lensPrice = null;

      this.rx_product.rx[this.rx_id] = rx_Object;
      this.rx_product.totalPrice = rx_Object.price;

      let isEdit = this._route.snapshot.params['edit'] || null;
      this.setRxProducts();
      if (this.rx_product_ids.length - 1 > this.count && !isEdit)
        this._router.navigate(['/checkout/customize/' + this.rx_product_ids[++this.count]]);
      else
        this._router.navigate(['/checkout/review']);

      this.isFileuploaded = true;
    }
    else
      this.attemptSubmit = true;

    return false;
  }

  /**
   * Continue shopping button click
   */
  continueShopping() {
    // this.currentUrl ? this._router.navigate([this.currentUrl]) : this._router.navigateByUrl('/checkout/shipping');
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
   * fileUpload Event
   * @param event
   */
  fileUpload(event) {
    this.attemptSubmit = false;
    this.isLoading = true;
    let rx_Object:any = (this.rx_product && this.rx_product.rx && this.rx_product.rx[this.rx_id]) || null;
    let reader = new FileReader();
    if (!rx_Object) {
      this.isLoading = false;
    }
    reader.onload = ()=> {
      let file = btoa(reader.result);
      switch (this.selectedGroup) {
        case 'prescription':
        case 'prescription_high_index':
          switch (this.selectedLens) {
            case 'prescriptionDigitalCopy':
            {
              rx_Object.rx_file = {
                data: file,
                filename: event.target.files[0].name,
                content_type: event.target.files[0].type
              };
              this.isFileuploaded = true;
              break;
            }
          }
          break;
        case 'progressive':
        case 'progressive_high_index':
          switch (this.selectedLens) {
            case 'progressiveDigitalCopy':
            {
              rx_Object.rx_file = {
                data: file,
                filename: event.target.files[0].name,
                content_type: event.target.files[0].type
              };
              this.isFileuploaded = true;
              break;
            }
          }
          break;
      }
      this.isLoading = false;
    };
    reader.readAsDataURL(event.target.files[0]);
  }

  clickToggle(value) {
    this.showDobErrorMessage = '';
    this.isExistingRx = (value === 'RX_EXISTING');
    this.selectedGroup = value;
    switch (this.selectedGroup) {
      case'prescription':
      case'prescription_high_index':
        this.selectedLens = 'prescriptionSendItLater';
        break;
      case'progressive':
      case'progressive_high_index':
        this.selectedLens = 'progressiveSendItLater';
        break;
      case'reading':
        this.selectedLens = 'reading';
        break;
      case'nonPrescription':
        this.selectedLens = 'noCorrectiveLens';
        break;
      case'onHandInventoryYes':
        this.selectedLens = 'onHandInventoryYes';
        break;
      default :
        this.selectedLens = '';
        break;
    }
    this.selectedLens && this.selectLens(this.selectedLens);
    this.isExistingRx && this.setSelectedRxIndex(0);
    this.clickedToggle = true;
  }

  isCustomizable(lens_type) {
    let NON_CUSTOMIZABLE_LENS = {
      ONHAND_NO_LENS: true,
      ONHAND_NON_RX_SUN_LENS: true,
      NO_LENS: true,
      PLANO_LENS: true,
      NON_RX_SUN_LENS: true
    };

    return ((!NON_CUSTOMIZABLE_LENS[lens_type]) || false);
  }

  /**
   * showCustomizeLenses Function
   *
   */
  showCustomizeLenses() {
    this.isFileuploaded = false;
    let isEdit = this._route.snapshot.params['edit'] || "";
    this.rx_id = this._route.snapshot.params['rx'];

    this._cartService.getCartData().then(cartData=> {
      let isRxProducts:boolean = false;
      this.rx_product_ids = [];
      if (!this.rx_id) {
        cartData.selectedItems.forEach((item:any)=> {
          if (item.item_type != "home_trial_kit") {
            if (this.isCustomizable(item.lens_type)) {
              let firstChar:string = item.lens_type[0].toLowerCase();
              isRxProducts = true;
              item.rx = item.rx || {};
              for (let i = 0; i < item.qty; i++) {
                this.rx_id = item.product_id + '_' + i + firstChar;
                if (!item.rx[this.rx_id] || (item.rx[this.rx_id] && !(item.rx[this.rx_id].rx_id))) {
                  item.rx[this.rx_id] = JSON.parse(JSON.stringify(this.rx_Object));
                  // this.isRxSun
                  item.rx[this.rx_id]['is_sun'] = !item.isEyeWear;
                  this.isRxSun = !item.isEyeWear;
                  // item.rx[this.rx_id]['variant'] = item.variant;
                  // item.rx[this.rx_id]['is_sun'] = (item.variant.toLowerCase().indexOf('sunwear') > -1 || item.variant.toLowerCase().indexOf('sunglass') > -1);
                }
              }
            }
          }
        });

        this._cartService.setCartItems$(cartData.selectedItems);
        this._cartService.writeCartToLocalStorage(cartData);

      } else {
        isRxProducts = true;
        this.cartItems = cartData.selectedItems;
        this.getRxProduct(this.cartItems);
        this.getRxProductIds(this.cartItems);
      }

      if (isRxProducts) {
        if (!isEdit) {
          this.show_rx();
          this._router.navigate(['/checkout/customize/' + this.rx_product_ids[this.count]]);
        } else {
          this.show_rx();
          this._router.navigate(['/checkout/customize/' + this.rx_id + '/' + isEdit]);
        }
      } else {
        this._router.navigate(['/checkout/shipping/']);
      }
    }, err=> {
    });
  }

  /**
   * getPrescription() used to get static content
   */

  getPrescription() {
    let sub:any = this.prescription.getCustomizeLenses().subscribe(data =>this.prescriptionData = data);
    this.subs.push(sub);
  }

  showDescription() {
    if ((this.selectedLens === 'noCorrectiveLens') || (this.selectedLens === 'noLenses')) {
      this.lensDescription = TenantConstant.priceDescription[this.lensType[this.selectedLens]];
      this.lensPrice = this.rx_product.prices[this.lensType[this.selectedLens] + '_PRICE'];
    } else {
      if (this.isRxSun === true) {
        this.lensDescription = TenantConstant.priceDescription[this.rx_lensType[this.selectedGroup]];
        if (this.rx_product) {
          if (this.selectedGroup != 'onHandInventoryYes')
            this.lensPrice = this.rx_product.prices[this.rx_lensType[this.selectedGroup] + '_PRICE'];
          else
            this.lensPrice = this.rx_product.prices['NON_RX_SUN_LENS_PRICE'];
        }
      } else {
        this.lensDescription = TenantConstant.priceDescription[this.lensType[this.selectedGroup]];
        if (this.rx_product) {
          if (this.selectedGroup != 'onHandInventoryYes')
            this.lensPrice = this.rx_product.prices[this.lensType[this.selectedGroup] + '_PRICE'];
          else
            this.lensPrice = this.rx_product.prices['STANDARD_INDEX_LENS_PRICE'];
        }
      }
    }
  }

  changeEvent(selectedGroup, selectedLens) {
    switch (selectedGroup) {
      case 'prescription':
      case 'prescription_high_index':
        switch (selectedLens) {
          case "prescriptionSendItLater":
            this.iWillSendItLaterGroup.highIndex[0] = !this.iWillSendItLaterGroup.highIndex[0];
            if (this.iWillSendItLaterGroup.highIndex[0]) {
              this.selectedGroup = 'prescription_high_index';
            } else {
              this.selectedGroup = 'prescription';
            }
            break;
          case "prescriptionCallMyDoctor":
            this.callMyDoctorGroup.highIndex[0] = !this.callMyDoctorGroup.highIndex[0];
            if (this.callMyDoctorGroup.highIndex[0]) {
              this.selectedGroup = 'prescription_high_index';
            } else {
              this.selectedGroup = 'prescription';
            }
            break;
          case "prescriptionEnterItNow":
            this.iWillEnterNowGroup.highIndex[0] = !this.iWillEnterNowGroup.highIndex[0];
            if (this.iWillEnterNowGroup.highIndex[0]) {
              this.selectedGroup = 'prescription_high_index';
            } else {
              this.selectedGroup = 'prescription';
            }
            break;
          case "prescriptionDigitalCopy":
            this.uploadDigitalCopyGroup.highIndex[0] = !this.uploadDigitalCopyGroup.highIndex[0];
            if (this.uploadDigitalCopyGroup.highIndex[0]) {
              this.selectedGroup = 'prescription_high_index';
            } else {
              this.selectedGroup = 'prescription';
            }
            break;
        }
        break;
      case 'progressive':
      case 'progressive_high_index':
        switch (selectedLens) {
          case "progressiveSendItLater":
            this._iWillSendItLaterGroup.highIndex[0] = !this._iWillSendItLaterGroup.highIndex[0];
            if (this._iWillSendItLaterGroup.highIndex[0]) {
              this.selectedGroup = 'progressive_high_index';
            } else {
              this.selectedGroup = 'progressive';
            }
            break;
          case "progressiveCallMyDoctor":
            this._callMyDoctorGroup.highIndex[0] = !this._callMyDoctorGroup.highIndex[0];
            if (this._callMyDoctorGroup.highIndex[0]) {
              this.selectedGroup = 'progressive_high_index';
            } else {
              this.selectedGroup = 'progressive';
            }
            break;
          case "progressiveDigitalCopy":
            this._uploadDigitalCopyGroup.highIndex[0] = !this._uploadDigitalCopyGroup.highIndex[0];
            if (this._uploadDigitalCopyGroup.highIndex[0]) {
              this.selectedGroup = 'progressive_high_index';
            } else {
              this.selectedGroup = 'progressive';
            }
            break;
        }
        break;
    }
    this.showDescription();
  }

  /**
   * getKiosks() used for get kiosk mode data
   */
  getKiosks() {
    if (this._cookie.getCookie("kioskId"))
      this.isKioskMode = true;
  }

  show_rx() {
    this.isRxSun = false;
    if (this.rx_id && this.rx_product.rx[this.rx_id]) {

      let object_rx = this.rx_product.rx[this.rx_id];
      // if (object_rx ) {
      // this.isRxSun = (object_rx.variant.toLowerCase().indexOf('sunwear') > -1 || object_rx.variant.toLowerCase().indexOf('sunglass') > -1);
      // this.rx_product.is_sun = (this.rx_product.variant.toLowerCase().indexOf('sunwear') > -1 || this.rx_product.variant.toLowerCase().indexOf('sunglass') > -1);
      // }
      if (object_rx) {
        this.isRxSun = (object_rx.is_sun === "1");
        this.rx_product.is_sun = this.isRxSun;
        this.selectedGroup = this.lensType_rx[object_rx.rx_lens_type];
        if (this.lensType_rx[object_rx.rx_lens_type] === 'nonPrescription') {
          if (object_rx.rx_lens_type === 'PLANO_LENS') {
            this.selectedLens = 'noCorrectiveLens';
          }
          if (object_rx.rx_lens_type === 'NO_LENS') {
            this.selectedLens = 'noLenses';
          }
        } else {
          if (this.selectedGroup === 'prescription_high_index') {
            this.selectedLens = 'prescription' + this.options_rx[object_rx.rx_type];
          } else if (this.selectedGroup === 'progressive_high_index') {
            this.selectedLens = 'progressive' + this.options_rx[object_rx.rx_type];
          } else {
            this.selectedLens = this.selectedGroup + this.options_rx[object_rx.rx_type];
          }
        }
        this.lensDescription = this.priceDescription_rx[object_rx.rx_lens_type];
        this.lensPrice = object_rx.price;
        this.setPreFilledData();
      }
    }
  }

  private getRxProduct(cartItems) {
    let rx_objs:any = {};
    cartItems.forEach((item:any)=> {
      item.rx && Object.keys(item.rx).forEach((key)=> {
        rx_objs[key] = item;
      });
    });

    if (this.rx_id) {
      this.rx_product = rx_objs[this.rx_id];
      this.rx_product_price = this.rx_product.prices[this.rx_product.lens_type + '_PRICE'];
      if (this.rx_product.lens_type === 'NON_RX_SUN_LENS')
        this.showLens(false);
      else
        this.showLens(true);
      this.isRxSun = false;
      if (this.rx_product) {
        this.isRxSun = (this.rx_product.isSunwear === "1");
        this.rx_product.is_sun = this.isRxSun;
      }
      this.showDescription();
    } else {
      if (!this.isKioskMode) {
        this._router.navigate(['/checkout/shipping/']);
      }
    }
  }

  private getRxProductIds(cartItems) {
    cartItems.forEach((item:any)=> {
      this.rx_product_ids = (item.rx && this.rx_product_ids.concat(Object.keys(item.rx))) || this.rx_product_ids;
    });
  }

  private setRxProducts() {
    this._cartService.getCartData().then(cartData=> {
      cartData.selectedItems = this.cartItems;
      this._cartService.writeCartToLocalStorage(cartData);
    }, err=> {
    });
  }

  private setPreFilledData() {
    this.selectLensRx(this.selectedLens);
  }

  private selectLensRx(val) {
    this.initGroupsSelectedLens();
    this.attemptSubmit = false;
    let rx_Object:any = {};
    if (this.rx_product && this.rx_product.rx[this.rx_id] && this.rx_product.rx[this.rx_id].rx_id) {
      rx_Object = this.rx_product.rx[this.rx_id];
    } else {
      rx_Object['is_high_index'] = true;
      rx_Object['patient_name'] = '';
      rx_Object['doctor_info'] = {
        doctor_name: '',
        doctor_phone: '',
        patient_dob: ''
      };
      rx_Object['right'] = {
        sphere: '',
        cylinder: '',
        axis: ''
      };
      rx_Object['left'] = {
        sphere: '',
        cylinder: '',
        axis: ''
      };
      rx_Object['pd'] = {
        bino: '',
        mono_right: '',
        mono_left: ''
      };
      rx_Object['rx_file'] = {
        "data": "",
        "filename": "",
        "storage_type": "",
        "content_type": ""
      };
    }
    switch (val) {
      case "prescriptionSendItLater":
        this.iWillSendItLaterGroup = {
          'iWillSendItLater': [true],
          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'prescription_high_index' : 'prescription';
        break;
      case "prescriptionCallMyDoctor":
        this.callMyDoctorGroup = {
          'patientName': [rx_Object.patient_name || '', Validators.required],
          'doctorName': [rx_Object.doctor_info.doctor_name || '', Validators.required],
          'doctorPhone': [rx_Object.doctor_info.doctor_phone || '', Validators.required],
          'patientBirthDay': [rx_Object.doctor_info.patient_dob.substring(0, rx_Object.doctor_info.patient_dob.indexOf('-')) || '', Validators.required],
          'patientDateOfMonth': [rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.indexOf('-') + 1, rx_Object.doctor_info.patient_dob.lastIndexOf('-')) || '', Validators.required],
          'patientBirthYear': [rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.lastIndexOf('-') + 1, rx_Object.doctor_info.patient_dob.length) || '', Validators.required],
          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };

        this.dayValue = rx_Object.doctor_info.patient_dob.substring(0, rx_Object.doctor_info.patient_dob.indexOf('-'));
        this.monthValue = rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.indexOf('-') + 1, rx_Object.doctor_info.patient_dob.lastIndexOf('-'));
        this.yearValue = rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.lastIndexOf('-') + 1, rx_Object.doctor_info.patient_dob.length);
        this.patientName = rx_Object.patient_name;
        this.doctorName = rx_Object.doctor_info.doctor_name;
        this.doctorPhone = rx_Object.doctor_info.doctor_phone;
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'prescription_high_index' : 'prescription';
        break;
      case "prescriptionEnterItNow":
        this.iWillEnterNowGroup = {
          'nameOnPrescription': [rx_Object.name_on_rx || rx_Object.patient_name || '', Validators.required],

          'rightOd': this.builder.group({
            'sphere': [rx_Object.right.sphere || '', Validators.required],
            'cylinder': [rx_Object.right.cylinder || '', Validators.required],
            'axis': [rx_Object.right.axis || '', Validators.required],
          }),

          'leftOs': this.builder.group({
            'sphere': [rx_Object.left.sphere || '', Validators.required],
            'cylinder': [rx_Object.left.cylinder || '', Validators.required],
            'axis': [rx_Object.left.axis || '', Validators.required],
          }),

          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };

        this.patientName = rx_Object.patient_name;
        this.rightSphereValue = rx_Object.right.sphere;
        this.rightCylinderValue = rx_Object.right.cylinder;
        this.rightAxisValue = rx_Object.right.axis;
        this.leftSphereValue = rx_Object.left.sphere;
        this.leftCylinderValue = rx_Object.left.cylinder;
        this.leftAxisValue = rx_Object.left.axis;
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'prescription_high_index' : 'prescription';
        this.showHighIndex();
        this.iWillEnterNowGroup.highIndex[0] = !!this.isHighIndex;
        break;
      case "prescriptionDigitalCopy":
        this.uploadDigitalCopyGroup = {
          'uploadFile': [''],
          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };
        this.rxFile = rx_Object.rx_file || '';
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'prescription_high_index' : 'prescription';
        this.isFileuploaded = true;
        break;
      case "progressiveSendItLater":
        this._iWillSendItLaterGroup = {
          'iWillSendItLater': [true],
          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'progressive_high_index' : 'progressive';
        break;
      case "progressiveCallMyDoctor":
        this._callMyDoctorGroup = {
          'patientName': [rx_Object.patient_name || '', Validators.required],
          'doctorName': [rx_Object.doctor_info.doctor_name || '', Validators.required],
          'doctorPhone': [rx_Object.doctor_info.doctor_phone || '', Validators.required],
          'patientBirthDay': [rx_Object.doctor_info.patient_dob.substring(0, rx_Object.doctor_info.patient_dob.indexOf('-')) || '', Validators.required],
          'patientDateOfMonth': [rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.indexOf('-') + 1, rx_Object.doctor_info.patient_dob.lastIndexOf('-')) || '', Validators.required],
          'patientBirthYear': [rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.lastIndexOf('-') + 1, rx_Object.doctor_info.patient_dob.length) || '', Validators.required],
          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };
        this.dayValue = rx_Object.doctor_info.patient_dob.substring(0, rx_Object.doctor_info.patient_dob.indexOf('-'));
        this.monthValue = rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.indexOf('-') + 1, rx_Object.doctor_info.patient_dob.lastIndexOf('-'));
        this.yearValue = rx_Object.doctor_info.patient_dob.substring(rx_Object.doctor_info.patient_dob.lastIndexOf('-') + 1, rx_Object.doctor_info.patient_dob.length) || 'YEAR';
        this.patientName = rx_Object.patient_name || '';
        this.doctorName = rx_Object.doctor_info.doctor_name || '';
        this.doctorPhone = rx_Object.doctor_info.doctor_phone || '';
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'progressive_high_index' : 'progressive';
        break;
      case "progressiveDigitalCopy":
        this._uploadDigitalCopyGroup = {
          'uploadFile': [''],
          'pupillaryDistance': this.builder.group({
            'binocular': [rx_Object.pd.bino || ''],
            'right': [rx_Object.pd.mono_right || ''],
            'left': [rx_Object.pd.mono_left || '']
          }),
          'highIndex': [rx_Object.is_high_index]
        };
        this.rxFile = rx_Object.rx_file || '';
        this.pdBinoValue = rx_Object.pd.bino;
        this.pdRightValue = rx_Object.pd.mono_right;
        this.pdLeftValue = rx_Object.pd.mono_left;
        this.isHighIndex = rx_Object.is_high_index;
        this.selectedGroup = this.isHighIndex ? 'progressive_high_index' : 'progressive';
        this.isFileuploaded = true;
        break;
      case "reading":
        this.readingGroup = {
          'glassesStrength': ['+' + rx_Object.right.sphere || '', Validators.required],
        };
        this.lensStrengthValue = ('+' + rx_Object.right.sphere) || '';
        break;
      case "noCorrectiveLens":
        this.planoLensGroup = {
          'planoLens': [true]
        };
        break;
      case "noLenses":
        this.noLensGroup = {
          'noLens': [true]
        };
        break;
      case "onHandInventoryYes":
        this.onHandDemoYesGroup = {
          'onHandInventoryYes': [true]
        };
        break;
      case "onHandInventoryNo":
        this.onHandDemoNoGroup = {
          'onHandInventoryNo': [true]
        };
        break;
    }
    this.initGroups();
    this.selectedLens = val;
    this.showDescription();
  }

  showLens(flagValue) {
    if (!flagValue) {
      this.selectLens('onHandInventoryYes');
    } else {
      this.selectedLens = '';
      this.lensDescription = '';
    }
    this.showFlag = flagValue;
  }

  showHighIndex() {
    let left_sphere = Math.abs(+this.leftSphereValue);
    let right_sphere = Math.abs(+this.rightSphereValue);

    let left_cylinder = Math.abs(+this.leftCylinderValue);
    let right_cylinder = Math.abs(+this.rightCylinderValue);

    if ((left_sphere > 4) || (right_sphere > 4)) {
      this.customizeLens.controls['prescription'].controls['iWillEnterNowGroup'].controls['highIndex'].updateValue(true);
      this.showIsHighIndex = true;
      this.isHighIndex = true;
    }
    else if (( (left_cylinder) && (left_cylinder > 2) ) || ( (right_cylinder) && (right_cylinder > 2) )) {
      this.customizeLens.controls['prescription'].controls['iWillEnterNowGroup'].controls['highIndex'].updateValue(true);
      this.showIsHighIndex = true;
      this.isHighIndex = true;
    }
    else {
      let max_sphere = Math.max(left_sphere, right_sphere);
      let max_cylinder = Math.max(left_cylinder, right_cylinder);
      if (max_sphere + max_cylinder >= 4) {
        this.customizeLens.controls['prescription'].controls['iWillEnterNowGroup'].controls['highIndex'].updateValue(true);
        this.showIsHighIndex = true;
        this.isHighIndex = true;
      } else {
        this.customizeLens.controls['prescription'].controls['iWillEnterNowGroup'].controls['highIndex'].updateValue(false);
        this.showIsHighIndex = false;
        this.isHighIndex = false;
      }
    }
    this.selectedGroup = this.showIsHighIndex ? 'prescription_high_index' : 'prescription';
    this.showDescription();
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    if (this._cookie.getCookie(AppConstants.CHECKOUT_TYPE) !== 'customer') {
      return;
    }
    this._userService.getUserInfo().then(data => {
      if (data.rx && data.rx.length) {
        data.rx = data.rx.filter((rx:any)=> {
          return rx.rx_type !== 'RX_SEND_LATER';
        });
        data.rx.map((rx:any, index:number)=> {
          if (this.rx_product && this.rx_product.rx && this.rx_product.rx[this.rx_id] && this.rx_product.rx[this.rx_id].id === rx.id) {
            rx.is_high_index = this.rx_product.rx[this.rx_id].is_high_index;
            this.setSelectedRxIndex(index);
          }
        });
        this.userInfo = data;
      }
    }, e=> {
      console.log(e)
    });
  }

  setSelectedRxIndex(indx:any) {
    this.selectedRxIndex = {};
    this.selectedRxIndex[indx] = true;
    this.isExistingRx = true;
    this.showDescription();
  }
}
