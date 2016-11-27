import { NgModule, CUSTOM_ELEMENTS_SCHEMA, enableProdMode, Injector, ReflectiveInjector } from '@angular/core';
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
import {
  HeaderComponent,
  FooterComponent,

  HomeComponent,
  BannerComponent,
  ProductTileComponent,
  SelectLenseModal,
  ProductCarouselComponent,
  ProductListingComponent,

  ProductDetailComponent,
  // LoginComponent,
  // CartDescriptionComponent,
  CheckoutComponent,
  // CustomizeLensesComponent,
  CustomizedLensReviewComponent,
  // CheckoutGuestComponent,
  // CheckoutThankyouComponent,
  // PaymentComponent,
  // MustHavesComponent,
  NewArrivalsComponent,
  ShopAnOComponent,
  SaleComponent,
  VirtualTryOnComponent,
  // RegisterUserComponent,
  // forgotPasswordComponent,
  // resetPasswordComponent,
  // UserAccountComponent,
  // TrialHistoryComponent,
  // AboutUsComponent,
  // UserPrescriptionsComponent,
  // UserHistoryComponent,
  // UserDittoComponent,
  // UserAddressBookComponent,
  // UserAccountInfoComponent,
  // FaqComponent,
  // LocationComponent,
  // PressComponent,
  // QualityComponent,
  // KioskModeComponent,
  // ErrorComponent
} from './components';


import {ContinueShoppingComponent} from './components/continue-shopping-component'
// import {LandingComponent} from './components/landing-component'
import {CheckoutRouteValidation, UserRouteValidation} from './routeValidation'
import {AppConstants} from './constants/app-constants'





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
    HeaderComponent,
    FooterComponent,

    HomeComponent,
    BannerComponent,
    ProductTileComponent,
    SelectLenseModal,
    ProductCarouselComponent,
    ProductListingComponent,

    ProductDetailComponent,
    // LoginComponent,
    // CartDescriptionComponent,
    // CheckoutComponent,
    // CustomizeLensesComponent,
    // CustomizedLensReviewComponent,
    // CheckoutGuestComponent,
    // CheckoutThankyouComponent,
    // PaymentComponent,
    // MustHavesComponent,
    NewArrivalsComponent,
    ShopAnOComponent,
    SaleComponent,
    VirtualTryOnComponent,
    // RegisterUserComponent,
    // forgotPasswordComponent,
    // resetPasswordComponent,
    // UserAccountComponent,
    // TrialHistoryComponent,
    // AboutUsComponent,
    ContinueShoppingComponent,
    // UserPrescriptionsComponent,
    // UserHistoryComponent,
    // UserDittoComponent,
    // UserAddressBookComponent,
    // UserAccountInfoComponent,
    // FaqComponent,
    // LocationComponent,
    // PressComponent,
    // QualityComponent,
    // KioskModeComponent,
    // ErrorComponent
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
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  bootstrap: [AppComponent]
})
export class AppModule { }
