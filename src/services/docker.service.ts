import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';

@Injectable()
export class DockerfileService {
  /**
   * Generates a Dockerfile template based on the specified technology and port.
   *
   * This method provides predefined Dockerfile templates for different technologies,
   * such as Node.js, Python, and PHP. It dynamically inserts the specified port number
   * into the template before returning it.
   *
   * @param tech The technology stack for which the Dockerfile is generated.
   *             Supported values: 'node', 'python', 'php'.
   * @param port The port number that the container should expose.
   * @returns A string containing the corresponding Dockerfile content.
   */
  private getDockerFile(tech: string, port: number): string {
    const templates = {
      node: `# Use Node.js 18 as the base image
    FROM node:18
    
    # Set the working directory inside the container
    WORKDIR /app
    
    # Copy dependency files first (to optimize caching)
    COPY package*.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy the entire application source code
    COPY . .
    
    # Compile TypeScript to JavaScript (if applicable)
    RUN npm run build
    
    # Expose the application port
    EXPOSE ${port}
    
    # Start the application
    CMD ["node", "dist/main.js"]
    `,

      python: `# Use Python 3.9 as the base image
    FROM python:3.9
    
    # Set the working directory inside the container
    WORKDIR /app
    
    # Copy the requirements file
    COPY requirements.txt .
    
    # Install dependencies
    RUN pip install -r requirements.txt
    
    # Copy the entire application source code
    COPY . .
    
    # Expose the application port
    EXPOSE ${port}
    
    # Start the application
    CMD ["python", "app.py"]`,

      php: `# Use PHP 8.1 with Apache
    FROM php:8.1-apache
    
    # Copy application files to the Apache server directory
    COPY . /var/www/html/
    
    # Expose the application port
    EXPOSE ${port}
    
    # Start Apache in the foreground
    CMD ["apache2-foreground"]`,
    };

    // Return the corresponding Dockerfile template for the given technology
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return templates[tech];
  }

  /**
   * Generates a Dockerfile for a given project and programming language.
   *
   * This method creates a Dockerfile inside the specified project directory based
   * on the selected language and port. It retrieves a predefined Dockerfile template
   * using the `getDockerFile` method and writes it to a file.
   *
   * @param projectPath The absolute path to the project directory where the Dockerfile should be created.
   * @param language The programming language or technology stack for which the Dockerfile is generated.
   *                 Supported values: 'node', 'python', 'php'.
   * @param port The port number that the container should expose.
   * @returns The full path of the generated Dockerfile.
   * @throws Error if the specified language is not supported.
   */
  generateDockerfile(
    projectPath: string,
    language: string,
    port: number,
  ): string {
    const dockerfilePath = path.join(projectPath, 'Dockerfile');

    // Retrieve the corresponding Dockerfile template
    const dockerFile = this.getDockerFile(language, port);

    if (!dockerFile) {
      throw new Error(`Language ${language} is not supported.`);
    }

    // Create and write the Dockerfile
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    fs.writeFileSync(dockerfilePath, dockerFile);

    return dockerfilePath;
  }

  async buildAndRunContainer(
    Name: string,
    projectPath: string,
    language: string,
    port,
  ) {
    try {
      const imageName = `App-${Name}`;
      const containerName = `Container-${Name}`;

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
