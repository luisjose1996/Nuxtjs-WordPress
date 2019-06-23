import { UPDATE_GLOBAL_INFO, UPDATE_ERROR_MESSAGE } from './mutations-types'

export const state = () => ({
  info: {},
  menu: {},
  subMenu: {},
  errorInformation: {
    code: '',
    message: ''
  }
})

export const mutations = {
  [UPDATE_GLOBAL_INFO] (state, { info, menu, subMenu }) {
    state.info = info
    state.menu = menu
    state.subMenu = subMenu
  },

  [UPDATE_ERROR_MESSAGE] (state, data) {
    state.errorInformation = data
  }
}

export const actions = {
  // 获取公用信息
  async nuxtServerInit ({ commit }) {
    try {
      let { data: globalInfo } = await this.$axios.$get(`${process.env.baseUrl}/wp-json/xm-blog/v1/info`)
      let { data: menu } = await this.$axios.$get(`${process.env.baseUrl}/wp-json/xm-blog/v1/menu`)
      let result = {
        info: globalInfo,
        menu: menu.mainMenu,
        subMenu: menu.subMenu
      }
      commit(UPDATE_GLOBAL_INFO, result)
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // 上传图片
  async uploadImage ({ commit }, { requestData, config = {} }) {
    try {
      let { data } = await this.$axios.$post(`${process.env.baseUrl}/wp-content/themes/xm-vue-theme/xm_upload.php`, requestData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          progress: false
        },
        ...config
      })
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(error)
    }
  },

  // 删除图片
  async deleteImage ({ commit }, requestData) {
    try {
      let { data } = await this.$axios.$post(`${process.env.baseUrl}/wp-content/themes/xm-vue-theme/xm_upload.php`, requestData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          progress: false
        }
      })
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
