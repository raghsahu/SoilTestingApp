
export interface CreateGroupInterface {
  _id: string;
  items: CreateGroupItems[];
}

export interface CreateGroupItems {
  group_id: number,
  user_id: any;
  group_name: string;
  create_time?: Date;
  update_time?: Date;
}

export interface CreateFarmsInterface {
  _id: string;
  items: CreateFarmsItems[];
}

export interface CreateFarmsItems {
  group_id: number,
  group_name: string,
  farm_id: number,
  sampleCount: number,
  farm_name: string,
  farm_field: string,
  farm_image?: string,
  user_id: any,
  create_time: Date,
  update_time?: Date;
}

export interface ReportByFarmInterface {
  _id: string;
  items: ReportByFarmItems[];
}

export interface ReportByFarmItems {
  report_id: number,
  group_id: number,
  group_name: string,
  farm_id: number,
  sampleCount: number,
  farm_name: string,
  farm_field: string,
  farm_image?: string,
  user_id: any,
  create_time: Date,
  update_time?: Date;

  temp: string,
  mois: string,
  ph: string,
  nitrogen: string,
  cond: string,
  phosphorus: string,
  potassium: string,
}