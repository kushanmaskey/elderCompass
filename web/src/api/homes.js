import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

export function searchByZipcode(zipcode) {
  return api.get(`/homes/zipcode/${zipcode}`);
}

export function searchByCityState(city, state) {
  return api.get('/homes/search', { params: { city, state } });
}

export function getHomeById(id) {
  return api.get(`/homes/${id}`);
}
