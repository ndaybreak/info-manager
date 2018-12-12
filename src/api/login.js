import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    name: username,
    password
  }
  return request({
    url: '/adminAccount/login',
    method: 'post',
    params: data
  })
}

export function logout(token) {
  return request({
    url: '/adminAccount/managementLoginOut',
    method: 'post',
    params: { token }
  })
}

export function getUserInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

