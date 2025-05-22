import axios from 'axios';
import { useAuth } from 'react-oidc-context';

const useAxios = () => {
  const auth = useAuth();
  const axiosInstance = axios.create();

  axiosInstance.interceptors.request.use(
    config => {
      const token = auth.user?.id_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default useAxios;
