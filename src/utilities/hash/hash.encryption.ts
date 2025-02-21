import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Encrypt {
  //Encript a string
  async getHash(text_to_hash: string) {
    const saltOrRounds: number = Number(process.env.SALT_OR_ROUNDS);
    console.log(saltOrRounds);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hash: string = await bcrypt.hash(text_to_hash, saltOrRounds);
    return hash;
  }

  //Compare a string with a hash
  async compare(text1?: string, text2?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch: boolean = await bcrypt.compare(text1, text2);
    if (!isMatch) throw new UnauthorizedException();
    else return isMatch;
  }
}
