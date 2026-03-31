import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const token = ref(localStorage.getItem('o2_token') || '')
    const isLoggedIn = ref(!!localStorage.getItem('o2_token'))

    const loadUserInfo = async () => {
        if (!token.value) {
            isLoggedIn.value = false
            return
        }

        try {
            // // 调用现有 API 获取用户信息
            // const response = await fetch('/x_desktop/jaxrs/user/current', {
            //     headers: {
            //         'Authorization': `Bearer ${token.value}`
            //     }
            // })

            // if (response.ok) {
            //     currentUser.value = await response.json()
            //     isLoggedIn.value = true
            // }

            // 模拟用户信息（从 token 中解析或默认）
            if (!currentUser.value) {
                currentUser.value = {
                    name: '管理员',
                    username: 'admin',
                    department: '科技部',
                    role: 'admin'
                }
            }
            isLoggedIn.value = true
        } catch (error) {
            console.error('加载用户信息失败:', error)
            isLoggedIn.value = false
            currentUser.value = null
        }
    }

    const setToken = (newToken) => {
        token.value = newToken
        localStorage.setItem('o2_token', newToken)
        isLoggedIn.value = true
    }

    const logout = async () => {
        // TODO: 调用实际登出 API
        token.value = ''
        currentUser.value = null
        isLoggedIn.value = false
        localStorage.removeItem('o2_token')
        localStorage.removeItem('remembered_username')
    }

    return {
        currentUser,
        token,
        isLoggedIn,
        loadUserInfo,
        setToken,
        logout
    }
})
