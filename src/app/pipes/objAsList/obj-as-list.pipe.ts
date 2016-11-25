import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'objAsList'
})
export class ObjAsList implements PipeTransform {

  // transform(value: any, args?: any): any {
  //   return null;
  // }
  transform(value, args?: string[]): any {
    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}
