import axios from 'axios'

import { api } from '@client/utils/api'

export const SencoClient = axios.create({
  baseURL: api.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'Client-ID': import.meta.env.VITE_SENCO_API_CLIENT_ID || 'no-client-id',
  },
})

export const BackendClient = axios.create({
  baseURL: import.meta.env.VITE_FASTAPI_BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
})

BackendClient.interceptors.response.use(
  (response) => response, // simply return the response for successful requests
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a non-2xx status code
      const formattedError = {
        status: error.response.status,
        data: error.response.data.detail || 'An unknown error occurred',
        // other properties can be added as needed
      }
      return Promise.reject(formattedError)
    } else if (error.request) {
      // The request was made but no response was received
      return Promise.reject({ message: 'No response received from server' })
    } else {
      // Something happened in setting up the request
      return Promise.reject({ message: error.message })
    }
  },
)
