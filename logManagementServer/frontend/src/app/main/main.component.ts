import { Component, OnInit } from '@angular/core';
import { Log } from '../../models/log';
import { ServerBackendService } from '../server-backend.service';
import { SelectItem, FilterService, FilterMatchMode, SortEvent } from 'primeng/api';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  /**
   * Array of log objects retrieved from the backend.
   */
  logs: Log[] = [];

  /**
   * Configuration for table columns.
   */
  cols: any[];

  /**
   * Options for custom filtering match modes.
   */
  matchModeOptions: SelectItem[] = [];

  /**
   * Creates an instance of MainComponent.
   * @param {ServerBackendService} ServerBackendService - Service to interact with the backend.
   * @param {FilterService} filterService - Service to register custom filters.
   */
  constructor(
    private ServerBackendService: ServerBackendService,
    private filterService: FilterService
  ) {
    // Define table columns for logs display
    this.cols = [
      { field: 'trx', header: 'TRX' },
      { field: 'hash', header: 'Hash' },
      { field: 'payload', header: 'Payload' },
      { field: 'statusTrx', header: 'Status' },
      { field: 'eventTime', header: 'Event Time' }
    ];
  }

  /**
   * Angular lifecycle hook that is called after component initialization.
   * Sets up custom filter options and retrieves all logs from the backend.
   *
   * @returns {void}
   */
  ngOnInit(): void {
    console.log("init main");

    // Fetch all logs from the backend service
    this.ServerBackendService.getAllLogs()
      .subscribe(res => {
        this.logs = res.body!;
      });

    // Register custom filter function for exact matching
    const customFilterName = 'custom-equals';
    this.filterService.register(customFilterName, (value: any, filter: any): boolean => {
      if (filter === undefined || filter === null || filter.trim() === '') {
        return true;
      }
      if (value === undefined || value === null) {
        return false;
      }
      return value.toString() === filter.toString();
    });

    // Set filter match mode options for the UI
    this.matchModeOptions = [
      { label: 'Custom Equals', value: customFilterName },
      { label: 'Starts With', value: FilterMatchMode.STARTS_WITH },
      { label: 'Contains', value: FilterMatchMode.CONTAINS },
    ];
  }
}



