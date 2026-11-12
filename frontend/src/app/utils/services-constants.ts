/****auth service*****/
export const LOGIN_URL = "/auth/signin";
export const SIGN_UP_USER_URL = "/auth/signup";
export const GET_NEW_ACCESS_TOKEN_URL = "/auth/getNewAccessToken";
export const LOGOUT_USER_URL = "/auth/logout";
export const GET_USER_PROFILE_URL = "/user/profile";

/****website service*****/
export const WEBSITE_URL = "/website";
export const getWebsiteUrl = (websiteId: string) => `/website/${websiteId}`;
export const getWebsiteStatsUrl = (websiteId: string) => `/website/${websiteId}/stats`;
export const getWebsiteIncidentsUrl = (websiteId: string) => `/website/${websiteId}/incidents`;

/****status page service*****/
export const getStatusPageUrl = (slug: string) => `/status/${slug}`;
