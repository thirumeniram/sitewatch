import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";
import { get } from "./_requests";
import { ISignInData } from "./_models";
import { IResponse } from "../../../utils/Utils";
import {
  GET_NEW_ACCESS_TOKEN_URL,
  LOGIN_URL,
  LOGOUT_USER_URL,
  SIGN_UP_USER_URL,
} from "../../../utils/services-constants";
import {
  APP_PUBLIC_ROUTES,
  COMMON_MESSAGES,
  TOAST_POSITION,
} from "../../../shared/sharedConstant";

const AUTH_SESSION_STORAGE_KEY = import.meta.env.VITE_AUTH_SESSION_STORAGE_KEY;
const UNAUTHORIZED_STATUS = 401;
const LOGIN_REDIRECT_DELAY_MS = 300;
const URLS_WITHOUT_TOKEN_REFRESH = [
  GET_NEW_ACCESS_TOKEN_URL,
  LOGIN_URL,
  LOGOUT_USER_URL,
  SIGN_UP_USER_URL,
];

interface IRetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshRequest: Promise<string | null> | null = null;

const getAuth = (): string | undefined => {
  if (!sessionStorage) {
    return undefined;
  }
  const access_token = sessionStorage.getItem(AUTH_SESSION_STORAGE_KEY);
  return access_token || undefined;
};

const setAuth = (auth: string) => {
  if (!sessionStorage) return;
  sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, auth);
};

const removeAuth = () => {
  if (!sessionStorage) return;
  sessionStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
};

const requestNewAccessToken = async (): Promise<string | null> => {
  try {
    const res = await get<ISignInData>(GET_NEW_ACCESS_TOKEN_URL);
    const newAccessToken = res?.data?.success?.access_token;
    if (newAccessToken) {
      setAuth(newAccessToken);
      return newAccessToken;
    }
    return null;
  } catch (error) {
    return null;
  } finally {
    refreshRequest = null;
  }
};

export const refreshAccessToken = (): Promise<string | null> => {
  refreshRequest = refreshRequest ?? requestNewAccessToken();
  return refreshRequest;
};

export function setupAxios(axios: AxiosInstance) {
  axios.defaults.headers.common.Accept = "application/json";
  axios.defaults.withCredentials = true;
  axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const auth = getAuth();
    if (auth) {
      config.headers.Authorization = `Bearer ${auth}`;
    }
    config.withCredentials = true;
    return config;
  });
  axios.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<IResponse<unknown>>) => {
      const response = error?.response;
      const originalRequest = error?.config as IRetryRequestConfig | undefined;
      const requestUrl = originalRequest?.url ?? "";
      if (!response) {
        toast.error(COMMON_MESSAGES.NETWORK_ERROR, { position: TOAST_POSITION });
        return Promise.reject(error);
      }
      const canRefreshToken = !URLS_WITHOUT_TOKEN_REFRESH.some((url) => requestUrl.includes(url));
      if (
        response.status === UNAUTHORIZED_STATUS &&
        originalRequest &&
        canRefreshToken &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;
        const newToken = await refreshAccessToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        }
        removeAuth();
        toast.error(COMMON_MESSAGES.SESSION_EXPIRED, { position: TOAST_POSITION });
        setTimeout(() => {
          window.location.href = APP_PUBLIC_ROUTES.AUTH_LOGIN;
        }, LOGIN_REDIRECT_DELAY_MS);
        return Promise.reject(error);
      }
      if (!requestUrl.includes(GET_NEW_ACCESS_TOKEN_URL)) {
        toast.error(response?.data?.message || COMMON_MESSAGES.SOMETHING_WENT_WRONG, {
          position: TOAST_POSITION,
        });
      }
      return Promise.reject(error);
    },
  );
}

export { getAuth, setAuth, removeAuth, AUTH_SESSION_STORAGE_KEY };
