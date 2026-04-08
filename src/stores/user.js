import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const token = ref(localStorage.getItem('bi_token') || '')
    const isLoggedIn = ref(!!localStorage.getItem('bi_token'))

    const userRoles = computed(() => {
        return currentUser.value?.roles || []
    })

    const isAdmin = computed(() => {
        return userRoles.value.includes('admin') || userRoles.value.includes('super_admin')
    })

    const hasRole = (role) => {
        return userRoles.value.includes(role)
    }

    const hasAnyRole = (roles) => {
        return roles.some(role => userRoles.value.includes(role))
    }

    const hasPermission = (permission) => {
        const permissions = currentUser.value?.permissions || []
        return permissions.includes(permission)
    }

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
                    roles: ['admin', 'user'],
                    permissions: ['all']
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
        localStorage.setItem('bi_token', newToken)
        isLoggedIn.value = true
    }

    const logout = async () => {
        // TODO: 调用实际登出 API
        token.value = ''
        currentUser.value = null
        isLoggedIn.value = false
        localStorage.removeItem('bi_token')
        localStorage.removeItem('remembered_username')
    }

    return {
        currentUser,
        token,
        isLoggedIn,
        userRoles,
        isAdmin,
        hasRole,
        hasAnyRole,
        hasPermission,
        loadUserInfo,
        setToken,
        logout
    }
})
