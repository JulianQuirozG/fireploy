import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class SystemService {
  private total_ports: number = 65535;

  constructor() {}

  /**
   * Retrieves a list of available network ports.
   *
   * This method executes a Bash command to find all unoccupied ports
   * in the range 0-65535, filtering out those currently in use.
   * Only ports greater than 20000 are included in the result.
   *
   * @returns A promise that resolves to an array of available port numbers.
   * @throws An error if the command execution fails.
   */
  async getAvailablePorts(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      try {
        const command = `bash -c "seq 0 65535 | grep -vf <(ss -tuln | awk '{print \\$4}' | awk -F':' '{print \\$NF}' | grep -E '^[0-9]+$' | sort -n | uniq)"`;

        exec(command, (error, stdout, stderr) => {
          if (error || stderr) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
            reject(`Error executing command: ${error || stderr}`);
            return;
          }

          // Convert the output into a list of numbers
          const availablePorts = stdout
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
            .map(Number)
            .filter((port) => port > 20000); // Exclude reserved ports (0-1023)

          resolve(availablePorts);
        });
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(`General error: ${err}`);
      }
    });
  }
}
