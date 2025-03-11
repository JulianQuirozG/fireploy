import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class DockerfileService {
  private getDockerFile(tech, port): string {
    const templates = {
      node: `# Usa la imagen de Node.js 18
  FROM node:18
  
  # Define el directorio de trabajo dentro del contenedor
  WORKDIR /app
  
  # Copia los archivos de dependencias primero (optimiza la caché)
  COPY package*.json ./
  
  # Instala las dependencias
  RUN npm install
  
  # Copia todo el código fuente
  COPY . .
  
  # Compila TypeScript a JavaScript
  RUN npm run build
  
  # Expone el puerto de la aplicación
  EXPOSE ${port}
  
  # Comando de inicio
  CMD ["node", "dist/main.js"]
  `,

      python: `FROM python:3.9
  WORKDIR /app
  COPY requirements.txt .
  RUN pip install -r requirements.txt
  COPY . .
  EXPOSE ${port}
  CMD ["python", "app.py"]`,

      php: `FROM php:8.1-apache
  COPY . /var/www/html/
  EXPOSE ${port}
  CMD ["apache2-foreground"]`,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return templates[tech];
  }

  generateDockerfile(projectPath: string, language: string, port) {
    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    const dockerFile = this.getDockerFile(language, port);
    if (!dockerFile) {
      throw new Error('Lenguaje no soportado');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    fs.writeFileSync(dockerfilePath, dockerFile);
    return dockerfilePath;
  }

  async buildAndRunContainer(projectPath: string, language: string, port) {
    try {
      this.generateDockerfile(projectPath, language, port);
      const imageName = `mi-app-${language}`;
      const containerName = `mi-contenedor-${language}`;

      await this.executeCommand(`docker rm -f ${containerName}`);

      const buildCmd = `docker build -t ${imageName} "${projectPath}"`;

      const portMapping = {
        node: `${port}:3000`,
        python: `${port}:5000`,
        php: `${port}:8080`,
      };
      const runCmd = `docker run -d -p ${portMapping[language]} --name ${containerName} ${imageName}`;

      await this.executeCommand(buildCmd);
      await this.executeCommand(runCmd);

      return `Contenedor ${containerName} corriendo en el puerto ${portMapping[language]}`;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new Error(`Error al ejecutar Docker: ${error.message}`);
    }
  }

  private executeCommand(command: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error ejecutando: ${command}`, stderr);
          reject(error);
        } else {
          console.log(`Ejecutado: ${command}`, stdout);
          resolve();
        }
      });
    });
  }
}
