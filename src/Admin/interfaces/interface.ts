import { commonResponse } from 'src/Users/Interfaces/UserInterface';

export interface Category {
  _id: string;
  specialityName: string;
  specialityDescription: string;
  isListed: boolean;
}

export interface categoryResponse extends commonResponse {
  data?: Category;
}

export interface loadAllcategories {
  catogories: Category[];
  success?: boolean;
  message?: string;
}
