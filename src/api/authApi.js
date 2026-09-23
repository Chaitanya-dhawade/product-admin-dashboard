import api from './axios'

/**
 * Log a user in.
 * @param {{ username: string, password: string }} credentials
 */
export function loginUser(credentials) {
  return api
    .post('/auth/login', {
      username: credentials.username,
      password: credentials.password,
      expiresInMins: 60,
    })
    .then((res) => res.data)
}
