// http.service.ts

import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class HttpService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create();
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(
        url,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(`HTTP GET request failed: ${error.message}`);
    }
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(`HTTP POST request failed: ${error.message}`);
    }
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put(
        url,
        data,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(`HTTP PUT request failed: ${error.message}`);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete(
        url,
        config
      );
      return response.data;
    } catch (error) {
      throw new Error(`HTTP DELETE request failed: ${error.message}`);
    }
  }
}
