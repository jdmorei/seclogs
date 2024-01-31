"use strict";

class Log {
  constructor(data) {
    this.syslogFacility = data.syslogFacility;
    this.syslogSeverity = data.syslogSeverity;
    this.eventTime = data.eventTime;
    this.hostname = data.hostname;
    this.sourceName = data.sourceName;
    this.processID = data.processID;
    this.message = data.message;
    this.status = data.status;
    this.reason = data.reason;
    this.sourceIPAddress = data.sourceIPAddress;
    this.protocol = data.protocol;
    this.payloadRAW = data.payloadRAW;
  }
}
