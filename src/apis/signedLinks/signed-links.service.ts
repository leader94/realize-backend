import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { StorageService } from 'src/common/commonServices/storage.service';
import GlobalConstants from 'src/common/constants/global.constants';
import { v4 as uuid } from 'uuid';
import { TsignedLinksBody } from './signed-links.types';
import { UtilityService } from 'src/common/commonServices/utility.service';
import { DatabaseService } from 'src/common/commonServices/database.service';
import ERRORS from 'src/common/constants/error.constants';
import DBConstants from 'src/common/constants/db.constants';

@Injectable()
export class SignedLinksService {
  constructor(
    private readonly s3Service: StorageService,
    private readonly utilityService: UtilityService,
    private readonly dbService: DatabaseService
  ) {}

  // @todo add auto rejection if mandatory params are not present in req body
  async generateSignedLink(body: TsignedLinksBody, user: any) {
    const { base, overlay, projectId } = body;
    this.doPreChecks(base, overlay);

    const baseId = uuid();
    const overlayId = uuid();
    const sceneId = this.utilityService.getNewSceneId();

    try {
      let projectDetails;
      const projects = user.projects;

      for (const p of projects) {
        if (p.id === projectId) {
          projectDetails = p;
        }
      }

      if (!projectDetails) {
        throw new HttpException(
          `Invalid Project Id: ${projectId} `,
          HttpStatus.BAD_REQUEST
        );
      }
      // TODO this might be required to be updated in future
      const sceneObj = {
        id: sceneId,
        bases: [],
        overlays: [],
      };

      const baseFileName = 'IMG_' + baseId + '.' + base.extn;
      const baseUploadPath = await this.s3Service.getSignedUploadPath({
        key: baseFileName,
        contentSize: base.contentLength,
      });

      const overlayFileName = 'VID_' + overlayId + '.' + overlay.extn;
      const overlayUploadPath = await this.s3Service.getSignedUploadPath({
        key: overlayFileName,
        contentSize: overlay.contentLength,
      });

      // @todo store record in DB

      const baseObj = {
        id: baseId,
        originalName: base.fileName,
        originalExtn: base.extn,
        fileName: baseFileName,
        localPath: base.localPath,
      };

      const overlayObj = {
        id: overlayId,
        originalName: overlay.fileName,
        originalExtn: overlay.extn,
        fileName: overlayFileName,
        localPath: overlay.localPath,
      };

      sceneObj.bases.push({ ...baseObj, uploadUrl: baseUploadPath.url });
      sceneObj.overlays.push({
        ...overlayObj,
        uploadUrl: overlayUploadPath.url,
      });

      projectDetails.scenes.push(sceneObj);

      await this.addSceneInProject(projectDetails);

      const response = {
        base: {
          ...baseObj,
          upload: {
            url: baseUploadPath.url,
            fields: baseUploadPath.fields,
          },
        },
        overlay: {
          ...overlayObj,
          upload: {
            url: overlayUploadPath.url,
            fields: overlayUploadPath.fields,
          },
        },
      };
      return response;
    } catch (e) {
      throw e;
    }
  }

  private doPreChecks(base, overlay) {
    if (base.contentLength > GlobalConstants.BASE.MAX_CONTENT_SIZE) {
      throw new HttpException(
        `Base size cannot be greater than ${GlobalConstants.BASE.MAX_CONTENT_SIZE}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (overlay.contentLength > GlobalConstants.OVERLAY.MAX_CONTENT_SIZE) {
      throw new HttpException(
        `Overlay size cannot be greater than ${GlobalConstants.OVERLAY.MAX_CONTENT_SIZE}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!base.extn.match(/(jpg|jpeg|png)$/)) {
      throw new HttpException(
        `Unsupported base file type ${base.extn}`,
        HttpStatus.BAD_REQUEST
      );
    }

    if (!overlay.extn.match(/(mp4)$/)) {
      throw new HttpException(
        `Unsupported overlay file type ${overlay.extn}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  private async addSceneInProject(projectDetails: any) {
    {
      const putProjectEntityOptions = {
        collection: DBConstants.TABLES.USER,
        body: projectDetails,
      };
      try {
        await this.dbService.putEntity(putProjectEntityOptions);
      } catch (e) {
        throw e;
      }
    }
  }
}
