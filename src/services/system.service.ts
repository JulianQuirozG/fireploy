import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class SystemService {
  private total_ports: number = 65535;

  constructor() {}

  async getAvailablePorts(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      try {
        const command = `bash -c "seq 0 65535 | grep -vf <(ss -tuln | awk '{print \\$4}' | awk -F':' '{print \\$NF}' | grep -E '^[0-9]+$' | sort -n | uniq)"`;

        exec(command, (error, stdout, stderr) => {
          if (error || stderr) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
            reject(`Error ejecutando el comando: ${error || stderr}`);
            return;
          }

          // Convertir la salida en una lista de números
          const availablePorts = stdout
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line !== '')
            .map(Number)
            .filter((port) => port > 1023); // Excluir los puertos reservados (0-1023)

          resolve(availablePorts);
        });
      } catch (err) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        reject(`Error general: ${err}`);
      }
    });
  }
}
