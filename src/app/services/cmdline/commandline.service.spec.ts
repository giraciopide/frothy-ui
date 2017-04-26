import { TestBed, inject } from '@angular/core/testing';

import { CommandlineService } from './commandline.service';

describe('CommandlineService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommandlineService]
    });
  });

  it('should ...', inject([CommandlineService], (service: CommandlineService) => {
    expect(service).toBeTruthy();
  }));
});
