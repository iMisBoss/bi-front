import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const currentUser = ref(null)
    const token = ref(localStorage.getItem('bi_token') || '')
    const isLoggedIn = ref(!!localStorage.getItem('bi_token'))

    // 用户角色：'normal' 普通用户, 'admin' 系统管理员
    const userRole = ref(localStorage.getItem('bi_user_role') || 'normal')

    const userRoles = computed(() => {
        return currentUser.value?.roles || []
    })

    const isAdmin = computed(() => {
        return userRole.value === 'admin' || userRoles.value.includes('admin') || userRoles.value.includes('super_admin')
    })

    const hasRole = (role) => {
        return userRole.value === role || userRoles.value.includes(role)
    }

    const hasAnyRole = (roles) => {
        return roles.some(role => userRole.value === role || userRoles.value.includes(role))
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
            if (!currentUser.value) {
                // 根据角色设置不同的用户信息
                if (userRole.value === 'admin') {
                    currentUser.value = {
                        name: '系统管理员',
                        username: 'admin',
                        department: '科技部',
                        roles: ['admin', 'super_admin'],
                        permissions: ['all']
                    }
                } else {
                    currentUser.value = {
                        name: '张三',
                        username: 'zhangsan',
                        department: '人事部',
                        roles: ['user'],
                        permissions: ['read', 'write']
                    }
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

    const setUserRole = (role) => {
        userRole.value = role
        localStorage.setItem('bi_user_role', role)
    }

    const logout = async () => {
        token.value = ''
        currentUser.value = null
        isLoggedIn.value = false
        userRole.value = 'normal'
        localStorage.removeItem('bi_token')
        localStorage.removeItem('bi_user_role')
        localStorage.removeItem('remembered_username')
    }

    return {
        currentUser,
        token,
        isLoggedIn,
        userRole,
        userRoles,
        isAdmin,
        hasRole,
        hasAnyRole,
        hasPermission,
        loadUserInfo,
        setToken,
        setUserRole,
        logout
    }
})
