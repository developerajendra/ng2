import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";


/**
 * Importing Components
 * @type {Array}
 */
import {HomeComponent} from './components/home-component'
import {ProductListingComponent} from './components/product-listing-component'
import {ProductDetailComponent} from './components/product-detail-component'
import {LoginComponent} from './components/login-component'
// import {CartDescriptionComponent} from "./components/cart-description-component";
// import {CheckoutComponent} from './components/checkout-component'
// import {CustomizeLensesComponent} from './components/customize-lenses-component'
// import {CustomizedLensReviewComponent} from './components/customized-lens-review-component'
// import {CheckoutGuestComponent} from './components/checkout-guest-component'
// import {CheckoutThankyouComponent} from './components/checkout-thankyou-component'
// import {PaymentComponent} from './components/payment-component'
// import {MustHavesComponent} from './components/must-haves-component'
import {NewArrivalsComponent} from './components/new-arrivals-component'
import {ShopAnOComponent} from './components/shop-ano-component'
import {SaleComponent} from './components/sale-component'
// import {VirtualTryOnComponent} from './components/virtual-try-on-component'
// import {RegisterUserComponent} from './components/register-user-component'
// import {forgotPasswordComponent} from './components/forgot-password-component'
// import {resetPasswordComponent} from './components/reset-password-component'
// import {UserAccountComponent} from './components/user-account-component'
// import {TrialHistoryComponent} from './components/trial-history-component'
// import {AboutUsComponent} from './components/about-us-component'
// import {UserPrescriptionsComponent} from './components/user-prescriptions-component'
// import {UserHistoryComponent} from './components/user-history-component'
// import {UserDittoComponent} from './components/user-ditto-component'
// import {UserAddressBookComponent} from './components/user-address-book-component'
// import {UserAccountInfoComponent} from './components/user-account-info-component'
// import {FaqComponent} from './components/faq-component'
// import {LocationComponent} from './components/location-component'
// import {PressComponent} from './components/press-component'
// import {QualityComponent} from './components/quality-component'
// import {KioskModeComponent} from './components/kiosk-mode-component'
// import {ErrorComponent} from './components/error-component'
import {ContinueShoppingComponent} from './components/continue-shopping-component'
// import {LandingComponent} from './components/landing-component'
// import {CheckoutRouteValidation, UserRouteValidation} from './routeValidation'
import {AppConstants} from './constants/app-constants'


const appRoutes:Routes = [

  { path: 'new-arrivals', component: NewArrivalsComponent},
  { path: 'shop-a&o', component: ShopAnOComponent },
  { path: 'designer-clothing-sale', component: SaleComponent },
  // { path: 'landing/:page', component: LandingComponent},
  // { path: 'virtual-try-on', component: VirtualTryOnComponent },
  { path: 'collection/:name', component: ProductListingComponent },
  // { path: 'auth/login', component: LoginComponent },
  // { path: 'cart', component: CartDescriptionComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/cart', component: CartDescriptionComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/customize', component: CustomizeLensesComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/customize/:rx', component: CustomizeLensesComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/customize/:rx/:edit', component: CustomizeLensesComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/review', component: CustomizedLensReviewComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/shipping', component: CheckoutComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout/payment', component: PaymentComponent, canActivate: [CheckoutRouteValidation]},
  { path: 'checkout/continue-shopping', component: ContinueShoppingComponent},
  // { path: 'checkout/done', component: CheckoutThankyouComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'checkout', component: CheckoutGuestComponent, canActivate: [CheckoutRouteValidation]},
  // { path: 'register-user', component: RegisterUserComponent },
  // { path: 'forgot-password', component: forgotPasswordComponent },
  // { path: 'auth/resetpassword/:token', component: resetPasswordComponent },
  // { path: 'auth/kiosk/:kiosk_id', component: KioskModeComponent },
  // {
  //   path: 'customer', component: UserAccountComponent, canActivate: [UserRouteValidation], children: [
  //   {path: 'home', component: UserAccountInfoComponent, canActivate: [UserRouteValidation]},
  //   {path: 'order-history', component: UserHistoryComponent, canActivate: [UserRouteValidation]},
  //   {path: 'address', component: UserAddressBookComponent, canActivate: [UserRouteValidation]},
  //   {path: 'prescriptions', component: UserPrescriptionsComponent, canActivate: [UserRouteValidation]},
  //   {path: 'ditto', component: UserDittoComponent, canActivate: [UserRouteValidation]},
  //   {
  //     path: '', redirectTo: 'home',
  //     pathMatch: 'full'
  //   }
  // ]
  // },
  // { path: 'customer/trial-history', component: TrialHistoryComponent},
  // { path: 'about', component: AboutUsComponent},
  // { path: 'faq', component: FaqComponent},
  // { path: 'location', component: LocationComponent},
  // { path: 'press', component: PressComponent},
  // { path: 'quality', component: QualityComponent},
  // { path: '404', component: ErrorComponent },
  { path: ':pid', component: ProductDetailComponent },
  { path: '', component: HomeComponent },
  // { path: '**', component: ErrorComponent },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'dashboard',
    component: HomeComponent
  }
]

export const appRoutingProviders:any = []

export const routing:ModuleWithProviders = RouterModule.forRoot(appRoutes)

