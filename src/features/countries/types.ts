


export interface Country {
  id: number;
  name: string;
  image: string;
  is_active: boolean;
}

export interface GetCountriesResponse {
  status: string;
  message: string;
  data: Country[];
}
