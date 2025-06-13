import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class RegisterServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;
}
