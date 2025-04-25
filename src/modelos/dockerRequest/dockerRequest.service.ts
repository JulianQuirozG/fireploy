import {
 
  Injectable,
  NotFoundException,
} from '@nestjs/common';


/**
 * Tolis
 */
@Injectable()
export class DockerRequestService {
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

  async findTags(repository: string) {
    let _repository = repository;
    if (!repository.includes("/")) {
      _repository = `/library/${_repository}`;
    }

      const response = await fetch(`https://hub.docker.com/v2/repositories/${_repository}/tags`).then(response => response.json());
      if(!response)throw new NotFoundException(
        `No se encontraron tags para el repositorio: ${repository}`,
      );
      const tags = response.results.map((tag: any) => tag.name);
      return tags;
  }
}
