import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // ───────── Auth ─────────

  signup(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth_signup/`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth_login/`, data);
  }

  // ───────── User ─────────

  getAllUsers(role?: string): Observable<any> {
    const query = role ? `?role=${role}` : '';
    return this.http.get(`${this.baseUrl}/user_get/${query}`);
  }

  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user_get/${userId}`);
  }

  addUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/user_create/`, data);
  }

  updateUser(userId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/user_update/${userId}`, data);
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user_delete/${userId}`);
  }

  // ───────── Property ─────────

  getAllProperties(queryString: string = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/property_get/${queryString}`);
  }

  getPropertyById(propertyId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/property_get/${propertyId}`);
  }

  addProperty(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/property_create/`, data);
  }

  updateProperty(propertyId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/property_update/${propertyId}`, data);
  }

  deleteProperty(propertyId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/property_delete/${propertyId}`);
  }

  // ───────── Enquiry ─────────

  getAllEnquiries(queryString: string = ''): Observable<any> {
    return this.http.get(`${this.baseUrl}/enquiry_get/${queryString}`);
  }

  getEnquiryById(enquiryId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/enquiry_get/${enquiryId}`);
  }

  addEnquiry(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/enquiry_create/`, data);
  }

  updateEnquiry(enquiryId: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/enquiry_update/${enquiryId}`, data);
  }

  deleteEnquiry(enquiryId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/enquiry_delete/${enquiryId}`);
  }
}
