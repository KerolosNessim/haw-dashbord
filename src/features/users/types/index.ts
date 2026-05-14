export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  status: "active" | "suspended" | "banned";
  emailVerified: boolean;
  lastLoginAt: string | null;
  locale: string;
  timezone: string;
  preferences: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStatistics {
  total: number;
  active: number;
  suspended: number;
  banned: number;
}

export interface UsersResponse {
  status: string;
  message: string;
  data: {
    users: User[];
    statistics: UserStatistics;
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}
