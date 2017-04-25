import { FrothyUiPage } from './app.po';

describe('frothy-ui App', () => {
  let page: FrothyUiPage;

  beforeEach(() => {
    page = new FrothyUiPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
