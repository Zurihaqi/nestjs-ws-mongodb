import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserSeeder } from './user.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  providers: [UserService, UserSeeder],
  exports: [UserService]
})
export class UserModule {}
