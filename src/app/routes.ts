import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";


/**
 * Importing Components
 * @type {Array}
 */
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
  ContinueShoppingComponent,
  VirtualTryOnComponent,
  // RegisterUserComponent,
  // forgotPasswordComponent,
  // resetPasswordComponent,
  // UserAccountComponent,
  // TrialHistoryComponent,
  // UserPrescriptionsComponent,
  // UserHistoryComponent,
  // UserDittoComponent,
  // UserAddressBookComponent,
  // UserAccountInfoComponent,


  AboutUsComponent,
  FaqComponent,
  LocationComponent,
  // PressComponent,
  // QualityComponent,
  // KioskModeComponent,
  // ErrorComponent
} from './components';

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
  { path: 'about', component: AboutUsComponent},
  { path: 'faq', component: FaqComponent},
  { path: 'location', component: LocationComponent},
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

