import { Controller, Get, Param, Query, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UtilityService } from 'src/common/commonServices/utility.service';

type userDetailsAPIParams = {
  id: string;
};

@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly utilityService: UtilityService
  ) {}
  @Get(':id')
  async getUser(
    @Param() params: userDetailsAPIParams,
    @Query() queryParams,
    @Request() req
  ) {
    const details = this.utilityService.queryParamToBool(queryParams.details);
    const user = req.user;
    if (!details) {
      delete user.projects;
    }
    console.log('--------------------');
    console.log(user);
    console.log('--------------------');
    return user;
  }

  @Get(':id/projects')
  async getUserProjects(@Param() params: userDetailsAPIParams) {
    const res = await this.userService.getUserProjects(params.id);
    return res;
  }
}
