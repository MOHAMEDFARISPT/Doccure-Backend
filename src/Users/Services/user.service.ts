/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Appointmentcreation, commonResponse, createUserResponse, IWallet, Tempuser, User, userlogin } from '../Interfaces/UserInterface';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';
import { create } from 'domain';
import { AvailableTimeInterface, AvailableTimeResponse, responseData, Slot } from 'src/Doctors/interfaces/DoctorInterface';
import { Wallet } from '../Schema/Wallet.schema';
import { types } from 'util';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';
import { Appointment } from '../Schema/Appointment.Schema';
import { UserModel } from '../Schema/user.Schema';







@Injectable()
export class UserService {
  
  private razorpay: Razorpay;
 
  constructor(
    @InjectModel('User') private userModel: Model<UserModel>,
    @InjectModel('Tempuser') private TempUserModel: Model<Tempuser>,
    @InjectModel('availableTimes') private readonly AvailableTimeModel:Model<AvailableTimeInterface>,
    @InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>,
    @InjectModel('wallet') private readonly walletModel:Model<Wallet>,
    private readonly _jwtService: JwtService,
    private readonly mailservice: MailService,
 
  ) { 
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }



  async generateOtp(): Promise<string> {
    const otp = crypto.randomInt(1000, 9999).toString();
    return otp;
  }

  async GoogleAuthentication(user: any): Promise<createUserResponse> {
    const { uid, email, displayName, stsTokenManager: { accessToken } } = user;
    
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
  
    let userId: string;
    if (!existingUser) {
      const newUser = new this.userModel({
        firstName: displayName.split(' ')[0],
        lastName: displayName.split(' ').slice(1).join(' '),
        email,
        isGoogle: true,
      });
      
      await newUser.save();
     
      userId = newUser._id.toString();
    } else {
     
      userId = existingUser._id.toString();
    }
  
    const payload = { firstname: displayName.split(' ')[0], email, role: 'user' };
    const jwtToken = this._jwtService.sign(payload);
  
    return {
      success: true,
      message: existingUser ? 'User successfully authenticated.' : 'User successfully authenticated and registered.',
      data: {

        _id: userId,
        accessToken: jwtToken,
      },
    };
  }
  



   

  





  async createUser(_createUserDto: User): Promise<createUserResponse> {
    const otp = await this.generateOtp();
    const otpExpires = new Date(Date.now() + 15 * 60000);
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
          email: existingTempUser.email,
        },
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
    console.log("otp",otp)

    const content = `Your verification OTP is <b><strong>${otp}</strong></b>. It expires in 15 minutes.`;

    await this.mailservice.sendWelcomeEmail(email, firstName, content);

    // Save the temporary user
    await temporaryUser.save();

