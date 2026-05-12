



export type CountryName = {
  ar: string;
  en: string;
}

export type Country = {
  id: number;
  name: CountryName;
  image: string;
  is_active: boolean;
}

export type GetCountriesResponse = {
  status: string;
  message: string;
  data: Country[];
}


