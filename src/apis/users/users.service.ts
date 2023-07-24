import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CacheService } from 'src/common/commonServices/cache/cache.service';
import { DatabaseService } from 'src/common/commonServices/database.service';
import { UtilityService } from 'src/common/commonServices/utility.service';
import DBConstants from 'src/common/constants/db.constants';
import ERRORS from 'src/common/constants/error.constants';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly utils: UtilityService,
    private readonly cacheService: CacheService,
    private readonly utilityService: UtilityService
  ) {}

  async findOrCreateLoginDetails(
    id: string,
    pass: string
  ): Promise<User | undefined> {
    /**
     * 1. verify otp
     * 2. fetch userId
     * 3. if not found create userId
     * 4. return user object corresponding to uuid
     */

    try {
      const otpStr = await this.cacheService.getEntity(id + '_otp');
      const otpObj = JSON.parse(otpStr ?? null);
      if (otpObj?.otp !== pass) {
        return new Error('Incorrect OTP');
      }
    } catch (e) {
      return e;
    }

    let loginDetails;
    const loginOptions = {
      collection: DBConstants.TABLES.LOGIN,
      identifiers: {
        pk: id,
        sk: 'meta',
      },
    };
    try {
      loginDetails = await this.dbService.getEntity(loginOptions);
    } catch (e) {
      if (e.name !== ERRORS.HTTP.RESOURCE_NOT_FOUND) {
        // throw e;
        return;
      }
      try {
        loginDetails = await this.createUser(id);
      } catch (e) {
        // throw e;
        return;
      }
    }

    await this.cacheService.deleteEntity(id + '_otp');
    return loginDetails;
  }

  private async createUser(id: string) {
    const userID = this.utils.getNewUUID();
    const projectId = this.utils.getNewProjectId();
    let email, mobNum;
    if (this.utilityService.isValidEmail(id)) {
      email = id;
      mobNum = '';
    } else {
      email = '';
      mobNum = id;
    }

    const userBody = {
      pk: userID,
      sk: 'meta',
      id: userID,
      name: 'User',
      firstName: 'User',
      lastName: '',
      email: email,
      countryCode: mobNum.split('__')?.[0],
      mobile: mobNum.split('__')?.[1],
      profilePhoto: 'https://api.multiavatar.com/' + userID + '.png',
    };

    const loginBody = {
      pk: id,
      sk: 'meta',
      uuid: userID,
    };

    const projectBody = {
      pk: userID,
      sk: projectId,
      id: projectId,
      title: 'Project Awesome',
      image: '',
      scenes: [],
    };

    const transactItemsOptions = {
      transactItems: [
        {
          create: {
            collection: DBConstants.TABLES.LOGIN,
            identifiers: {
              pk: id,
              sk: 'meta',
            },
            body: loginBody,
            bCreateIfNotExists: true,
          },
        },
        {
          create: {
            collection: DBConstants.TABLES.USER,
            body: userBody,
            identifiers: {
              pk: userID,
              sk: 'meta',
            },
            bCreateIfNotExists: true,
          },
        },
        {
          create: {
            collection: DBConstants.TABLES.USER,
            body: projectBody,
            identifiers: {
              pk: userID,
              sk: projectId,
            },
            bCreateIfNotExists: true,
          },
        },
      ],
    };

    try {
      await this.dbService.transactWrite(transactItemsOptions);
      return loginBody;
    } catch (e) {
      if (e.name === ERRORS.DATABASE.CONDITIONAL_CHECK_FAILED) {
        throw new HttpException('Conflict', HttpStatus.CONFLICT);
      }
    }
  }

  public async getUser(id: string, details = false) {
    try {
      const userOptions = {
        collection: DBConstants.TABLES.USER,
        identifiers: {
          pk: id,
          sk: 'meta',
        },
      };
      const user = await this.dbService.getEntity(userOptions);
      const { pk, sk, version, modified, ...result } = user;

      if (details) {
        result.projects = [];
        const userProjects = await this.getUserProjects(id);
        for (const project of userProjects.entities) {
          delete project.modified;
          delete project.version;
          result.projects.push(project);
        }
      }

      return result;
    } catch (e) {
      throw e;
    }
  }
  public async getUserProjects(userId: string) {
    const projectOptions = {
      collection: DBConstants.TABLES.USER,
      identifiers: { pk: userId },
      filter: { key: 'sk', value: 'pr_' },
    };
    return await this.dbService.queryCollectionFilterBeginsWith(projectOptions);
  }
}
