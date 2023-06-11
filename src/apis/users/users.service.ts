import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    private readonly utils: UtilityService
  ) {}

  async findLoginDetails(
    username: string,
    pass: string
  ): Promise<User | undefined> {
    /**
     * @todo
     * 1. verify otp
     * 2. fetch userId
     * 3. if not found create userId
     * 4. return user object corresponding to uuid
     */
    // update this to return DB user instance

    let loginDetails;
    const loginOptions = {
      collection: DBConstants.TABLES.LOGIN,
      identifiers: {
        pk: username,
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
        loginDetails = await this.createUser(username);
      } catch (e) {
        // throw e;
        return;
      }
    }

    return loginDetails;
  }

  private async createUser(mobNum: string) {
    const userID = this.utils.getNewUUID();
    const projectId = this.utils.getNewProjectId();
    const userBody = {
      pk: userID,
      sk: 'meta',
      id: userID,
      name: 'User',
      firstName: 'User',
      lastName: '',
      countryCode: mobNum.split('__')?.[0],
      mobile: mobNum.split('__')?.[1],
      profilePhoto: 'https://api.multiavatar.com/' + userID + '.png',
    };

    const loginBody = {
      pk: mobNum,
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
              pk: mobNum,
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
      return e;
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
