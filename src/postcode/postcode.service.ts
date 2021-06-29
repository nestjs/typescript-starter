import { Injectable } from '@nestjs/common';

import fetch from 'node-fetch';

@Injectable()
export class PostcodeService {
  async getPostcodeLatLong(postcode: string): Promise<{ status: number, data: [number, number] }> {
    const query = await fetch(`https://api.postcodes.io/postcodes/${postcode}`)
    const data = await query.json();

    return { status: query.status, data: [data.result?.latitude, data.result?.longitude] };
  }
}
