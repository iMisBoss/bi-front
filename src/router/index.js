import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: true }
    },

    // ========== 组织人事管理 ==========
    {
        path: '/org/staff',
        name: 'OrgStaff',
        component: () => import('@/views/org/Staff.vue')
    },
    {
        path: '/org/department',
        name: 'OrgDepartment',
        component: () => import('@/views/org/Department.vue')
    },
    {
        path: '/org/position',
        name: 'OrgPosition',
        component: () => import('@/views/org/Position.vue')
    },
    {
        path: '/org/role',
        name: 'OrgRole',
        component: () => import('@/views/org/Role.vue')
    },
    {
        path: '/org/level',
        name: 'OrgLevel',
        component: () => import('@/views/org/Level.vue')
    },
    {
        path: '/org/employee',
        name: 'OrgEmployee',
        component: () => import('@/views/org/Employee.vue')
    },

    // ========== 流程审批中心 ==========
    {
        path: '/process/designer',
        name: 'ProcessDesigner',
        component: () => import('@/views/process/ProcessDesigner.vue')
    },
    {
        path: '/process/form',
        name: 'ProcessForm',
        component: () => import('@/views/process/FormDesigner.vue')
    },
    {
        path: '/process/todo',
        name: 'ProcessTodo',
        component: () => import('@/views/process/Todo.vue')
    },
    {
        path: '/process/done',
        name: 'ProcessDone',
        component: () => import('@/views/process/Done.vue')
    },
    {
        path: '/process/monitor',
        name: 'ProcessMonitor',
        component: () => import('@/views/process/Monitor.vue')
    },
    {
        path: '/process/supervise',
        name: 'ProcessSupervise',
        component: () => import('@/views/process/Supervise.vue')
    },

    // ========== 内容管理中心 ==========
    {
        path: '/cms/news',
        name: 'CmsNews',
        component: () => import('@/views/cms/News.vue')
    },
    {
        path: '/cms/document',
        name: 'CmsDocument',
        component: () => import('@/views/cms/Document.vue')
    },
    {
        path: '/cms/knowledge',
        name: 'CmsKnowledge',
        component: () => import('@/views/cms/Knowledge.vue')
    },
    {
        path: '/cms/archive-library',
        name: 'CmsArchiveLibrary',
        component: () => import('@/views/cms/ArchiveLibrary.vue')
    },
    {
        path: '/cms/regulation',
        name: 'CmsRegulation',
        component: () => import('@/views/cms/Regulation.vue')
    },
    {
        path: '/cms/culture',
        name: 'CmsCulture',
        component: () => import('@/views/cms/Culture.vue')
    },

    // ========== 日常办公 ==========
    {
        path: '/office/attendance',
        name: 'OfficeAttendance',
        component: () => import('@/views/office/Attendance.vue')
    },
    {
        path: '/office/leave',
        name: 'OfficeLeave',
        component: () => import('@/views/office/Leave.vue')
    },
    {
        path: '/office/meeting',
        name: 'OfficeMeeting',
        component: () => import('@/views/office/Meeting.vue')
    },
    {
        path: '/office/vehicle',
        name: 'OfficeVehicle',
        component: () => import('@/views/office/Vehicle.vue')
    },
    {
        path: '/office/supplies',
        name: 'OfficeSupplies',
        component: () => import('@/views/office/Supplies.vue')
    },
    {
        path: '/office/seal',
        name: 'OfficeSeal',
        component: () => import('@/views/office/Seal.vue')
    },

    // ========== AI 智能助手 ==========
    {
        path: '/ai/qa',
        name: 'AIQA',
        component: () => import('@/views/ai/QA.vue')
    },
    {
        path: '/ai/writing',
        name: 'AIWriting',
        component: () => import('@/views/ai/Writing.vue')
    },
    {
        path: '/ai/summary',
        name: 'AISummary',
        component: () => import('@/views/ai/Summary.vue')
    },
    {
        path: '/ai/meeting',
        name: 'AIMeeting',
        component: () => import('@/views/ai/MeetingMinutes.vue')
    },

    // ========== 消息中心 ==========
    {
        path: '/message/station',
        name: 'MessageStation',
        component: () => import('@/views/message/Station.vue')
    },
    {
        path: '/message/sms',
        name: 'MessageSMS',
        component: () => import('@/views/message/SMS.vue')
    },
    {
        path: '/message/email',
        name: 'MessageEmail',
        component: () => import('@/views/message/Email.vue')
    },
    {
        path: '/message/remind',
        name: 'MessageRemind',
        component: () => import('@/views/message/Remind.vue')
    },

    // ========== 系统管理 ==========
    {
        path: '/system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/Config.vue')
    },
    {
        path: '/system/log',
        name: 'SystemLog',
        component: () => import('@/views/system/Log.vue')
    },
    {
        path: '/system/backup',
        name: 'SystemBackup',
        component: () => import('@/views/system/Backup.vue')
    },
    {
        path: '/system/version',
        name: 'SystemVersion',
        component: () => import('@/views/system/Version.vue')
    },

    // ========== 移动端 ==========
    {
        path: '/mobile/integration',
        name: 'MobileIntegration',
        component: () => import('@/views/mobile/Integration.vue')
    },
    {
        path: '/mobile/approval',
        name: 'MobileApproval',
        component: () => import('@/views/mobile/MobileApproval.vue')
    },
    {
        path: '/mobile/attendance',
        name: 'MobileAttendance',
        component: () => import('@/views/mobile/MobileAttendance.vue')
    },
    {
        path: '/mobile/push',
        name: 'MobilePush',
        component: () => import('@/views/mobile/MobilePush.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('o2_token')

    // 如果访问的是登录页
    if (to.path === '/login') {
        if (token) {
            // 已登录，跳转到首页
            next('/')
        } else {
            // 未登录，显示登录页
            next()
        }
    } else {
        // 访问其他页面
        if (!token) {
            // 未登录，重定向到登录页
            next('/login')
        } else {
            // 已登录，继续访问
            next()
        }
    }
})

export default router
