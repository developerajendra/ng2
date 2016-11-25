import {
  describe,
  ddescribe,
  expect,
  iit,
  it
} from '@angular/core/testing';
import {ProductModel} from './product-model';

describe('ProductModel', () => {
  it('should create an instance', () => {
    expect(new ProductModel(null, null)).toBeTruthy();
  });
});
