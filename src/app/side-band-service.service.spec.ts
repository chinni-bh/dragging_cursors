import { TestBed } from '@angular/core/testing';

import { SideBandServiceService } from './side-band-service.service';

describe('SideBandServiceService', () => {
  let service: SideBandServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideBandServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
