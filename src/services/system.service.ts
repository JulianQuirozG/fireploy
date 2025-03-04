import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';

@Injectable()
export class SystemService {
  private total_ports: number = 65535;
  constructor() {}

  async getAvailablePorts(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      try {
        exec('netstat -ano | findstr LISTENING', (error, stdout, stderr) => {
          if (error || stderr) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors, @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
            reject(`Error ejecutando el comando: ${error || stderr}`);
            return;
          }

          // Extraer los puertos en uso
          const usedPorts = new Set<number>();
          stdout.split('\n').forEach((line) => {
            const match = line.match(/:(\d+)\s+/); // Buscar el número del puerto
            if (match) {
              usedPorts.add(parseInt(match[1], 10));
            }
          });

          // Generar lista de puertos libres
          const availablePorts: number[] = [];
          for (let port = 1024; port <= this.total_ports; port++) {
            // Evitar los puertos bajos (0-1023)
            if (!usedPorts.has(port)) {
              availablePorts.push(port);
            }
          }

          resolve(availablePorts);
        });
      } catch (err) {
        console.log(err);
      }
    });
  }
}
