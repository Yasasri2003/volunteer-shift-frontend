// src/api/reports.js
import { apiRequest } from './client';

export const getDailyReport = (date, token) => apiRequest(`/reports/daily?date=${date}`, { token });
export const getMonthlyReport = (year, month, token) =>
  apiRequest(`/reports/monthly?year=${year}&month=${month}`, { token });
