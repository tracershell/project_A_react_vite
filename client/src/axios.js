// client/src/axios.js
import axios from 'axios';

axios.defaults.baseURL = '/api';
axios.defaults.withCredentials = true;

export default axios;
