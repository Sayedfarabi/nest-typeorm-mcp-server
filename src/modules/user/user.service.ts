import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(data: User) {
    return this.userRepo.save(data);
  }

  //   update(data: Partial<User>){
  //     return this.userRepo.update({i})
  //   }

  findAll() {
    return this.userRepo.find();
  }
}
