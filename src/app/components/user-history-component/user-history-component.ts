/**
 * Importing core components
 */

import {Component, OnInit} from "@angular/core";
import * as moment from "moment";
import {OrderService, ProductService, UserService} from "../../services";
import {TenantConstant} from "../../constants/tenant";
import {Title} from "@angular/platform-browser";

declare var window: any;
function changeStatus() {
  window.prerenderReady = true;
}

/**
 * @Component for user-history-component
 */

@Component({
  selector: 'user-history',
  templateUrl: 'user-history-component.html',
  styleUrls: ['user-history-component.scss']
})

/**
 * Exporting class (UserHistoryComponent) from user-history-component
 */
export class UserHistoryComponent implements OnInit {

  orders: any = null;
  userInfo: any = null;
  public moment: any;
  pageTitle: string = 'My Orders';

  /**
   * constructor() used to initialize class level variables
   */

  constructor(protected _productService: ProductService, protected _orderService: OrderService, protected _userService: UserService,
              protected _title: Title) {
    this.moment = moment;
    _title.setTitle(TenantConstant.DOMAIN_NAME + ' - ' + this.pageTitle);
  }

  /**
   * ngOnInit function
   */

  ngOnInit() {
    this.getUserInfo();
  }

  /**
   * getUserOrderList() used to return the user info
   */

  getUserOrderList() {
    this._userService.getUsersOrderList(this.userInfo.email).then(data => {
      let orderPromises: any = [];
      data.map((order: any)=> {
        let promises: any = [];
        let fetchItemsData = (items, itemsType)=> {
          let itemsGroup: any = {};
          items.map((item: any)=> {
            let id: string = item.product_id + '_' + item.lens_type;
            if (itemsGroup[id] && itemsGroup[id].lens_type === item.lens_type) {
              itemsGroup[id].qty++;
              itemsGroup[id].price += item.price;
            } else {
              itemsGroup[id] = JSON.parse(JSON.stringify(item));
              itemsGroup[id].qty = 1;
              itemsGroup[id].itemType = itemsType;
            }
          });
          Object.keys(itemsGroup).forEach((key: string)=> {
            let _id: any = key.split('_')[0].trim();
            let _promise: any = new Promise((resolve, reject)=> {
              this._productService.getProductDetails(_id).then((data: any)=> {
                itemsGroup[key].name = '';
                itemsGroup[key].color = '';
                itemsGroup[key].imageUrl = '';
                if (data && data.length > 0) {
                  itemsGroup[key].name = data[0].name;
                  itemsGroup[key].color = data[0].color;
                  itemsGroup[key].imageUrl = this._productService.getProductImageUrl(data[0]);
                }
                resolve(itemsGroup[key]);
              }, err=> {
                reject(err);
              });
            });
            promises.push(_promise);
          });
          let p: any = new Promise((resolveOrder, rejectOrder)=> {
            Promise.all(promises).then((data: any)=> {
              order.items[itemsType].items = data;
              resolveOrder(order)
            }, error=> {
              rejectOrder(error);
            });
          });
          orderPromises.push(p);
        };
        order.items.eyewear && fetchItemsData(order.items.eyewear.items, 'eyewear');
        order.items.home_trial_kit && fetchItemsData(order.items.home_trial_kit.items, 'home_trial_kit');
        order.items.gift_cards && fetchItemsData(order.items.gift_cards.items, 'gift_cards');
      });

      Promise.all(orderPromises).then((data: any)=> {
        this.orders = data;
        this.orders.map((order)=> {
          order.ordered_items = [];
          order.items.eyewear && (order.ordered_items = order.ordered_items.concat(order.items.eyewear.items));
          order.items.home_trial_kit && (order.ordered_items = order.ordered_items.concat(order.items.home_trial_kit.items));
          order.items.gift_cards && (order.ordered_items = order.ordered_items.concat(order.items.gift_cards.items));
          order.tracking_numbers = [];
          order.items.eyewear && order.items.eyewear.tracking_numbers && order.items.eyewear.tracking_numbers.length && order.tracking_numbers.push(order.items.eyewear.tracking_numbers[0].tracking_number);
          order.items.home_trial_kit && order.items.home_trial_kit.tracking_numbers && order.items.home_trial_kit.tracking_numbers.length && order.tracking_numbers.push(order.items.home_trial_kit.tracking_numbers[0].tracking_number);
          order.items.gift_cards && order.items.gift_cards.tracking_numbers && order.items.gift_cards.tracking_numbers.length && order.tracking_numbers.push(order.items.gift_cards.tracking_numbers[0].tracking_number);

          order.items.eyewear && order.items.eyewear.tracking_numbers && Object.keys(order.items.eyewear.tracking_numbers).length && console.log('--------tracking_numbers-------------', order.items.eyewear.tracking_numbers);
        });
      }, error=> {
        this.orders = null;
      });
      changeStatus();
    }, error => {
      changeStatus();
    });
  }

  /**
   * GetUserInfo() used to return the user info
   */

  getUserInfo() {
    this._userService.getUserInfo().then(data => {
      this.userInfo = data;
      this.getUserOrderList();
    }, error => {
      changeStatus();
    });
  }

}
