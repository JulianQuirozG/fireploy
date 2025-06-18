/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class ProjectManagerQueueService {
  constructor(
    @InjectQueue('project_manager') private readonly projectManagerQueue: Queue,
  ) {}

  /**
   * Adds a job to the project manager queue to change the status of a project or task.
   *
   * @param {any} data - The data required to change the status (e.g. project ID, new status).
   * @returns {Promise<void>} - Resolves when the job has been completed.
   */
  async changeStatus(data: any) {
    const job = await this.projectManagerQueue.add('changeStatus', data);
    await job.finished();
  }

  /**
 * Adds a job to retrieve project logs and waits for its completion.
 *
 * @param data - The data needed to retrieve logs for the project.
 * @returns A promise that resolves with the logs once the job has finished.
 */
  async getProjectLogs(data: any) {
    const job = await this.projectManagerQueue.add('getProjectLogs', data);
    return await job.finished();
  }
}
