import { TestBed, inject } from '@angular/core/testing';

import { LoggOperatorService } from './logg-operator.service';

describe('LoggOperatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoggOperatorService]
    });
  });

  it('should be created', inject([LoggOperatorService], (service: LoggOperatorService) => {
    expect(service).toBeTruthy();
  }));
});
