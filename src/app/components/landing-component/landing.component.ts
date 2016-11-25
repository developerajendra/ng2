import { Component, OnInit } from '@angular/core';
import {ROUTER_DIRECTIVES, Router, ActivatedRoute} from '@angular/router';

import {StaticDataService} from "../../services";

@Component({
	moduleId: module.id,
	selector: 'landing',
	template: `<div id="landing" [innerHTML]="pageHtml"></div>`,
	directives: [ROUTER_DIRECTIVES]
})
export class LandingComponent implements OnInit {
	page: string = "";
	pageHtml: any;

	constructor(
		private _route: ActivatedRoute,
		private _router: Router,
		private _staticDataService: StaticDataService
	) { }

	ngOnInit() {
		this.page = this._route.snapshot.params['page'];

		this._staticDataService
			.getLandingPage(this.page)
			.then((data) => {
				this.pageHtml = data;
			}, (err) => {
				this._router.navigate(["404"]);
			})

	}
}