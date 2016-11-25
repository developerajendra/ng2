import {ModuleWithProviders} from "@angular/core";
import {Routes, RouterModule} from "@angular/router";


/**
 * Importing Components
 * @type {Array}
 */
import {HomeComponent} from "./components"

const appRoutes:Routes = [
   
]

export const appRoutingProviders:any = []

export const routing:ModuleWithProviders = RouterModule.forRoot(appRoutes)

