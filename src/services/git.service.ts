/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

@Injectable()
export class GitService {
  private git: SimpleGit;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.git = simpleGit(); // Inicializa simple-git
  }

  async cloneRepositorio(
    url: string,
    rute: string,
    folder_name: string,
    tipo: string,
  ): Promise<string> {
    if (tipo == 'F') tipo = 'Frontend';
    else if (tipo == 'B') tipo = 'Backend';
    else tipo = 'All';

    //asign fullpath
    const basePath = `${rute}/${folder_name}`;
    const fullPath = path.join(basePath, tipo);

    //if ruta exists delete it
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    //create folder
    fs.mkdirSync(basePath, { recursive: true });

    //clone repository
    try {
      await this.git.clone(url, fullPath);
      return `${fullPath}`;
    } catch (error) {
      throw new Error(`Error al clonar el repositorio: ${error.message}`);
    }
  }
}
