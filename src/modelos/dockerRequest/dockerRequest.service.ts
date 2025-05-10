/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DockerRequestService {
  /**
   * Searches for Docker repositories on Docker Hub that match the provided text.
   *
   * This method sends a request to the Docker Hub public API using the query text,
   * parses the response, and returns the matching repositories.
   *
   * @param text - The search text used to query Docker Hub repositories.
   *
   * @returns A JSON object containing the list of matching Docker repositories.
   *
   * @throws {NotFoundException} If no repositories match the given search text.
   */
  async findRepositories(text: string) {
    const repoDocker = await fetch(
      'https://hub.docker.com/v2/search/repositories?' +
        new URLSearchParams({ query: text }).toString(),
    ).then((response) => response.json());

    if (!repoDocker) {
      throw new NotFoundException(
        `Ningún repositorio coincide con las letras: ${text}`,
      );
    }
    return repoDocker;
  }

  /**
   * Retrieves the list of tags (versions) for a given Docker repository from Docker Hub.
   *
   * @param repository - The name of the Docker repository (e.g., "node" or "library/node").
   *
   * @returns An array of tag names associated with the specified repository.
   *
   * @throws {NotFoundException} If no tags are found for the provided repository.
   */
  async findTags(repository: string) {
    let _repository = repository;
    if (!repository.includes('/')) {
      _repository = `/library/${_repository}`;
    }

    const response = await fetch(
      `https://hub.docker.com/v2/repositories/${_repository}/tags`,
    ).then((response) => response.json());
    if (!response)
      throw new NotFoundException(
        `No se encontraron tags para el repositorio: ${repository}`,
      );
    const tags = response.results.map((tag: any) => tag.name);
    return tags;
  }
}
