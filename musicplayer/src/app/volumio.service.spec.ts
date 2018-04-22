import { TestBed, inject } from '@angular/core/testing';

import { VolumioService } from './volumio.service';

describe('VolumioService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VolumioService]
    });
  });

  it('should be created', inject([VolumioService], (service: VolumioService) => {
    expect(service).toBeTruthy();
  }));
});
