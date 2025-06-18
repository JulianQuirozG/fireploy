import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
 * Returns a welcome message from the FIREPLOY system.
 *
 * @returns A greeting string.
 */
  getHello(): string {
    return 'Hello This is FIREPLOY!';
  }
}
