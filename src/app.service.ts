import { Injectable } from '@nestjs/common';
const momentTZ = require('moment-timezone');
const moment = require('moment');
@Injectable()
export class AppService {
  getHello(): any {
    const timezone = 'America/Chicago';
    const date = moment().utc().format('YYYY-MM-DD HH:m:s');
    const estDate = momentTZ(date).tz(timezone).format('YYYY-MM-DD HH:m:s');
    if (date === estDate) {
      return {
        message: 'Not converting',
        estDate: estDate,
        estTiezone: timezone,
        UTCDate: date,
      };
    } else {
      return {
        message: 'Converting',
        estDate: estDate,
        estTiezone: timezone,
        UTCDate: date,
      };
    }
  }
}
