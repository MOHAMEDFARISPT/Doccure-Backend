import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  Appointmentcreation,
  commonResponse,
  createUserResponse,
  IWallet,
  Tempuser,
  User,
  userlogin,
  userProfileDetailes,
} from '../Interfaces/UserInterface';
import * as crypto from 'crypto';
import { MailService } from 'src/mail/mail.service';

import {
  AvailableTimeInterface,
  AvailableTimeResponse,
  doctorrequestsResponseDto,
  Slot,
} from 'src/Doctors/interfaces/DoctorInterface';
import { Wallet } from '../Schema/Wallet.schema';
import { ObjectId } from 'mongodb';
import Razorpay from 'razorpay';
import { Appointment } from '../Schema/Appointment.Schema';
import { UserModel } from '../Schema/user.Schema';
import { DoctorModel } from 'src/Doctors/schema/doctor.schema';
import { Category, loadAllcategories } from 'src/Admin/interfaces/interface';
import {
  speciality,
  specialityDocument,
} from 'src/Admin/Schema/speciality.schema';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
@Injectable()
export class UserService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel('User') private userModel: Model<UserModel>,
    @InjectModel('Tempuser') private TempUserModel: Model<Tempuser>,
    @InjectModel('availableTimes')
    private readonly AvailableTimeModel: Model<AvailableTimeInterface>,
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('Doctor') private readonly doctorModel: Model<DoctorModel>,
    @InjectModel(speciality.name)
    private SpecialityModel: Model<specialityDocument>,
    @InjectModel('wallet') private readonly walletModel: Model<Wallet>,
    private readonly _jwtService: JwtService,
    private readonly mailservice: MailService,
    private cloudinaryService: CloudinaryService,
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

  async findById(userId) {
    console.log('Hello');
    const parsedId = new ObjectId(userId);
    return await this.userModel.findById(parsedId);
  }

  async GoogleAuthentication(user: any): Promise<createUserResponse> {
    const { uid, email, displayName } = user;

    if (!displayName || !email || !uid) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
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

    const payload = {
      firstname: displayName.split(' ')[0],
      email,
      role: 'user',
    };
    const jwtToken = this._jwtService.sign(payload);

    return {
      success: true,
      message: existingUser
        ? 'User successfully authenticated.'
        : 'User successfully authenticated and registered.',
      data: {
        _id: userId,
        accessToken: jwtToken,
        refreshToken: '',
      },
    };
  }
  async findDoctorsByGenders(genders: string[]): Promise<DoctorModel[]> {
    const result = await this.doctorModel
      .find({
        'personalDetails.isApproved': true,
        'personalDetails.isRegcancelled': false,
        'personalDetails.isBlocked': false,
        'personalDetails.gender': { $in: genders },
      })

      .exec();

    console.log('heelooo', result);
    return result;
  }

  async getAllDoctors(
    currentPage: number,
    limit: number,
  ): Promise<any | InternalServerErrorException> {
    try {
      const skip = (currentPage - 1) * limit;
      const [doctors, totalDoctorsCount] = await Promise.all([
        this.doctorModel
          .find({
            'personalDetails.isApproved': true,
            'personalDetails.isBlocked': false,
            'personalDetails.isRegcancelled': false,
          })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.doctorModel.countDocuments({
          'personalDetails.isApproved': true,
          'personalDetails.isBlocked': false,
          'personalDetails.isRegcancelled': false,
        }),
      ]);
      console.log('doctors>???', doctors);

      console.log('totalPage', Math.ceil(totalDoctorsCount / limit));
      console.log('totalDoctorsCount', totalDoctorsCount);

      const totalPages = Math.ceil(totalDoctorsCount / limit);

      return {
        doctors,
        totalDoctorsCount,
        totalPages,
        currentPage,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async filteronExperience(selectedExperience: string): Promise<DoctorModel[]> {
    try {
      console.log('selectedExperience////', selectedExperience);
      const experienceRange: number[] =
        this.parseExperienceRange(selectedExperience);

      // Fetching all doctors that are approved and not cancelled
      const doctors = await this.doctorModel
        .find({
          'personalDetails.isApproved': true,
          'personalDetails.isBlocked': false,
          'personalDetails.isRegcancelled': false,
        })
        .exec();

      // Filtering doctors based on the experience range
      const filteredDoctors = doctors.filter(
        (doctor) =>
          doctor.professionalDetails.totalExperience >= experienceRange[0] &&
          (experienceRange[1] === Infinity ||
            doctor.professionalDetails.totalExperience <= experienceRange[1]),
      );
      console.log('filteredDoctors///????', filteredDoctors);

      return filteredDoctors;
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  private parseExperienceRange(experience: string): number[] {
    if (experience.includes('+')) {
      const min = parseInt(experience.split('+')[0]);
      return [min, Infinity];
    } else {
      const range = experience.split('-').map((val) => parseInt(val));
      return [range[0], range[1]];
    }
  }

  async filteronDepartment(selectedDepartment: string): Promise<DoctorModel[]> {
    try {
      const doctors = await this.doctorModel.find({
        'professionalDetails.specialisedDepartment': selectedDepartment,
        'personalDetails.isApproved': true,
        'personalDetails.isBlocked': false,
        'personalDetails.isRegcancelled': false,
      });

      return doctors;
    } catch (error) {
      console.error('Error fetching doctors by department:', error);
      throw error;
    }
  }

  async searchDoctors(searchTerm: string): Promise<DoctorModel[]> {
    try {
      const doctors = await this.doctorModel.find({
        'personalDetails.isApproved': true,
        'personalDetails.isBlocked': false,
        'personalDetails.isRegcancelled': false,
        $or: [
          {
            'personalDetails.firstName': { $regex: searchTerm, $options: 'i' },
          },
          { 'personalDetails.lastName': { $regex: searchTerm, $options: 'i' } },
          {
            'professionalDetails.specialisedDepartment': {
              $regex: searchTerm,
              $options: 'i',
            },
          },
        ],
      });
      return doctors;
    } catch (error) {}
  }
  async Specialities(): Promise<loadAllcategories> {
    try {
      const specialities = await this.SpecialityModel.find().exec();

      // Check if specialities exist and filter only the ones that are listed
      if (specialities && specialities.length > 0) {
        const categories: Category[] = specialities
          .filter((category) => category.isListed) // Only include categories that are listed
          .map((category) => ({
            _id: category._id.toString(),
            specialityName: category.specialityName,
            specialityDescription: category.specialityDescription,
            isListed: category.isListed,
          }));

        return {
          success: true,
          message: 'Categories fetched successfully',
          catogories: categories, // ensure spelling is correct
        };
      } else {
        return {
          success: false,
          message: 'No categories found',
          catogories: [],
        };
      }
    } catch (error) {
      console.error('Error fetching specialities:', error);
      return {
        success: false,
        message: 'Error fetching categories',
        catogories: [],
      };
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    try {
      const parsedId = new ObjectId(userId);
      const user = await this.userModel.findById(parsedId);
      if (!user) {
        return {
          success: false,
          message: 'user not found',
        };
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return {
          success: false,
          message: 'Incorrect currentPassword found',
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          message: 'new password and confirm password not  match',
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message || 'Password change failed');
    }
  }

  async likeDoctor(DoctorId: string): Promise<commonResponse> {
    try {
      const doctor = await this.doctorModel.findById(DoctorId); // No need to manually parse into ObjectId
      if (doctor) {
        console.log('Doctor found:', doctor);

        doctor.personalDetails.isFavourite =
          !doctor.personalDetails.isFavourite;
        await doctor.save();
        console.log('doctor aftersaving', doctor);

        return {
          success: true,
          message: 'Like updated successfully',
        };
      } else {
        return {
          success: false,
          message: 'Doctor not found',
        };
      }
    } catch (error) {
      console.error('Error updating like status:', error);
      return {
        success: false,
        message: 'An error occurred while liking the doctor',
      };
    }
  }

  async createUser(_createUserDto: User): Promise<createUserResponse> {
    try {
      const otp = await this.generateOtp();
      const otpExpires = new Date(Date.now() + 1 * 60000);
      const {
        email,
        firstName,
        lastName,
        gender,
        dateOfBirth,
        contactNumber,
        password,
      } = _createUserDto;

      // Check if the user already exists in the permanent user collection
      const existingUser = await this.userModel.findOne({ email }).exec();

      if (existingUser) {
        return {
          success: false,
          message: 'User already exists. Please log in.',
        };
      }
      // Check if the user exists in the temporary user collection
      const existingTempUser = await this.TempUserModel.findOne({
        email,
      }).exec();

      if (existingTempUser) {
        // Resend OTP if user already exists in TempUser and hasn't verified OTP
        existingTempUser.otp = otp;
        existingTempUser.otpExpires = otpExpires;
        await existingTempUser.save();

        const content = `Your verification OTP is <b><strong>${otp}</strong></b>. It expires in 1 minutes.`;

        await this.mailservice.sendWelcomeEmail(email, firstName, content);

        return {
          success: true,
          message:
            'You already have a pending verification. Please verify your account with the new OTP sent to your email.',
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
      console.log('otp', otp);

      const content = `Your verification OTP is <b><strong>${otp}</strong></b>. It expires in 1 minutes.`;

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
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async verifyUser(
    otpValue: string,
    email: string,
  ): Promise<createUserResponse> {
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
        console.log('OTP has expired');
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
      const hashedPassword = await bcrypt.hash(
        checkTempUser.password,
        saltRounds,
      );

      const newUser = new this.userModel({
        firstName: checkTempUser.firstName,
        lastName: checkTempUser.lastName,
        contactNumber: checkTempUser.contactNumber,
        gender: checkTempUser.gender,
        dateOfBirth: checkTempUser.dateOfBirth,
        email: checkTempUser.email,
        password: hashedPassword,
        isOtpVerified: true,
        role: 'user',
      });

      await newUser.save();

      const newWallet = new this.walletModel({
        userId: newUser._id,
        balance: 0,
        transactions: [],
      });

      await newWallet.save();

      const content = 'Your Registration Verified With Your OTP Successfully';

      await this.mailservice.sendWelcomeEmail(
        newUser.email,
        newUser.firstName,
        content,
      );

      await this.TempUserModel.deleteOne({ email }).exec();

      return {
        success: true,
        message: 'User registered successfully',
      };
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  async resendOtp(
    email: string,
  ): Promise<commonResponse | UnauthorizedException> {
    try {
      const otp = await this.generateOtp();
      const otpExpires = new Date(Date.now() + 1 * 60000);
      const ExistingTempUser = await this.TempUserModel.findOne({
        email,
      }).exec();

      ExistingTempUser.otp = otp;
      ExistingTempUser.otpExpires = otpExpires;
      await ExistingTempUser.save();
      if (ExistingTempUser) {
        const content = `Your verification OTP is <b><strong>${otp}</strong></b>. It expires in 1 minutes.`;
        console.log(otp);
        this.mailservice.sendWelcomeEmail(
          email,
          ExistingTempUser.firstName,
          content,
        );

        return {
          success: true,
          message:
            'Please verify your account with the new OTP sent to your email',
        };
      } else {
        return new UnauthorizedException('please register Again');
      }
    } catch (error) {}
  }

  async login(
    loginDto: userlogin,
  ): Promise<createUserResponse | UnauthorizedException> {
    try {
      const { email, password } = loginDto;

      const ExistingUser = await this.userModel.findOne({ email }).exec();

      if (ExistingUser && ExistingUser.isGoogle) {
        return new BadRequestException(
          'Account linked to Google. Please continue with Google.',
        );
      }
      if (ExistingUser && ExistingUser.isBlocked) {
        return {
          success: false,
          message: 'User is blocked',
        };
      }

      if (ExistingUser) {
        const passwordmatch = await bcrypt.compare(
          password,
          ExistingUser.password,
        );

        if (passwordmatch) {
          const payload = {
            userId: ExistingUser._id.toString(),
            email: ExistingUser.email,
            role: ExistingUser.role,
          };
          const Token = this._jwtService.sign(payload, { expiresIn: '2d' });
          const refreshToken = this._jwtService.sign(payload, {
            expiresIn: '7d',
          });
          console.log('AccessToken', Token);
          console.log('REfreshToken', refreshToken);
          return {
            success: true,
            message: 'Login SuccessFully',
            data: {
              _id: ExistingUser._id.toString(),
              firstName: ExistingUser.firstName,
              lastName: ExistingUser.lastName,
              contactNumber: ExistingUser.contactNumber,
              gender: ExistingUser.gender,
              dateOfBirth: ExistingUser.dateOfBirth,
              email: ExistingUser.email,
              accessToken: Token,
              refreshToken: refreshToken,
            },
          };
        } else {
          return new UnauthorizedException(
            'Invalid credentials. Please check your password.',
          );
        }
      } else {
        return {
          success: false,
          message: 'Account is Not Registered,Please register',
        };
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    userId: string,
  ): Promise<commonResponse> {
    console.log('In service');
    console.log('file//>>>>', file);

    const parsedUsedId = new ObjectId(userId);

    try {
      if (parsedUsedId) {
        const user = await this.userModel
          .findById({ _id: parsedUsedId })
          .exec();
        console.log(user);

        if (user) {
          // Await the upload to get the response and URL
          const response = await this.cloudinaryService.uploadFile(file);
          console.log('response', response.url);

          user.profileImage = response.url;

          await user.save();
          console.log('Image Uploadded SuccessFully');
          return {
            success: true,
            message: 'Profile image uploaded successfully',
          };
        } else {
          return {
            success: false,
            message: 'User Not Found',
          };
        }
      } else {
        return {
          success: false,
          message: 'Invalid User ID',
        };
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      return {
        success: false,
        message: 'Error uploading profile image',
      };
    }
  }
  // Refresh the access token
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string }> {
    const userId = this._jwtService.verify(refreshToken).userId;
    const parsedId = new ObjectId(userId);
    const user: User = await this.userModel.findById(parsedId);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    console.log('user', user);

    const payload = {
      email: user.email,
      role: user.role,
    };

    const accessToken = this._jwtService.sign(payload); // Create a new access token

    return { accessToken }; // Return the new access token
  }

  async updateProfileDetailes(
    updateProfileDetailes: userProfileDetailes,
    userId: string,
  ): Promise<commonResponse> {
    try {
      const parsedUserId = new ObjectId(userId);
      const ExistingUser = await this.userModel.findByIdAndUpdate(
        parsedUserId,
        updateProfileDetailes,
        {
          new: true,
          runValidators: true,
        },
      );
      if (!ExistingUser) {
        return {
          success: false,
          message: 'User Not Found',
        };
      }
      return {
        success: true,
        message: 'Profile Updated SuccessFully',
      };
    } catch (error) {}
  }

  async findAvailableSlots(
    doctorId: string,
    day: string,
  ): Promise<AvailableTimeResponse | InternalServerErrorException> {
    try {
      if (doctorId) {
        const parsedId = new ObjectId(doctorId);

        const availableTimes = await this.AvailableTimeModel.find({
          doctorId: parsedId,
          day: day,
        }).exec();

        // Map the results to slots
        const slots: Slot[] = availableTimes.map((slot) => ({
          _id: slot._id.toString(),
          DoctorId: slot.doctorId,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isBooked: slot.isBooked,
        }));

        return {
          slots,
          success: true,
          message: '',
        };
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async loaduserData(
    userId: string,
  ): Promise<createUserResponse | NotFoundException> {
    try {
      if (userId) {
        const parsedId = new Types.ObjectId(userId);
        const user = await this.userModel.findOne({ _id: parsedId }).exec();

        return {
          data: {
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
            contactNumber: user.contactNumber,
            email: user.email,
            profileImage: user.profileImage,
          },
        };
      } else {
        return new NotFoundException('User Not Found');
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async fetchDoctor(doctorId: string): Promise<doctorrequestsResponseDto> {
    try {
      const parsedDoctorId = new ObjectId(doctorId); // Assuming doctorId is valid ObjectId
      console.log(typeof parsedDoctorId);
      console.log(parsedDoctorId);
      const doctor = await this.doctorModel
        .findById({ _id: parsedDoctorId })
        .exec(); // Fetch doctor from DB

      if (doctor) {
        return {
          success: true,
          message: 'Doctor details fetched successfully',
          data: {
            _id: doctor._id.toString(),
            personalDetails: {
              firstName: doctor.personalDetails.firstName,
              lastName: doctor.personalDetails.lastName,
              email: doctor.personalDetails.email,
              gender: doctor.personalDetails.gender,
              contactNumber: doctor.personalDetails.contactNumber,
              dateofBirth: doctor.personalDetails.dateofBirth,
              regCancelreason: doctor.personalDetails.regCancelreason,
              profileImage: doctor.personalDetails.profileImage,
            },
            generalDetails: {
              city: doctor.generalDetails.city,
              state: doctor.generalDetails.state,
              country: doctor.generalDetails.country,
              zipcode: doctor.generalDetails.zipcode,
              adharNumber: doctor.generalDetails.adharNumber,
            },
            professionalDetails: {
              medicalLicenceNumber:
                doctor.professionalDetails.medicalLicenceNumber,
              specialisedDepartment:
                doctor.professionalDetails.specialisedDepartment,
              bio: doctor.professionalDetails.bio,
              MedicalDocument: doctor.professionalDetails.MedicalDocument,
              totalExperience: doctor.professionalDetails.totalExperience,
              patientsPerDay: doctor.professionalDetails.patientsPerDay,
              consultationFee: doctor.professionalDetails.consultationFee,
            },
          },
        };
      } else {
        // Doctor not found, return an appropriate error response
        return {
          success: false,
          message: 'Doctor not found',
          data: null,
        };
      }
    } catch (error) {
      // Handle any errors during fetching doctor details
      return {
        success: false,
        message: 'An error occurred while fetching doctor details',
        data: null,
      };
    }
  }

  async createOrder(amount: number, currency: string) {
    const options = {
      amount: amount * 100,
      currency: currency,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      console.log('Razorpay Order Created:', order);
      return order;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Error creating Razorpay order');
    }
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

  async createAppointment(
    appointmentData: Appointmentcreation,
  ): Promise<commonResponse> {
    try {
      const {
        patientId,
        doctorId,
        slotId,
        totalAmount,
        PaymentMethod,
        paymentStatus,
        consultationType,
      } = appointmentData;
      if (slotId) {
        if (PaymentMethod === 'wallet') {
          const parsedId = new ObjectId(patientId);

          const UserWallet = await this.walletModel
            .findOne({ userId: parsedId })
            .exec();

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
            await this.walletModel
              .updateOne(
                { userId: parsedId },
                {
                  $set: { balance: updatedBalance },
                  $push: {
                    transactions: {
                      amount: totalAmount,
                      type: 'Debit',
                      appointmentId: newAppointment._id,
                      description: `Payment for appointment`,
                    },
                  },
                },
              )
              .exec();

            // Mark the slot as booked
            await this.AvailableTimeModel.findOneAndUpdate(
              { _id: parsedSlotId },
              { isBooked: true },
              { new: true },
            ).exec();

            return {
              success: true,
              message: 'Slot booked successfully',
            };
          }
        } else if (PaymentMethod === 'razorpay') {
          console.log('Method Of Payment', PaymentMethod);
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

          await this.AvailableTimeModel.findOneAndUpdate(
            { _id: parsedSlotId },
            { isBooked: true },
            { new: true },
          ).exec();
          console.log('Slot booked successfully');

          return {
            success: true,
            message: 'Slot booked successfully',
          };
        }
      } else {
        return new NotFoundException('Slot Id Is Not Found');
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async getWallet(
    userId: string,
    currentPage: number,
    limit: number,
  ): Promise<IWallet | InternalServerErrorException> {
    try {
      console.log('CurrentPage', currentPage);

      const skip = (currentPage - 1) * limit;
      console.log('skip', typeof skip);
      console.log('limit', typeof limit);
      const parsedId = new ObjectId(userId);
      const userWallet = await this.walletModel
        .findOne({ userId: parsedId })
        .exec();

      if (userWallet) {
        const totalTransactions = userWallet.transactions.length;
        const paginatedTransactions = userWallet.transactions
          .reverse()
          .slice(skip, skip + limit);

        const formattedTransactions = paginatedTransactions.map(
          (transaction) => ({
            transactionId: transaction.transactionId.toString(),
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
          }),
        );

        // Calculate pagination information
        const totalPages = Math.ceil(totalTransactions / limit);
        return {
          _id: userWallet._id.toString(),
          userId: userWallet.userId.toString(),
          balance: userWallet.balance,
          transactions: formattedTransactions,
          totalTransactions: totalTransactions,
          currentPage: currentPage,
          totalPages: totalPages,
          createdAt: userWallet.createdAt,
          updatedAt: userWallet.updatedAt,
        };
      } else {
        throw new InternalServerErrorException('Wallet not found');
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  // totalAppointments,
  // totalAppointmentcount,
  // totalPages,
  // currentPage,

  async getAppointments(
    patientId: string,
    currentPage: number,
    limit: number,
    selectedStatus: string,
  ): Promise<any> {
    try {
      if (!patientId) {
        throw new NotFoundException('Patient Not Found');
      }

      if (!ObjectId.isValid(patientId)) {
        throw new BadRequestException('Invalid Patient ID format');
      }

      const skip = (currentPage - 1) * limit;

      const status =
        selectedStatus === 'All'
          ? { $in: ['upcoming', 'cancelled', 'completed'] }
          : selectedStatus;

      const parsedpatientId = new ObjectId(patientId);

      const [totalAppointments, totalAppointmentcount] = await Promise.all([
        this.appointmentModel
          .find({
            patientId: parsedpatientId,
            consultaionStatus: status,
          })
          .populate('slotId')
          .populate('doctorId')
          .populate('patientId')
          .skip(skip)
          .limit(limit)
          .exec(),
        this.appointmentModel.countDocuments({
          patientId: parsedpatientId,
          consultaionStatus: status,
        }),
      ]);

      // Calculate total pages
      const totalPages = Math.ceil(totalAppointmentcount / limit);

      return {
        totalAppointments,
        totalAppointmentcount,
        totalPages,
        currentPage,
      };
    } catch (error) {
      console.error('error', error);
      // Throw exception rather than returning it
      throw new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async getappointment(
    apmntId: string,
    userId: string,
  ): Promise<Appointment | InternalServerErrorException> {
    try {
      const parsedPatientId = new ObjectId(userId);
      const parsedappoinmentId = new ObjectId(apmntId);
      const result = await this.appointmentModel
        .findOne({
          patientId: parsedPatientId,
          _id: parsedappoinmentId,
        })
        .populate('doctorId')
        .populate('patientId')
        .populate('slotId');

      return result as Appointment;
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }

  async cancelAppointment(
    appointmentId: string,
    userId: string,
    reason: string,
  ): Promise<commonResponse | InternalServerErrorException> {
    try {
      const parsedAppointmentId = new ObjectId(appointmentId);
      const parsedUserId = new ObjectId(userId);

      // Find the appointment based on appointmentId and patientId
      const appointment = await this.appointmentModel
        .findOne({ _id: parsedAppointmentId, patientId: parsedUserId })
        .populate('doctorId')
        .exec();

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update appointment details to mark it as canceled
      appointment.isCancelledbypatient = true;
      appointment.cancellationReason = reason;
      appointment.consultaionStatus = 'cancelled';
      await appointment.save();

      // Check if the payment method is 'wallet' or 'razorpay'
      if (appointment.PaymentMethod === 'wallet') {
        // Find the user's wallet
        const wallet = await this.walletModel
          .findOne({ userId: parsedUserId })
          .exec();
        if (!wallet) {
          throw new Error('Wallet not found for the user');
        }

        // Find the transaction associated with the appointment
        const transaction = wallet.transactions.find(
          (trans) =>
            trans.appointmentId.toString() === parsedAppointmentId.toString(),
        );

        if (!transaction) {
          throw new Error('Transaction for appointment not found in wallet');
        }

        // Get the amount paid for the appointment from the existing transaction
        const paidAmount = transaction.amount;

        const refundAmount = paidAmount * 0.8;
        appointment.cancellationReason = reason;

        // Update wallet balance with the refund amount
        wallet.balance = wallet.balance + refundAmount;

        // Create a new refund transaction
        const newTransaction = {
          transactionId: new ObjectId(),
          amount: refundAmount,
          type: 'Credit' as const,
          description: `Refund for cancelled appointment`,
          appointmentId: parsedAppointmentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add the new refund transaction to the wallet's transactions
        wallet.transactions.push(newTransaction);

        // Save the updated wallet
        await wallet.save();
      } else if (appointment.PaymentMethod === 'razorpay') {
        let wallet = await this.walletModel
          .findOne({ userId: parsedUserId })
          .exec();
        if (!wallet) {
          wallet = new this.walletModel({
            userId: parsedUserId,
            balance: 0,
            transactions: [],
          });
        }

        // Calculate the refund amount (80% of appointment fee)
        const appointmentFee = appointment.totalAmount; // Assuming 'fee' is the paid amount
        const refundAmount = appointmentFee * 0.8;

        // Update the wallet balance
        wallet.balance += refundAmount;

        // Create a new transaction for the refund
        const newTransaction = {
          transactionId: new ObjectId(),
          amount: refundAmount,
          type: 'Credit' as const,
          description: `Refund for cancelled appointment (razorpay)`,
          appointmentId: parsedAppointmentId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Add the new transaction to the wallet's transactions
        wallet.transactions.push(newTransaction);

        // Save the updated wallet
        await wallet.save();
      }

      return {
        success: true,
        message:
          'Your refund for the cancellation will be credited to your wallet within 24 hours',
      };
    } catch (error) {
      console.error('Error during appointment cancellation:', error);
      return new InternalServerErrorException(
        'Internal Server Error. Try Again',
      );
    }
  }
}
