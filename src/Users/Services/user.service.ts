/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto, LoginDto, createUserResponseDto } from '../DTO/user.dto';
import { Tempuser, User } from '../Interfaces/UserInterface';
import { CreateUserDto } from '../DTO/user.dto'
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { ResponseDto } from 'src/Doctors/Dto/createDoctor';





@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Tempuser') private TempUserModel: Model<Tempuser>,
    private readonly _jwtService: JwtService,
    private readonly mailservice: MailService
  ) { }



  async generateOtp(): Promise<string> {
    const otp = crypto.randomInt(1000, 9999).toString();
    return otp;
  }

  async GoogleAuthentication(user: any): Promise<createUserResponseDto> {
    const { uid, email, displayName,stsTokenManager: { accessToken }  } = user
    if (!displayName || !email || !uid) {
      throw new InternalServerErrorException("Internal Server Error. Try Again");
    }
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser && existingUser.isBlocked) {
      return {
        success: false,
        message: 'You Are Blocked By Admin. Please Contact Support.',
      };
    }
  
    if (!existingUser) {
      console.log("Creating new user...");
  
      const newUser = new this.userModel({
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' '),
        email,
        isGoogle: true,
      });
  
      console.log("New User:", newUser);
      await newUser.save();
  
      return {
        success: true,
        message: 'User successfully authenticated and registered.',
        data: {
        _id: newUser._id.toString(),
         accessToken,
        },
      };
    }
  
    // If the user exists and is not blocked, return a success response
    return {
      success: true,
      message: 'User successfully authenticated.',
      data: {
        _id: existingUser._id.toString(),
        accessToken, 
      },
    };
  }
  



   

  





  async createUser(_createUserDto: any): Promise<createUserResponseDto> {
    try {
        const otp = await this.generateOtp();
        const otpExpires = new Date(Date.now() + 15 * 60000); // 15 minutes expiration
        const { email, firstName, lastName, gender, dateOfBirth, contactNumber, password } = _createUserDto;

        // Check if the user already exists in the permanent user collection
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            return {
                success: false,
                message: 'User already exists. Please log in.',
            };
        }

        // Check if the user exists in the temporary user collection
        const existingTempUser = await this.TempUserModel.findOne({ email }).exec();

        if (existingTempUser) {
            // Resend OTP if user already exists in TempUser and hasn't verified OTP
            existingTempUser.otp = otp;
            existingTempUser.otpExpires = otpExpires;
            await existingTempUser.save();

            const content = `Your verification OTP is <b><strong>${otp}</strong></b>. It expires in 15 minutes.`;

            await this.mailservice.sendWelcomeEmail(email, firstName, content);

            return {
                success: true,
                message: 'You already have a pending verification. Please verify your account with the new OTP sent to your email.',
                data: {
                    email: existingTempUser.email
                }
            };
        }

        // If not in TempUser, create a new temporary user
        const temporaryUser = new this.TempUserModel({
            firstName,
            lastName,
            email,
            gender,
            dateOfBirth,
            contactNumber,
            password,
            otp,
            otpExpires,
        });

        const content = `Your verification OTP is <b><strong>${otp}</strong></b>. It expires in 15 minutes.`;

        await this.mailservice.sendWelcomeEmail(email, firstName, content);

        // Save the temporary user
        await temporaryUser.save();

        return {
            success: true,
            message: 'Please verify your account with the OTP sent to your email.',
            data: {
                email: temporaryUser.email
            }
        };

    } catch (error) {
        console.error("Error in createUser:", error);

        // Return a failure response with a generic error message
        return {
            success: false,
            message: 'An error occurred while creating the user. Please try again later.',
        };
    }
}


  async verifyUser(otpValue: string, email: string): Promise<createUserResponseDto> {
    try {
      const checkTempUser = await this.TempUserModel.findOne({ email }).exec();
    
      if (!checkTempUser) {
        console.log("Temporary user not found");
        return {
          success: false,
          message: 'Temporary user not found',
        };
      }
    
      const otpExpiry = checkTempUser.otpExpires;
      const currentTime = new Date();
  
      console.log("is otp Expired",currentTime>otpExpiry)
  
      console.log("Current Time:", currentTime);
      console.log("OTP Expiry Time:", otpExpiry);
    
      if (currentTime > otpExpiry) {
        console.log("OTP has expired");
        return {
          success: false,
          message: 'OTP has expired',
        };
      }
    
      if (checkTempUser.otp !== otpValue) {
        return {
          success: false,
          message: 'Invalid OTP',
        };
      }
    
      const existingUser = await this.userModel.findOne({ email }).exec();
    
      if (existingUser) {
        return {
          success: false,
          message: 'User already exists',
        };
      }
    
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(checkTempUser.password, saltRounds);
    
      const newUser = new this.userModel({
        firstName: checkTempUser.firstName,
        lastName: checkTempUser.lastName,
        contactNumber: checkTempUser.contactNumber,
        gender: checkTempUser.gender,
        dateOfBirth: checkTempUser.dateOfBirth,
        email: checkTempUser.email,
        password: hashedPassword,
        isOtpVerified: true,
        role: "user",
      });
    
      await newUser.save();
    
      const content = "Your Registration Verified With Your OTP Successfully";
      console.log('Email:', newUser.email);
      console.log('First Name:', newUser.firstName);
      console.log('Content:', content);
    
      await this.mailservice.sendWelcomeEmail(newUser.email, newUser.firstName, content);
    
      await this.TempUserModel.deleteOne({ email }).exec();
    
      return {
        success: true,
        message: 'User registered successfully',
        data: {
          firstName: newUser.firstName,
          lastname: newUser.lastName,
          contactnumber: newUser.contactNumber, 
          gender: newUser.gender,
          dateofbirth: newUser.dateOfBirth,
          email: newUser.email,
        },
      };
    
    } catch (error) {
      console.error("An error occurred:", error);
      throw new Error('User verification failed');
    }
  }











  async login(loginDto: LoginDto): Promise<LoginResponseDto> {

    const { email, password } = loginDto

   


    const ExistingUser = await this.userModel.findOne({ email }).exec()
    const payload = { userId: ExistingUser._id, email: ExistingUser.email,role:ExistingUser.role }
    const Token = this._jwtService.sign(payload)
    
    if(ExistingUser&&ExistingUser.isGoogle){
      return{
        success:false,
        message:'Account linked to Google. Please continue with Google ',
        Token:Token



      }
    }
    if (ExistingUser) {

      const passwordmatch = await bcrypt.compare(password, ExistingUser.password)

      if (passwordmatch) {



        

        return {
          success: true,
          message: 'Login SuccessFully',
          data: {
            _id: ExistingUser._id.toString(),
            firstname: ExistingUser.firstName,
            lastname: ExistingUser.lastName,
            contactnumber: ExistingUser.contactNumber,
            gender: ExistingUser.gender,
            dateofbirth: ExistingUser.dateOfBirth,
            email: ExistingUser.email
          },
          Token: Token
        }


      } else {
        return {
          success: false,
          message: 'Invalid Credential Please Check Your Password'
        }
      }

    } else {
      return {
        success: false,
        message: 'Account is Not Registered,Please register'
      }
    }

  }

}