    return {
      success: true,
      message: 'Please verify your account with the OTP sent to your email.',
      data: {
        email: temporaryUser.email,
      },
    };
  }


  async verifyUser(otpValue: string, email: string): Promise<createUserResponse> {
    try {
      const checkTempUser = await this.TempUserModel.findOne({ email }).exec();
    
      if (!checkTempUser) {
        return {
          success: false,
          message: 'Temporary user not found',
        };
      }
    
      const otpExpiry = checkTempUser.otpExpires;
      const currentTime = new Date();

    
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

      const newWallet=new this.walletModel({
        userId:newUser._id,
        balance:0,
        transactions:[],

  
      })

      await newWallet.save()
    
      const content = "Your Registration Verified With Your OTP Successfully";
    
      await this.mailservice.sendWelcomeEmail(newUser.email, newUser.firstName, content);
    
      await this.TempUserModel.deleteOne({ email }).exec();
    
      return {
        success: true,
        message: 'User registered successfully',
      };
    
    } catch (error) {
      throw new Error('User verification failed');
    }
  }




  async login(loginDto:userlogin ): Promise<createUserResponse> {

    const { email, password } = loginDto

   


    const ExistingUser = await this.userModel.findOne({ email }).exec()
 
    
    if(ExistingUser&&ExistingUser.isGoogle){
     
      throw new HttpException('Account linked to Google. Please continue with Google.', HttpStatus.BAD_REQUEST);
    }
   
    if (ExistingUser) {

      const passwordmatch = await bcrypt.compare(password, ExistingUser.password)

      if (passwordmatch) {


        const payload = { userId: ExistingUser._id.toString(), email: ExistingUser.email,role:ExistingUser.role }
        const Token = this._jwtService.sign(payload)
       
       

        return {
          success: true,
          message: 'Login SuccessFully',
          data: {
            _id: ExistingUser._id.toString(),
            firstName: ExistingUser.firstName,
            lastName: ExistingUser.lastName,
            contactnumber: ExistingUser.contactNumber,
            gender: ExistingUser.gender,
            dateofbirth: ExistingUser.dateOfBirth,
            email: ExistingUser.email,
            accessToken: Token
          }
          }
         


      } else {
        throw new UnauthorizedException('Invalid credentials. Please check your password.')
      }

    } else {
      return {
        success: false,
        message: 'Account is Not Registered,Please register'
      }
    }

  }





  async findAvailableSlots(doctorId: string, day: string): Promise<AvailableTimeResponse> {
    try {
      const parsedId=new ObjectId(doctorId)
  
  
  
     
      const availableTimes = await this.AvailableTimeModel.find({
        doctorId: parsedId,
        day: day  
      }).exec();
  
   
  
      // Map the results to slots
      const slots: Slot[] = availableTimes.map((slot) => ({
        _id: slot._id.toString(),
        DoctorId: slot.doctorId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked:slot.isBooked

      }));
  
      return {
        slots,
        success: true,
        message: '',
      };
    } catch (error) {
      console.error("Error fetching available slots:", error);
      return {
        slots: [],
        success: false,
        message: 'Error fetching available slots',
      };
    }
  }
  
  




  async loaduserData(userId:string):Promise<createUserResponse>{

    const parsedId = new Types.ObjectId(userId);

    let user=await this.userModel.findOne({_id:parsedId}).exec()



    return {
      data:{
        _id:user._id.toString(),
        firstName:user.firstName,
        lastName:user.lastName,
        gender:user.gender,
        dateofbirth:user.dateOfBirth,
        contactnumber:user.contactNumber,
        email:user.email,
        profileImage:user.profileImage
  
      }
      
    }

  }



  async createOrder(amount: number, currency: string) {
    const options = {
      amount: amount, // Amount in paise
      currency: currency,
    };
    return this.razorpay.orders.create(options);
  }

  async verifyPayment(verifyPaymentDto: any) {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(verifyPaymentDto.order_id + '|' + verifyPaymentDto.payment_id)
      .digest('hex');

    if (generatedSignature === verifyPaymentDto.razorpay_signature) {
      return { success: true };
    } else {
      return { success: false };
    }
  }


  async createAppointment(appointmentData: Appointmentcreation): Promise<commonResponse> {
    const {
        patientId,
        doctorId,
        slotId,
        totalAmount,
        PaymentMethod,
        paymentStatus,
        consultationType,
    } = appointmentData;

    if (PaymentMethod === "wallet") {
        const parsedId = new ObjectId(patientId);
    

        const UserWallet = await this.walletModel.findOne({ userId: parsedId }).exec();

        // Check if the user has enough balance
        if (UserWallet.balance < totalAmount) {
            return {
                success: false,
                message: 'Insufficient funds in your wallet',
            };
        } else {
            // Deduct the amount from the wallet
            const updatedBalance = UserWallet.balance - totalAmount;

            // Create a new appointment
            const parsedPatientId = new Types.ObjectId(patientId);
            const parsedDoctorId = new Types.ObjectId(doctorId);
            const parsedSlotId = new Types.ObjectId(slotId);

            const newAppointment = new this.appointmentModel({
                patientId: parsedPatientId,
                doctorId: parsedDoctorId,
                slotId: parsedSlotId,
                totalAmount,
                PaymentMethod,
                paymentStatus,
                consultationType,
            });

            await newAppointment.save();

            // Update wallet balance and add a transaction for the debit
            await this.walletModel.updateOne(
                { userId: parsedId },
                {
                    $set: { balance: updatedBalance },
                    $push: {
                        transactions: {
                            amount: totalAmount,
                            type: 'Debit',
                            description: `Payment for appointment`
                        }
                    }
                }
            ).exec();

            // Mark the slot as booked
            await this.AvailableTimeModel.findOneAndUpdate(
                { _id: parsedSlotId },
                { isBooked: true },
                { new: true }
            ).exec();

            return {
                success: true,
                message: 'Slot booked successfully'
            };
        }
    } else if (PaymentMethod === 'razorpay') {
        const parsedPatientId = new Types.ObjectId(patientId);
        const parsedDoctorId = new Types.ObjectId(doctorId);
        const parsedSlotId = new Types.ObjectId(slotId);
        
        const newAppointment = new this.appointmentModel({
            patientId: parsedPatientId,
            doctorId: parsedDoctorId,
            slotId: parsedSlotId,
            totalAmount,
            PaymentMethod,
            paymentStatus,
            consultationType,
        });

        await newAppointment.save();

        // Mark the slot as booked
        await this.AvailableTimeModel.findOneAndUpdate(
            { _id: parsedSlotId },
            { isBooked: true },
            { new: true }
        ).exec();

        return {
            success: true,
            message: 'Slot booked successfully'
        };
    }
}




