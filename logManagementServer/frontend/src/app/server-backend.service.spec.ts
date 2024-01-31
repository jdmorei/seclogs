import { TestBed } from '@angular/core/testing';

import { ServerBackendService } from './server-backend.service';

describe('ServerBackendService', () => {
  let service: ServerBackendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerBackendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
