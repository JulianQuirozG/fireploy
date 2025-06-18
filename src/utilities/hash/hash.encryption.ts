import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class Encrypt {
  /**
 * Generates a bcrypt hash from the provided plain text using a salt or a number of rounds.
 *
 * @param text_to_hash - The plain text string to be hashed.
 * @returns A promise that resolves to the hashed string.
 * @throws {Error} If hashing fails or environment variable is invalid.
 */
  async getHash(text_to_hash: string) {
    const saltOrRounds: number = Number(process.env.SALT_OR_ROUNDS);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const hash: string = await bcrypt.hash(text_to_hash, saltOrRounds);
    return hash;
  }

  /**
 * Compares two strings using bcrypt to verify if they match.
 *
 * @param text1 - The plain text string to compare.
 * @param text2 - The hashed string to compare against.
 * @returns A promise that resolves to true if the strings match.
 * @throws {UnauthorizedException} If the strings do not match.
 */
  async compare(text1?: string, text2?: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const isMatch: boolean = await bcrypt.compare(text1, text2);
    if (!isMatch) throw new UnauthorizedException('La información no coincide');
    else return isMatch;
  }
}
