import { NgModule, enableProdMode, Injector, ReflectiveInjector } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule} from '@angular/forms';

import {
  HttpModule,
  Http,
  XSRFStrategy,
  Request
} from '@angular/http';


import {appRoutingProviders, routing} from "./routes";
import { MetaService ,MetaConfig } from 'ng2-meta';

/**
 * Importing custom services
 */



import { AppComponent } from './app';
import { HeaderComponent,BannerComponent, FooterComponent} from './components';




/**
 * Importing custom components
 */
import {
  OrderService,
  UserService,
  ProductService,
  StaticDataService,
  NotifyService,
  MessageService,
  CartService,
  HttpClient,
  CookiesService,
  StorageService,
  ValidationService,
  CustomizeLensService
} from './services';


import {CheckoutRouteValidation, UserRouteValidation} from './routeValidation'

/**
 * Importing custom routes
 */

import { Title } from '@angular/platform-browser';
import {TenantConstant} from './constants/tenant';
import {Utils} from "./shared/utils";
import {ConstantsService} from "./services/constants.service";
import {AuthConfig} from "./services/auth/auth.interceptor";



@NgModule({
  declarations: [
    AppComponent,
    BannerComponent,
    HeaderComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    ReactiveFormsModule,
    routing
  ],
  providers: [
    appRoutingProviders,
    StorageService,
    CheckoutRouteValidation,
    CookiesService,
    UserRouteValidation,
    ProductService,
    CartService,
    HttpClient,
    UserService,
    OrderService,
    StaticDataService,
    NotifyService,
    MessageService,
    MetaService,
    ConstantsService,
    Utils,
    AuthConfig,
    ValidationService,
    // CustomizeLensService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