async getWallet(userId:string):Promise<IWallet>{
  const parsedId=new ObjectId(userId)
  let userWallet=await this.walletModel.findOne({userId:parsedId}).exec()
  if(userWallet){
    const formattedTransactions = userWallet.transactions.map((transaction) => ({
      transactionId: transaction.transactionId.toString(),
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
    }));
    return {
      _id: userWallet._id.toString(),
      userId: userWallet.userId.toString(),
      balance: userWallet.balance,
      transactions: formattedTransactions,  // Add formatted transactions
      createdAt: userWallet.createdAt,
      updatedAt: userWallet.updatedAt,
    };
  }
  
 
}

async getAppointments(patientId:string):Promise<Appointment[]>{

  const parsedpatientId=new ObjectId(patientId)
  console.log(parsedpatientId)
  const result=await this.appointmentModel.find({ patientId:parsedpatientId })
  .populate('slotId')
  .populate('doctorId')
  .populate('patientId')
  .exec()



  
 return result as Appointment[]
}

async getappointment(apmntId: string,userId: string):Promise<Appointment> {
  const parsedPatientId=new ObjectId(userId)
  const parsedappoinmentId=new ObjectId(apmntId)
  const result = await this.appointmentModel.findOne({
    patientId: parsedPatientId,
    _id:parsedappoinmentId
  })
  .populate('doctorId')
  .populate('patientId')
  .populate('slotId')

  return result as Appointment
}



async cancellAppointment(appointmentId:string,userId:string,reason:string){

  const parsedAppointmentId=new ObjectId(appointmentId)
  const parseduserId=new ObjectId(userId)

  console.log("parsedAppointmentId",parsedAppointmentId)
  console.log('parseduserId',parseduserId)
  console.log('reason',reason)

  let Appointment=await this.appointmentModel.findOne({_id:parsedAppointmentId,patientId:parseduserId}).exec()

 Appointment.isCancelled=true;
 Appointment.cancellationReason=reason
 Appointment.consultaionStatus='cancelled'

 await Appointment.save()

 let wallet=await this.walletModel.findOne({userId:parseduserId}).exec()

 let AppointmentPaymentAmount=wallet.transactions



 

}
 







}


   








