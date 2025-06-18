/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import e from 'express';
import * as fs from 'fs';
import * as path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';

@Injectable()
export class GitService {
  private git: SimpleGit;
  // private readonly github = new Octokit({ auth: process.env.GITHUB_TOKEN });

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.git = simpleGit(); // Inicializa simple-git

  }

  /**
   * Clones a repository into a specified directory.
   *
   * This method clones a Git repository from the given URL into a structured directory
   * based on the provided parameters. If the target directory already exists, it will be deleted first.
   *
   * @param url The URL of the repository to be cloned.
   * @param rute The base path where the repository should be cloned.
   * @param folder_name The name of the folder where the repository will be placed.
   * @param tipo The type of repository: 'F' for Frontend, 'B' for Backend, or any other value for All.
   * @returns A promise that resolves to the full path of the cloned repository.
   * @throws An error if the cloning process fails.
   */
  async cloneRepositorio(
    url: string,
    rute: string,
    folder_name: string,
    tipo: string,
  ): Promise<string> {
    if (tipo == 'F') tipo = 'Frontend';
    else if (tipo == 'B') tipo = 'Backend';
    else tipo = 'All';

    // Assign full path
    const basePath = `${rute}/${folder_name}`;
    const fullPath = path.join(basePath, tipo);

    // If the directory exists, delete it
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }

    // Create the base directory
    fs.mkdirSync(basePath, { recursive: true });

    // Clone the repository
    try {
      await this.git.clone(url, fullPath);
      return `${fullPath}`;
    } catch (error) {
      throw new Error(`Error cloning the repository: ${error.message}`);
    }
  }

  /**
 * Checks if a GitHub repository exists under the "Fireploy" organization.
 *
 * Sends a GET request to the GitHub API to verify the existence of the repository.
 *
 * @param repoName - The name of the repository to check.
 * @returns A promise that resolves with the clone URL of the repository if it exists.
 * @throws {BadRequestException} If the repository is not found or the request fails.
 */
  async repoExists(repoName: string): Promise<string> {
    const url = `https://api.github.com/repos/Fireploy/${repoName}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `token ${process.env.GIT_TOKEN}`,
          Accept: 'application/vnd.github+json',
        },
      });
      return response.data.clone_url;
    } catch (error) {
      throw new BadRequestException('No se encontr´p el recurso')
    }

  }

  /**
 * Creates a new GitHub repository under the authenticated user's account.
 *
 * Sends a POST request to the GitHub API to create a public repository
 * with auto-initialization.
 *
 * @param repoName - The name of the repository to be created.
 * @returns A promise that resolves with the repository data returned by GitHub.
 * @throws {Error} If the repository creation fails.
 */
  async createGitHubRepo(repoName: string) {
    const url = 'https://api.github.com/user/repos';
    const headers = {
      Authorization: `token ${process.env.GIT_TOKEN}`,
      'Content-Type': 'application/json',
    };

    const data = {
      name: repoName,
      description: `Repositorio ${repoName} creado desde el backend`,
      private: false,
      auto_init: true,
    };

    try {
      const response = await axios.post(url, data, { headers });
      return response.data;
    } catch (error) {
      throw new Error(`Error al crear el repositorio en GitHub ${error.message}`);
    }
  }

  /**
 * Pushes the contents of a local folder to a remote GitHub repository.
 *
 * Initializes a Git repository if one does not exist in the given folder,
 * sets the remote origin, creates or switches to the 'main' branch,
 * commits all changes, and performs a forced push to the remote repository.
 *
 * @param folderPath - The absolute path to the local folder to be pushed.
 * @param remoteRepoUrl - The URL of the remote GitHub repository.
 * @returns A promise that resolves with a success message upon completion.
 * @throws {BadRequestException} If the folder path does not exist.
 * @throws {Error} If the Git operations fail.
 */
  async pushFolderToRepo(
    folderPath: string,
    remoteRepoUrl: string,
  ): Promise<string> {
    // Validar si el path existe
    if (!fs.existsSync(folderPath)) {
      throw new BadRequestException(`La carpeta "${folderPath}" no existe.`);
    }

    const git = simpleGit(folderPath);
    try {
      // Si no hay repo, inicializa uno
      if (!fs.existsSync(path.join(folderPath, '.git'))) {
        await git.init();
      }

      //Elimina el repositorio remoto si lo tiene
      await git.remote(['remove', 'origin']).catch(() => {}); 
      //asiigna el repositorio remoto 
      await git.addRemote('origin', remoteRepoUrl).catch(() => {});

      const ramasLocales = await git.branchLocal();
      if(!ramasLocales.all.includes('main')){
        await git.checkoutLocalBranch('main');
      }else{
        await git.checkout('main')
      }

      await git.add('.');
      await git.commit('Subida automática desde NestJS', undefined, {
        '--allow-empty': null,
      });

      // Push forzado para sobreescribir el repo remoto
      await git.push('origin', 'main', ['--force']);

      return 'Repositorio actualizado exitosamente.';
    } catch (error) {
      console.error('Error al hacer push a GitHub', error);
      throw error;
    }
  }
  
}
