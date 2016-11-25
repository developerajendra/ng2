export class RxModel{
  constructor(){

  }

  public get rxObject():Object{
    return {
      "doctor_info": {//done
        "doctor_name": "",
        "doctor_phone": "",
        "patient_dob": ""
      },
      "entered_at": "",
      "friendly_name": "",
      "name_on_rx": "",
      "is_high_index": false,//done
      "is_progressive": false,
      "left": {//done
        "axis": 0,
        "cylinder": 0,
        "sphere": 0
      },
      "pd": {//done
        "bino": 0,
        "mono_left": 0,
        "mono_right": 0
      },
      "right": {//done
        "axis": 0,
        "cylinder": 0,
        "sphere": 0
      },
      "rx_file": {
        "data": "",
        "content_type": "",
        "filename": "",
        "storage_type": ""
      },
      "rx_type": "",//done
      "valid_rx": "NEW",
      "rx_lens_type": "",//done
      "patient_name": "",//
      "product_id": "",
      "price": "",
      "img_url": "",
      "color": "",
      "name": "",
      "prices": {},
      "rx_id": null,//done
      "is_sun": true
    };
  }
}
