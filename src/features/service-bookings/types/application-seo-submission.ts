export interface ApplicationSeoSubmission {
  id: number;
  service_id: number;
  service_title: string;
  website_url: string;
  email: string;
  consent: boolean;
  status: string;
  created_at: string;
}

export interface ApplicationSeoSubmissionsListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApplicationSeoSubmissionsResponse {
  status: string;
  message: string;
  data: {
    data: ApplicationSeoSubmission[];
    meta: ApplicationSeoSubmissionsListMeta;
  };
}
