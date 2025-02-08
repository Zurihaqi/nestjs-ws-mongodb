import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../user/schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async seed() {
    const userCount = await this.userModel.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      const user = new this.userModel({
        username: 'Admin',
        password: hashedPassword
      });

      await user.save();
      this.logger.log('User seeded:', user);
    } else {
      this.logger.log('User already exists, skipping seeding');
    }
  }
}
