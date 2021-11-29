import { ua } from '@xuanmo/javascript-utils'
import {
  SET_COMMENT_LIST,
  SET_COMMENT_TOTAL,
  UPDATE_COMMENT,
  SET_EXPRESSION,
  UPDATE_COMMENT_OPINION,
  RESET_COMMENT,
  SET_COMMENT_CURRENT_FORM_ID
} from './mutations-types'

export const state = () => ({
  commentList: [],
  totalPage: 0,
  expressionList: [],
  commentFormId: '0'
})

export const mutations = {
  [SET_COMMENT_LIST] (state, data) {
    state.commentList = [...state.commentList, ...data]
  },

  [RESET_COMMENT] (state) {
    state.commentList = []
    state.totalPage = 0
  },

  [SET_COMMENT_TOTAL] (state, n) {
    state.totalPage = n
  },

  [UPDATE_COMMENT] (state, data) {
    const newData = {
      ...data,
      userAgent: ua(data.ua)
    }
    if (data.parentId === '0') {
      state.commentList.unshift(newData)
    } else {
      let index = -1
      state.commentList.find((item, i) => {
        if (item.id === data.parentId) {
          index = i
          return true
        }
        return false
      })
      if (index >= 0) state.commentList[index].children.unshift(newData)
    }
  },

  [UPDATE_COMMENT_OPINION] (state, { id, data, parentId }) {
    if (parentId === '0') {
      const index = state.commentList.findIndex(item => item.id === id)
      if (index >= 0) state.commentList[index].opinion = data
    } else {
      state.commentList = state.commentList.map(item => {
        item.children = item.children.map(child => {
          if (child.id === id) child.opinion = data
          return child
        })
        return item
      })
    }
  },

  [SET_EXPRESSION] (state, data) {
    state.expressionList = data
  },

  [SET_COMMENT_CURRENT_FORM_ID](state, id) {
    state.commentFormId = id
  }
}

export const actions = {
  // 获取评论列表
  async getCommentList ({ commit }, requestData) {
    try {
      const {
        data,
        totalPage
      } = await this.$axios.$get(`${process.env.baseUrl}/wp-json/xm/v2/comment/list`, {
        params: requestData,
        data: { progress: false }
      })
      commit(SET_COMMENT_LIST, data.map(item => ({
        ...item,
        userAgent: ua(item.ua),
        children: item.children.map(child => ({
          ...child,
          userAgent: ua(child.ua)
        }))
      })))
      commit(SET_COMMENT_TOTAL, totalPage)
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // 提交评论
  async updateComment ({ commit }, requestData) {
    try {
      const { data } = await this.$axios.$post(`${process.env.baseUrl}/wp-json/wp/v2/comments`, requestData, {
        headers: {
          progress: false
        }
      })
      commit(UPDATE_COMMENT, data.newComment)
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // 获取表情列表
  async getExpression ({ commit, rootState }) {
    try {
      const { data } = await this.$axios.$get(`${rootState.info.templeteUrl}/expression.php`, {
        data: { progress: false }
      })
      commit(SET_EXPRESSION, data)
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // 评论列表点赞
  async updateCommentOpinion ({ commit }, requestData) {
    try {
      const { data } = await this.$axios.$post(`${process.env.baseUrl}/wp-json/xm-blog/v1/update-comment-meta`, requestData, {
        headers: {
          progress: false
        }
      })
      commit(UPDATE_COMMENT_OPINION, {
        id: requestData.id,
        parentId: requestData.parentId,
        data: data.data
      })
      return Promise.resolve(data.data)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
