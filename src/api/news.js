import request from '@/utils/request'
// module--快讯列表
// 列表
export function newsListFetchAll(query) {
  return request({
    url: '/managementSystem/queryNewsFlashNewsInfo',
    method: 'post',
    params: query
  })
}

// module--快讯列表
// 删除
export function newsListDelete(id) {
  return request({
    url: '/managementSystem/deleteNewsFlashNews',
    method: 'post',
    params: { id }
  })
}

// module--快讯详情
// 详情
export function newsDetailFetch(id) {
  return request({
    url: '/managementSystem/queryWebFlashNewsByid',
    method: 'post',
    params: { id }
  })
}

// module--快讯详情
// 新增
export function newsDetailCreate(query) {
  const para = {
    flashNewsList: [query]
  }
  return request({
    url: '/managementSystem/saveNewsCenterFlashNews',
    method: 'post',
    data: para
  })
}

// module--快讯详情
// 编辑
export function newsDetailUpdate(query) {
  const para = {
    flashNewsList: [query]
  }
  return request({
    url: '/managementSystem/updateFlashNewsInfo',
    method: 'post',
    data: para,
    params: {
      id: query.id
    }
  })
}
