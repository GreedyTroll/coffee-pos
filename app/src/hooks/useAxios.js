import axios from 'axios';

const useAxios = () => {
  const axiosInstance = axios.create();

  return axiosInstance;
};

export default useAxios;
