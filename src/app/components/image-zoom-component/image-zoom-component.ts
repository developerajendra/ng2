/**
 * Importing core components
 */
import {Component, OnInit, Input, ElementRef} from "@angular/core";


/**
 * Component decorator
 */
@Component({
  moduleId:module.id,
  selector:"image-zoom",
  templateUrl:"image-zoom-component.html",
  styleUrls:["image-zoom-component.css"]
})

/**
 * Exporting ImageZoomComponent
 */
export class ImageZoomComponent implements OnInit {
  @Input() imageSource:any;
  @Input()  altText:any;

  constructor(private selector:ElementRef) {

  }

  ngOnInit() {

  }


  zoomIn(event) {
    var naviteElement = this.selector.nativeElement;
    var element = naviteElement.getElementsByClassName("zoom-overlay")[0];
    element.style.backgroundImage = "url(" + this.imageSource + ")";
    element.style.display = "inline-block";
    var img = naviteElement.getElementsByClassName("img-zoom")[0];
    var posX = event.offsetX ? (event.offsetX) : event.pageX - img.offsetLeft;
    var posY = event.offsetY ? (event.offsetY) : event.pageY - img.offsetTop;
    element.style.backgroundPosition = (-posX * 1.3) + "px " + (-posY * 0.4) + "px";
  }

  zoomOut() {
    var element = this.selector.nativeElement.getElementsByClassName("zoom-overlay")[0];
    element.style.display = "none";
  }
}
