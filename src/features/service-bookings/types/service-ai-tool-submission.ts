export interface ServiceAiToolSubmission {
  id: number;
  challenge: string;
  email: string;
  accepts_updates: boolean;
  status: string;
  created_at: string;
}

export interface ServiceAiToolSubmissionsListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ServiceAiToolSubmissionsResponse {
  status: string;
  message: string;
  data: {
    data: ServiceAiToolSubmission[];
    meta: ServiceAiToolSubmissionsListMeta;
  };
}

export interface ServiceAiToolSubmissionResponse {
  status: string;
  message: string;
  data: ServiceAiToolSubmission;
}
