import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { AuthContextProps, IUserModel } from "./_models";
import * as authHelper from "./AuthHelpers";
import { getUserByToken, logoutUser } from "./_requests";
import { COMMON_MESSAGES, TOAST_POSITION } from "../../../shared/sharedConstant";

interface IWithChildren {
  children?: ReactNode;
}

const initAuthContextPropsState: AuthContextProps = {
  auth: authHelper.getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider: FC<IWithChildren> = ({ children }) => {
  const [auth, setAuth] = useState<string | undefined>(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState<IUserModel | undefined>();

  const saveAuth = (auth: string | undefined) => {
    setAuth(auth);
    if (auth) {
      authHelper.setAuth(auth);
    } else {
      authHelper.removeAuth();
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      return;
    } finally {
      saveAuth(undefined);
      setCurrentUser(undefined);
      toast.success(COMMON_MESSAGES.LOGGED_OUT, { position: TOAST_POSITION });
    }
  };

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthInit: FC<IWithChildren> = ({ children }) => {
  const { currentUser, saveAuth, setCurrentUser } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        let token: string | null | undefined = authHelper.getAuth();
        if (!token) {
          token = await authHelper.refreshAccessToken();
          if (token) {
            saveAuth(token);
          }
        }
        if (token && !currentUser) {
          const response = await getUserByToken();
          setCurrentUser(response?.data?.success);
        }
      } catch (error) {
        saveAuth(undefined);
      } finally {
        setShowSplashScreen(false);
      }
    };
    bootstrapAuth();
  }, []);

  if (showSplashScreen) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-success" role="status" />
      </div>
    );
  }
  return <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };
