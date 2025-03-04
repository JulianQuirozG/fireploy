import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class DockerfileService {
  private templates = {
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
EXPOSE 3000

# Comando de inicio
CMD ["node", "dist/main.js"]
`,

    python: `FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]`,

    php: `FROM php:8.1-apache
COPY . /var/www/html/
EXPOSE 80
CMD ["apache2-foreground"]`,
  };

  generateDockerfile(projectPath: string, language: string) {
    const dockerfilePath = path.join(projectPath, 'Dockerfile');
    if (!this.templates[language]) {
      throw new Error('Lenguaje no soportado');
    }
    fs.writeFileSync(dockerfilePath, this.templates[language]);
    return dockerfilePath;
  }

  async buildAndRunContainer(projectPath: string, language: string) {
    try {
      this.generateDockerfile(projectPath, language);
      const imageName = `mi-app-${language}`;
      const containerName = `mi-contenedor-${language}`;

      await this.executeCommand(`docker rm -f ${containerName}`);

      const buildCmd = `docker build -t ${imageName} "${projectPath}"`;

      const portMapping = {
        node: '3003:3000',
        python: '5000:5000',
        php: '8080:80',
      };
      const runCmd = `docker run -d -p ${portMapping[language]} --name ${containerName} ${imageName}`;

      await this.executeCommand(buildCmd);
      await this.executeCommand(runCmd);

      return `Contenedor ${containerName} corriendo en el puerto ${portMapping[language]}`;
    } catch (error) {
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
