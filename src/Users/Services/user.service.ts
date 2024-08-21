/* eslint-disable prettier/prettier */
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../Schema/user.Schema';
import { CreateUserDto, loginDto } from '../DTO/user.dto';
import { responseDto } from '../DTO/user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel:Model<User>,
        private readonly _jwtService: JwtService
    ){}


    async create(createUserDto:CreateUserDto): Promise<responseDto<User>>{
       const{email,password}=createUserDto
       //check if the user Is Already Registered or not
       const ExistingUser=await this.userModel.findOne({email}).exec()
       if(ExistingUser){
        throw new ConflictException('User already registered. Please log in.')

       }
       //if new User
       const saltRounds=10
       const hashedPassword=await bcrypt.hash(password,saltRounds) 
       const newUser=new this.userModel({
       ...createUserDto,
       password:hashedPassword
       });
       await newUser.save()

       return{
        success: true,
        message: 'User registered successfully.',
        data: newUser,
      };
    }



    async login(loginDto:loginDto):Promise<any>{
        const {email,password}=loginDto

        const user=await this.userModel.findOne({email})
        if(user){
            console.log(user)
            const passwordsMatch=await bcrypt.compare(password,user.password)
            if(passwordsMatch){
                const payload = { firstName: user.firstName, sub: user._id }; // Adjust according to your user schema
      const accessToken = this._jwtService.sign(payload);

      return {
        success:true,
        message:user.firstName+" "+"logged in Successfully",
        access_Token:accessToken
      }


            }else{
                return {
                    sucess:false,
                    message:'invalid Credential'
                }
            }


        }else{
            return {
                success:false,
                message:'user is not Registered,Please Register'
            }
            
        }

    }

   


}