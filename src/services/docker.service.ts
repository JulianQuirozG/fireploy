/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec, execSync } from 'child_process';

@Injectable()
export class DockerfileService {
  private readonly logger = new Logger(DockerfileService.name);

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
      node: `# Usa una versión estable de Node.js como base
    FROM node:18

    # Establece el directorio de trabajo dentro del contenedor
    WORKDIR /app

    # Copia package.json y package-lock.json antes de copiar el código fuente
    COPY package*.json ./

    # Instala dependencias sin generar archivos innecesarios
    RUN npm install --omit=dev

    # Copia el código fuente al contenedor
    COPY . .

    ENV BD_HOST=localhost:${process.env.MYSQL_PORT}
    ENV BD_USER=root
    ENV BD_PASS=${process.env.MYSQL_ROOT_PASSWORD}

    # Detecta si hay un script de build y lo ejecuta (opcional)
    RUN if [ -f package.json ] && cat package.json | grep -q '"build"'; then npm run build; fi

    # Expone el puerto definido en la variable de entorno o usa 3000 por defecto
    EXPOSE ${port}

    # Usa un entrypoint flexible para adaptarse a cualquier framework
    CMD ["sh", "-c", "npm start || node server.js || node index.js"]
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

    fs.writeFileSync(dockerfilePath, dockerFile);

    return dockerfilePath;
  }

  async buildAndRunContainer(
    Name: string,
    projectPath: string,
    language: string,
    port,
    env: string,
  ) {
    try {
      const networkName = process.env.DOCKER_NETWORK || 'DataBases-Network';
      const imageName = `app-${Name}`;
      const containerName = `Container-${Name}`;

      await this.executeCommand(`docker rm -f ${containerName}`);

      const buildCmd = `docker build -t ${imageName} "${projectPath}"`;

      const portMapping = {
        node: `${port}:3000`,
        python: `${port}:5000`,
        php: `${port}:8080`,
      };
      const runCmd = `docker run -d --network ${networkName} -p ${portMapping[language]} --name ${containerName} ${env} ${imageName} `;

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

  async checkAndCreateContainer(
    containerName: string,
    image: string,
    port: number,
    volume: string,
    network: string,
    envVars?: string[],
  ) {
    try {
      // Verificar si el contenedor está corriendo
      await this.executeCommand(
        `docker ps --format "{{.Names}}" | grep -w ${containerName}`,
      );
      this.logger.log(`✅ El contenedor ${containerName} ya está corriendo.`);
    } catch {
      try {
        // Verificar si el contenedor existe pero está detenido
        await this.executeCommand(
          `docker ps -a --format "{{.Names}}" | grep -w ${containerName}`,
        );
        this.logger.log(
          `⚡ El contenedor ${containerName} existe pero está detenido. Iniciándolo...`,
        );
        await this.executeCommand(`docker start ${containerName}`);
      } catch {
        // El contenedor no existe, crearlo y ejecutarlo
        this.logger.log(`🚀 Creando contenedor ${containerName}...`);
        const envString = envVars
          ? envVars.map((env) => `-e ${env}`).join(' ')
          : '';

        const command = `docker run -d --name ${containerName} --network ${network} -p ${port}:${port} -v ${volume}:/data ${envString} ${image} --port=${port}`;

        console.log(command);
        await this.executeCommand(command);
      }
    }
  }

  async setupDatabases() {
    const networkName = process.env.DOCKER_NETWORK || 'DataBases-Network';
    this.createNetwork(networkName);
    await this.checkAndCreateContainer(
      process.env.MYSQL_CONTAINER_NAME || 'mysql_container',
      'mysql:latest',
      Number(process.env.MYSQL_PORT) || 3307,
      process.env.MYSQL_VOLUME || 'mysql_data',
      networkName,
      [`MYSQL_ROOT_PASSWORD=${process.env.MYSQL_ROOT_PASSWORD || 'root'}`],
    );

    await this.checkAndCreateContainer(
      process.env.MONGO_CONTAINER_NAME || 'mongo_container',
      'mongo:latest',
      Number(process.env.MONGO_PORT) || 27017,
      process.env.MONGO_VOLUME || 'mongo_data',
      networkName,
      [],
    );
  }

  /**
   * Creates a MySQL database and user inside a running MySQL container.
   *
   * This method executes a command inside the specified Docker container
   * to create a new database and a user with full privileges on it.
   *
   * @param containerName - The name of the running MySQL container.
   * @param dbName - The name of the database to be created.
   * @param dbUser - The username for the new database user.
   * @param dbPassword - The password for the new database user.
   * @returns A promise that resolves with the command output if successful, or rejects with an error message.
   */
  async createMySQLDatabaseAndUser(
    containerName: string,
    dbName: string,
    dbUser: string,
    dbPassword: string,
  ) {
    const command = `
  docker exec ${containerName} mysql -u root -p'${process.env.MYSQL_ROOT_PASSWORD}' -e "
    CREATE DATABASE IF NOT EXISTS \\\`${dbName}\\\`;
    CREATE USER IF NOT EXISTS '${dbUser}'@'%' IDENTIFIED BY '${dbPassword}';
    GRANT ALL PRIVILEGES ON \\\`${dbName}\\\`.* TO '${dbUser}'@'%';
    FLUSH PRIVILEGES;"
`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error al crear DB y usuario en MySQL:`, stderr);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Creates a Docker network if it does not already exist.
   *
   * @param networkName The name of the network to create.
   * @returns The name of the created network or undefined if it already exists.
   */
  createNetwork(networkName: string): string | undefined {
    try {
      // Execute the command to list existing Docker networks
      const stdout = execSync(`docker network ls --format "{{.Name}}"`)
        .toString()
        .trim();

      if (!stdout) {
        console.error('Error: Failed to retrieve the list of Docker networks.');
        return;
      }

      const networks = stdout.split('\n');

      if (!networks.includes(networkName)) {
        console.log(`Creating Docker network: ${networkName}`);
        execSync(`docker network create ${networkName}`);
        return networkName;
      }
    } catch (error) {
      console.error('Error executing Docker command:', error);
    }
  }
}
