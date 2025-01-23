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

  return axiosInstance;
};

export default useAxios;
