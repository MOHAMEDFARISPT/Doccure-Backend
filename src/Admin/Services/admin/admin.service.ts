/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Admin, AdminDocument } from 'src/Admin/Schema/admin.schema';
import * as bcrypt from 'bcrypt';
import {
  combinedInterface,
  doctorrequestsResponseDto,
} from 'src/Doctors/interfaces/DoctorInterface';
import { ObjectId } from 'mongodb';

import { DoctorModel } from 'src/Doctors/schema/doctor.schema';
import { commonResponse, User } from 'src/Users/Interfaces/UserInterface';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import {
  speciality,
  specialityDocument,
} from 'src/Admin/Schema/speciality.schema';
import {
  Category,
  categoryResponse,
  DoctorRequest,
  fetchDoctorRequestOverview,
  loadAllcategories,
} from 'src/Admin/interfaces/interface';
import { ContactDocument } from 'src/Users/Schema/contactUs.schema';
import { Appointment } from 'src/Users/Schema/Appointment.Schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel('Appointment')
    private readonly appointmentModel: Model<Appointment>,
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Doctor') private DoctorModel: Model<DoctorModel>,
    @InjectModel(Admin.name) private AdminModel: Model<AdminDocument>,
    @InjectModel('contactForm')
    private contactFormModel: Model<ContactDocument>,
    @InjectModel(speciality.name)
    private SpecialityModel: Model<specialityDocument>,
    private mailService: MailService,
    private readonly _jwtService: JwtService,
  ) {}

  async ContactUsForm(value: {
    email: string;
    name: string;
    phone: string;
    message: string;
  }) {
    try {
      const { name, email, phone, message } = value;

      // Basic input validation
      if (!name || !email || !phone || !message) {
        return {
          success: false,
          message: 'All fields are required',
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Invalid email format',
        };
      }

      // Validate phone number (simple check, can be more advanced)
      const phoneRegex = /^[0-9]{10,15}$/;
      if (!phoneRegex.test(phone)) {
        return {
          success: false,
          message: 'Invalid phone number',
        };
      }

      // Create a new ContactForm document
      const newContactFormData = new this.contactFormModel({
        name,
        email,
        phoneNumber: phone,
        message,
      });

      // Save the document to the database
      await newContactFormData.save();

      // Success response
      return {
        success: true,
        message:
          'Your request has been submitted successfully. Our team will contact you as soon as possible.',
      };
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error saving contact form data:', error);

      // Return error response
      return {
        success: false,
        message:
          'An error occurred while submitting your request. Please try again later.',
      };
    }
  }

  async loginAdmin(value: { email: string; password: string }) {
    try {
      const { email, password } = value;

      const ExistingAdmin = await this.AdminModel.findOne({ email }).exec();
      if (ExistingAdmin) {
        const passwordMatch = await bcrypt.compare(
          password,
          ExistingAdmin.password,
        );
        if (passwordMatch) {
          const payload = {
            AdminId: ExistingAdmin._id,
            email: ExistingAdmin.email,
            role: 'Admin',
          };
          const Token = this._jwtService.sign(payload);
          return {
            Token: Token,
            success: true,
            message: 'Admin logged in SuccessFully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid Credentials',
          };
        }
      } else {
        return {
          success: false,
          message: 'Your Are not registered',
        };
      }
    } catch (error) {
      return new InternalServerErrorException();
    }
  }

  async fetchPatients(): Promise<User[] | InternalServerErrorException> {
    try {
      const result = await this.userModel.find();
      return result;
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }
  async fetchAllPatients(currentPage: number, limit: number) {
    try {
      const skip = (currentPage - 1) * limit;
      const result = await this.userModel.find().skip(skip).limit(limit).exec();
      const totalPatientsCount = await this.userModel.countDocuments();
      const totalPages = Math.ceil(totalPatientsCount / limit);
      return {
        result,
        totalPatientsCount,
        totalPages,
        currentPage,
      };
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }
  async getallDoctors(currentPage: number, limit: number) {
    try {
      const skip = (currentPage - 1) * limit;
      const Doctors = await this.DoctorModel.find()
        .skip(skip)
        .limit(limit)
        .exec();

      const totalDoctorsCount = await this.DoctorModel.countDocuments();
      const totalPages = Math.ceil(totalDoctorsCount / limit);
      return {
        Doctors,
        totalDoctorsCount,
        totalPages,
        currentPage,
      };
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async getDoctorRequests(): Promise<
    combinedInterface[] | InternalServerErrorException
  > {
    try {
      const doctorRequests = await this.DoctorModel.find({
        'personalDetails.isApproved': false,
      }).exec();

      if (doctorRequests && doctorRequests.length > 0) {
        return doctorRequests.map((doctor) => ({
          _id: doctor._id.toString(),
          personalDetails: {
            firstName: doctor.personalDetails.firstName,
            lastName: doctor.personalDetails.lastName,
            email: doctor.personalDetails.email,
            gender: doctor.personalDetails.gender,
            contactNumber: doctor.personalDetails.contactNumber,
            dateofBirth: doctor.personalDetails.dateofBirth,
            password: doctor.personalDetails.password,
            profileImage: doctor.personalDetails.profileImage,
            isApproved: doctor.personalDetails.isApproved,
            isBlocked: doctor.personalDetails.isBlocked,
            role: doctor.personalDetails.role,
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
        }));
      } else {
        return [];
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async getallAppointments(currentPage, limit) {
    try {
      const skip = (currentPage - 1) * limit;
      const appointments = await this.appointmentModel
        .find()
        .populate('patientId')
        .populate('doctorId')
        .populate('patientId')
        .populate('slotId')
        .skip(skip)
        .limit(limit)
        .exec();

      const totalAppointmentcount =
        await this.appointmentModel.countDocuments();
      const totalPages = Math.ceil(totalAppointmentcount / limit);
      return {
        appointments: appointments,
        totalAppointmentcount,
        totalPages,
        currentPage,
      };
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async acceptRequest(acceptRequestDto): Promise<doctorrequestsResponseDto> {
    try {
      const { id } = acceptRequestDto;

      console.log(id);
      const doctor = await this.DoctorModel.findById(id).exec();
      if (doctor) {
        console.log('doctor', doctor);
        doctor.personalDetails.isApproved = true;
        await doctor.save();

        const content =
          'Congratulations! Your request to Doccure Care Service is approved. You can now log in and start consultation.';
        await this.mailService.sendWelcomeEmail(
          doctor.personalDetails.email,
          doctor.personalDetails.lastName,
          content,
        );

        return {
          success: true,
          message: 'Request accepted successfully',
        };
      } else {
        return {
          success: false,
          message: 'Doctor not found in the database',
        };
      }
    } catch (error) {
      return new InternalServerErrorException(
        'Internal Server Error,Try Again',
      );
    }
  }

  async blockUser(DoctorId: string): Promise<commonResponse> {
    try {
      const doctor = await this.DoctorModel.findOne({ _id: DoctorId }).exec();

      if (!doctor) {
        throw new Error('Doctor not found');
      }
      doctor.personalDetails.isBlocked = !doctor.personalDetails.isBlocked;

      // Save the updated status
      await doctor.save();

      return {
        success: true,
        message: doctor.personalDetails.isBlocked
          ? 'Doctor has been blocked successfully'
          : 'Doctor has been unblocked successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error occurred while updating the block status',
      };
    }
  }

  async cancelRegistration(payload: { reason: string; DoctorId: string }) {
    try {
      const { reason, DoctorId } = payload;
      const ExistingDoctor = await this.DoctorModel.findOne({
        _id: DoctorId,
      }).exec();
      if (ExistingDoctor) {
        ExistingDoctor.personalDetails.regCancelreason = reason;
        ExistingDoctor.personalDetails.isRegcancelled = true;
      }

      await ExistingDoctor.save();
      return {
        success: true,
        message: `Registration For ${ExistingDoctor.personalDetails.firstName} ${ExistingDoctor.personalDetails.lastName} cancelled`,
      };
    } catch (error) {}
  }

  async blockPatient(patientId) {
    try {
      const ExistingPatient = await this.userModel
        .findOne({ _id: patientId })
        .exec();
      if (ExistingPatient) {
        ExistingPatient.isBlocked = !ExistingPatient.isBlocked;
        await ExistingPatient.save();
        return {
          success: true,
          message: ExistingPatient.isBlocked
            ? 'Patient has been blocked successfully'
            : 'Patient has been unblocked successfully',
        };
      } else {
        throw new Error('Patient not found');
      }
    } catch (error) {
      return {
        success: false,
        message: 'Error occurred while updating the block status',
      };
    }
  }

  async addSpeciality(
    specialityName: string,
    specialityDescription: string,
  ): Promise<categoryResponse> {
    try {
      const existingSpeciality = await this.SpecialityModel.findOne({
        specialityName: specialityName,
      }).exec();

      if (!existingSpeciality) {
        const newSpeciality = new this.SpecialityModel({
          specialityName: specialityName,
          specialityDescription: specialityDescription,
        });

        await newSpeciality.save();

        return {
          success: true,
          message: 'Speciality added successfully',
          data: {
            _id: newSpeciality._id.toString(),
            specialityName: newSpeciality.specialityName,
            specialityDescription: newSpeciality.specialityDescription,
            isListed: newSpeciality.isListed,
          },
        };
      } else {
        return {
          success: false,
          message: 'Speciality already exists',
        };
      }
    } catch (error) {
      console.error('Error adding speciality:', error);
      return {
        success: false,
        message: 'An error occurred while adding the speciality',
      };
    }
  }

  async Specialities(): Promise<loadAllcategories> {
    try {
      const specialities = await this.SpecialityModel.find().exec();

      // Check if specialities exist
      if (specialities && specialities.length > 0) {
        const categories: Category[] = specialities.map((category) => ({
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

  async fetchDoctorRequestOverview(): Promise<fetchDoctorRequestOverview> {
    try {
      const doctors = await this.DoctorModel.find({
        'personalDetails.isApproved': false,
      }).exec();
      console.log('doctors', doctors);

      if (doctors && doctors.length > 0) {
        const doctorRequests: DoctorRequest[] = doctors.map((doctor) => ({
          firstName: doctor.personalDetails.firstName,
          lastName: doctor.personalDetails.lastName,
          profileImage: doctor.personalDetails.profileImage,
          department: doctor.professionalDetails.specialisedDepartment,
          experience: doctor.professionalDetails.totalExperience,
        }));

        return {
          doctorRequests,
        };
      }

      // Return empty array if no doctors found
      return {
        doctorRequests: [],
      };
    } catch (error) {
      console.error('Error fetching doctor requests:', error);
      throw new Error('Failed to fetch doctor requests');
    }
  }

  async updateSpeciality(
    categoryName: string,
    categoryDescription: string,
    categoryId: string,
  ): Promise<commonResponse> {
    try {
      const parsedId = new ObjectId(categoryId);

      // Find the speciality by ID
      const speciality = await this.SpecialityModel.findById(parsedId);

      if (!speciality) {
        return {
          success: false,
          message: 'Speciality not found',
        };
      }

      // Update speciality details if provided
      // If categoryName is provided, update it, otherwise keep the existing value
      speciality.specialityName = categoryName || speciality.specialityName;

      // If categoryDescription is provided, update it, otherwise keep the existing value
      speciality.specialityDescription =
        categoryDescription || speciality.specialityDescription;

      // Save updated speciality
      await speciality.save();

      return {
        success: true,
        message: 'Speciality updated successfully',
      };
    } catch (error) {
      console.error('Error updating speciality:', error);
      return {
        success: false,
        message: 'An error occurred while updating the speciality',
      };
    }
  }

  async deleteSpecialisation(DepartmentId: string): Promise<commonResponse> {
    try {
      const parsedDepartmentId = new ObjectId(DepartmentId);
      const department = await this.SpecialityModel.findOneAndDelete({
        _id: parsedDepartmentId,
      });

      if (!department) {
        return {
          success: false,
          message: 'Department Not found',
        };
      }

      return {
        success: true,
        message: 'Department deleted successfully',
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async changeDepartmentStatus(departmentId: string): Promise<commonResponse> {
    try {
      const parsedDepartmentId = new ObjectId(departmentId);
      console.log(parsedDepartmentId);
      const department =
        await this.SpecialityModel.findOne(parsedDepartmentId).exec();
      if (department) {
        department.isListed = !department.isListed;
        await department.save();

        return {
          success: true,
          message: 'Department Status Changed',
        };
      } else {
        return {
          success: false,
          message: 'Department Not found',
        };
      }
    } catch (error) {}
  }
}
