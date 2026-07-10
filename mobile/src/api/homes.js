import axios from 'axios';

// Use 10.0.2.2 for Android emulator (maps to host machine localhost)
const API_BASE = 'http://10.0.2.2:3001/api';

const api = axios.create({ baseURL: API_BASE });

export const searchByZipcode = (zipcode) =>
  api.get(`/homes/zipcode/${zipcode}`);

export const searchByCityState = (city, state) =>
  api.get('/homes/search', { params: { city, state } });
