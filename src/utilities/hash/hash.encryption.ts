import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Encrypt {
  async getHash(text_to_hash: string) {
    const saltOrRounds = process.env.SALT_OR_ROUNDS || 10;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hash: string = await bcrypt.hash(text_to_hash, saltOrRounds);
    return hash;
  }
}
