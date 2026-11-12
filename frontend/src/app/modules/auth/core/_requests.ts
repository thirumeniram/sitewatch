import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { IEmail, ISignInData, IUserModel } from "./_models";
import { IResponse } from "../../../utils/Utils";
import {
  GET_USER_PROFILE_URL,
  LOGIN_URL,
  LOGOUT_USER_URL,
  SIGN_UP_USER_URL,
} from "../../../utils/services-constants";

const API_URL = import.meta.env.VITE_APP_API_URL;

export const post = async <T>(
  url: string,
  data: AxiosRequestConfig["data"] = {},
  config: AxiosRequestConfig = {},
): Promise<IResponse<T>> => {
  const response: AxiosResponse<IResponse<T>> = await axios.post(API_URL + url, data, {
    withCredentials: true,
    ...config,
  });
  return response.data;
};

export const get = async <T>(
  url: string,
  params: AxiosRequestConfig["params"] = {},
  config: AxiosRequestConfig = {},
): Promise<IResponse<T>> => {
  const response: AxiosResponse<IResponse<T>> = await axios.get(API_URL + url, {
    params,
    withCredentials: true,
    ...config,
  });
  return response.data;
};

export const patch = async <T>(
  url: string,
  data: AxiosRequestConfig["data"] = {},
  config: AxiosRequestConfig = {},
): Promise<IResponse<T>> => {
  const response: AxiosResponse<IResponse<T>> = await axios.patch(API_URL + url, data, {
    withCredentials: true,
    ...config,
  });
  return response.data;
};

export const remove = async <T>(
  url: string,
  config: AxiosRequestConfig = {},
): Promise<IResponse<T>> => {
  const response: AxiosResponse<IResponse<T>> = await axios.delete(API_URL + url, {
    withCredentials: true,
    ...config,
  });
  return response.data;
};

export function login(email: string, password: string) {
  return post<ISignInData>(LOGIN_URL, { email, password });
}

export function register(email: string, password: string) {
  return post<IEmail>(SIGN_UP_USER_URL, { email, password });
}

export function getUserByToken() {
  return get<IUserModel>(GET_USER_PROFILE_URL);
}

export function logoutUser() {
  return post<string>(LOGOUT_USER_URL);
}
