export interface User {
  id: number;
  name: string;
  email: string;
  token: string;
}

export interface LoginResponse {
    status: string;
    message: string;
    data: User & {
        accessToken: string;
    }|null
}