import { UserDto } from 'src/modules/user/dto/user.dto';

export class CreateMessageDto {
  sender: UserDto;
  recipient: UserDto;
  content: string;
}
