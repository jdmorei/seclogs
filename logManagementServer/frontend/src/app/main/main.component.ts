import { Component, OnInit } from '@angular/core';
import {Log} from '../../models/log';
import { ServerBackendService } from '../server-backend.service';
import {  SelectItem, FilterService, FilterMatchMode, SortEvent } from 'primeng/api';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  logs: Log[] = [];

  cols: any[];

  matchModeOptions: SelectItem[] = [];

  constructor(
    private ServerBackendService: ServerBackendService,
    private filterService: FilterService) {

    this.cols = [
      { field: 'trx', header: 'TRX' },
      { field: 'hash', header: 'Hash' },
      { field: 'payload', header: 'Payload' },
      { field: 'statusTrx', header: 'Status' },
      { field: 'eventTime', header: 'Event Time'}
    ];

   }

  ngOnInit(): void {
     console.log("init main")
     this.ServerBackendService.getAllLogs()
     .subscribe(res => {
      this.logs =  res.body! ;
    })

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

    this.matchModeOptions = [
      { label: 'Custom Equals', value: customFilterName },
      { label: 'Starts With', value: FilterMatchMode.STARTS_WITH },
      { label: 'Contains', value: FilterMatchMode.CONTAINS },
    ];


  }




}



