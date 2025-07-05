import { IPagination } from "./app.interface";

export interface IBatche {
  approved_by: string;
  approved_date: number;
  batch_id: string;
  created_by: string;
  created_date: number;
  file_name: string;
  last_update_time: number;
  merchant_code: string;
  total_records: string;
  total_amount: string;
  transaction_date: number;
  status: number;
  remark: string;
}
export interface IResponePayroll {
  batches: IBatche[];
  pageable: IPagination;
}
export interface IUploadFilePayload {
  file: File;
  message: string;
  checksum: string;
}
