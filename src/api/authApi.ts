import { authService, type AuthSession } from "@/services/auth.service";

export type LoginResponse = AuthSession;

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return authService.login(email, password);
  },

  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<LoginResponse> {
    return authService.register(fullName, email, password);
  },
};
