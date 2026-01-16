import axios from 'axios';

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // 401: no auth, 419: csrf/session expired, 403: forbidden (roles)
    if ([403].includes(status)) {
      // Evita loops si ya estás en login
    }

    return Promise.reject(error);
  }
);