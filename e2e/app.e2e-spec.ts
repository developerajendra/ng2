import { EponymMultiStoreV2Page } from './app.po';

describe('eponym-multi-store-v2 App', function() {
  let page: EponymMultiStoreV2Page;

  beforeEach(() => {
    page = new EponymMultiStoreV2Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
