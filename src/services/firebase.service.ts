import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Storage } from '@google-cloud/storage';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Firebase Service
 */
@Injectable()
export class FirebaseService {
  private storage: Storage;
  private bucketName: string;

  constructor() {
    const serviceAccountPath = path.join(
      __dirname,
      '../../firebase-service-account.json',
    );

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error('Firebase service account file not found');
    }
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        storageBucket: process.env.BUCKET_NAME as string,
      });
    }

    this.storage = new Storage({
      keyFilename: serviceAccountPath,
    });

    this.bucketName = process.env.BUCKET_NAME as string;
  }

  /**
   * this method save a file in firebase
   * @param file File to upload to firebase
   * @returns url to access to the file
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const fileName = `uploads/${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    return new Promise((resolve, reject) => {
      const stream = fileUpload.createWriteStream({
        metadata: {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          contentType: file.mimetype,
        },
      });

      stream.on('error', (error) => reject(error));

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      stream.on('finish', async () => {
        await fileUpload.makePublic();
        resolve(
          `https://storage.googleapis.com/${this.bucketName}/${fileName}`,
        );
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      stream.end(file.buffer);
    });
  }
}
