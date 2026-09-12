import { useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useAuthContext from "./useAuthContext";
import { getApiBaseUrl } from "../utils/apiConfig";
// Same module the server imports, so the code string cannot drift between them.
import { AUTH_CODES } from "../../shared/authCodes.js";

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logOut, refreshAccessToken, getAccessToken } = useAuthContext();

  const axiosSecure = useMemo(() => {
    const instance = axios.create({
      baseURL: getApiBaseUrl(),
    });

    // ─── Request interceptor: attach access token ──────────────────────────
    instance.interceptors.request.use(
      (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // ─── Response interceptor: handle 401 with silent refresh ──────────────
    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 and we haven't retried yet, try refreshing the token
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          error.response?.data?.code === AUTH_CODES.TOKEN_EXPIRED
        ) {
          originalRequest._retry = true;

          try {
            const newToken = await refreshAccessToken();
            if (newToken) {
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              return instance(originalRequest);
            }
          } catch {
            // Refresh failed
          }

          // Refresh failed — the session is genuinely over. Say so on the sign-in
          // page rather than bouncing the user there unexplained, which reads as
          // the app losing their work at random.
          await logOut();
          navigate("/login?reason=session-expired", { replace: true });
          return Promise.reject(error);
        }

        // 403 Forbidden — permitted to be here, not permitted to do this.
        if (error.response?.status === 403) {
          navigate("/403", { replace: true });
          return Promise.reject(error);
        }

        // Any other 401 (invalid or revoked token, not merely expired)
        if (error.response?.status === 401) {
          await logOut();
          navigate("/login?reason=session-expired", { replace: true });
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return instance;
  }, [logOut, refreshAccessToken, getAccessToken, navigate]);

  return [axiosSecure];
};

export default useAxiosSecure;
