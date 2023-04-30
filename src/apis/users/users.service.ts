import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'maria',
      password: 'guess',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    /**
     * @todo 
     * 1. verify otp
     * 2. fetch userId
     * 3. if not found create userId
     * 4. return user object corresponding to uuid
     */
    // update this to return DB user instance
    return this.users.find((user) => user.username === username);
  }
}
