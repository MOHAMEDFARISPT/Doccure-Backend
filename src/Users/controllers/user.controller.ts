/* eslint-disable prettier/prettier */
import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { UserService } from '../Services/user.service';
import { CreateUserDto, loginDto, responseDto } from '../DTO/user.dto';
import { User } from '../Schema/user.Schema';


@Controller('users')
export class UserController {
    constructor(private readonly userServices:UserService){}
    @Post('register')
    async create(@Body() CreateUserDto: CreateUserDto): Promise<responseDto<User>> {
        try{
            const response=await this.userServices.create(CreateUserDto);
            return {
                success: true,
                message: 'User registered successfully.',
                data: response.data,
              };

        }catch(error){

            throw new HttpException({
                success: false,
                message: error.message,
              }, HttpStatus.CONFLICT);

        }
       
    }

    @Post('login')
    async login(@Body() loginDto:loginDto){
        return this.userServices.login(loginDto)
    }

    


}

