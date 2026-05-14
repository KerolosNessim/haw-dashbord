export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

export interface ContactSubmissionsResponse {
  status: string;
  message: string;
  data: {
    data: ContactSubmission[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}
