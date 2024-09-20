import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';
import { environment } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'auth-token';

  constructor(private http: HttpClient) {}

  async login(email: string, password: string) {
    const body = { email, password };

    try {
      const response: any = await firstValueFrom(this.http.post(`${this.apiUrl}/auth/login`, body));

      await SecureStoragePlugin.set({ key: this.tokenKey, value: response.data.token.value });

      return response.data.user;
    } catch (error) {
      throw new Error('Login failed');
    }
  }

  async logout() {
    const token = await this.getToken();

    if (!token) {
      throw new Error('No token found, user might not be logged in');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    try {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/auth/logout`, { headers }));

      await SecureStoragePlugin.remove({ key: this.tokenKey });
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    if (!token) return false;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    try {
      await firstValueFrom(this.http.get(`${this.apiUrl}/auth/me`, { headers }));
      return true;
    } catch (error) {
      return false;
    }
  }

  async clearToken(): Promise<void> {
    await SecureStoragePlugin.remove({ key: this.tokenKey });
  }

  async getToken(): Promise<string | null> {
    const result = await SecureStoragePlugin.get({ key: this.tokenKey });
    return result.value;
  }
}
