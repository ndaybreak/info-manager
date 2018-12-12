import request from '@/utils/request'
import { kebabCaseData2Camel } from '@/utils'

// module--分类管理
// 列表
export function categoryFetchAll(query) {
  return request({
    url: '/managementSystem/admin/queryNewsCenterAfterEnd',
    method: 'post',
    params: query
  })
}

// module--分类管理
// 新增
export function categoryCreate(query) {
  return request({
    url: '/managementSystem/admin/saveNewsCenterCatelog',
    method: 'post',
    params: kebabCaseData2Camel(query)
  })
}

// module--分类管理
// 编辑
export function categoryUpdate(query) {
  return request({
    url: '/managementSystem/admin/updateNewsCatelogContentByid',
    method: 'post',
    params: kebabCaseData2Camel(query)
  })
}

// module--分类管理
// 删除
export function categoryDelete(id) {
  return request({
    url: '/managementSystem/admin/updateNewsCenterCatelogByid',
    method: 'post',
    params: { id }
  })
}

// module--新闻列表
// 列表
export function helpListFetchAll(query) {
  return request({
    url: '/managementSystem/admin/queryNewsCenterTitle',
    method: 'post',
    params: query
  })
}

// module--新闻列表
// 删除
export function helpListDelete(id) {
  return request({
    url: '/managementSystem/admin/updateNewsInfoTitleByid',
    method: 'post',
    params: { id }
  })
}

// module--新闻详情
// 详情
export function helpDetailFetch(id) {
  return request({
    url: '/managementSystem/admin/queryNewsCenterInfoTitleByid',
    method: 'post',
    params: { id }
  })
}

// module--新闻详情
// 新增
export function helpDetailCreate(query) {
  const para = {
    helpCenterList: [query]
  }
  return request({
    url: '/managementSystem/admin/saveNewsCenterInfoTitle',
    method: 'post',
    data: para
  })
}

// module--新闻详情
// 编辑
export function helpDetailUpdate(query) {
  const para = {
    helpCenterList: [query]
  }
  return request({
    url: '/managementSystem/admin/updateNewsCenterInfoTitleByid',
    method: 'post',
    data: para
  })
}

// module--模块列表
// 轮播图
export function bannerOperation(query) {
  const para = {
    id: parseInt(query.id),
    isBanner: query.isBanner,
    bannerUrl: query.bannerUrl
  }
  return request({
    url: '/managementSystem/admin/updateNewsCenterBannerImg',
    method: 'post',
    params: para
  })
}
// module--模块列表
// 推荐
export function recommendOperation(query) {
  return request({
    url: '/managementSystem/admin/updateNewsCenterRecommend',
    method: 'post',
    params: query
  })
}
