import { TestBed, inject } from '@angular/core/testing';

import { BackendConnectionService } from './backend-connection.service';

describe('BackendConnectionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BackendConnectionService]
    });
  });

  it('should ...', inject([BackendConnectionService], (service: BackendConnectionService) => {
    expect(service).toBeTruthy();
  }));
});
