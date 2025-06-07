import { IPagination } from "./app.interface";

export interface IFilterVADetail {
  pagination?: IPagination;
}

export interface IResVaDetail {
  id: string;
  va_account_no: string;
  va_account_type_code: string;
  va_account_name: string;
  merchant_code: string;
  map_id: string;
  map_type: string;
  status: number;
  bank_code: string | undefined;
  available_balance: number;
  match_amount: number;
  max_amount: number;
  min_amount: number;
  opening_date: number;
  qr_code_image: string;
  created_date: number;
  created_by: string;
  last_update_time: number;
  updated_by: string;
  cashins?: ICashin[];
  bank_name?: string;
  bank_logo?: string;
  pageable: IPagination
}

interface ICashin {
  va_trans_id: string;
  merchant_code: string;
  order_ref_id: string;
  va_account_no: string;
  balance_change_time: string;
  bank_trans_id: string;
  transaction_amt: number;
  description: string;
  created_date: string;
  last_update_time?: string;
  merchant_id?: string;
  va_account_name?: string;
  map_id?: string;
  bank_code?: string;
  updated_by?: string;
}

