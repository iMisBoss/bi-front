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

    // ========== 工作台 ==========
    {
        path: '/process/approval/start',
        name: 'ProcessApprovalStart',
        component: () => import('@/views/process/approval/start/Index.vue')
    },
    {
        path: '/process/approval/detail',
        name: 'ProcessApprovalDetail',
        component: () => import('@/views/process/approval/Detail.vue')
    },
    {
        path: '/process/approval/todo',
        name: 'ProcessApprovalTodo',
        component: () => import('@/views/process/approval/todo/Index.vue')
    },
    {
        path: '/process/approval/done',
        name: 'ProcessApprovalDone',
        component: () => import('@/views/process/approval/done/Index.vue')
    },
    {
        path: '/process/approval/launched',
        name: 'ProcessApprovalLaunched',
        component: () => import('@/views/process/approval/launched/Index.vue')
    },
    {
        path: '/process/approval/cced',
        name: 'ProcessApprovalCced',
        component: () => import('@/views/process/approval/cced/Index.vue')
    },
    {
        path: '/process/approval/delegate',
        name: 'ProcessApprovalDelegate',
        component: () => import('@/views/process/approval/delegate/index.vue')
    },
    {
        path: '/process/approval/progress',
        name: 'ProcessApprovalProgress',
        component: () => import('@/views/process/approval/progress/Index.vue')
    },

    // ========== 流程中心 - 全局流程管理 ==========
    {
        path: '/process/approval/handle-query',
        name: 'ProcessApprovalHandleQuery',
        component: () => import('@/views/process/handle-query/Index.vue')
    },

    // ========== 流程中心 - 基础能力配置 ==========
    {
        path: '/process/design/business-object',
        name: 'ProcessDesignBusinessObject',
        component: () => import('@/views/process/design/business-object/Index.vue')
    },
    {
        path: '/process/design/auto-number',
        name: 'ProcessDesignAutoNumber',
        component: () => import('@/views/process/design/auto-number/Index.vue')
    },
    {
        path: '/process/design/approver-rules',
        name: 'ProcessDesignApproverRules',
        component: () => import('@/views/process/design/approver-rules/Index.vue')
    },
    {
        path: '/process/design/params',
        name: 'ProcessDesignParams',
        component: () => import('@/views/process/design/params/Index.vue')
    },
    {
        path: '/process/design/variables',
        name: 'ProcessDesignVariables',
        component: () => import('@/views/process/design/variables/Index.vue')
    },

    // ========== 流程中心 - 低代码表单设计器 ==========
    {
        path: '/process/design/form/design',
        name: 'ProcessDesignFormDesign',
        component: () => import('@/views/process/design/form/design/Index.vue')
    },
    {
        path: '/process/design/form/template',
        name: 'ProcessDesignFormTemplate',
        component: () => import('@/views/process/design/form/template/Index.vue')
    },
    {
        path: '/process/design/form/permission',
        name: 'ProcessDesignFormPermission',
        component: () => import('@/views/process/design/form/permission/Index.vue')
    },
    {
        path: '/process/design/form/linkage',
        name: 'ProcessDesignFormLinkage',
        component: () => import('@/views/process/design/form/linkage/Index.vue')
    },

    // ========== 流程中心 - Flowable 流程设计器 ==========
    {
        path: '/process/design/flowable/bpmn',
        name: 'ProcessDesignFlowableBpmn',
        component: () => import('@/views/process/design/flowable/bpmn/Index.vue')
    },
    {
        path: '/process/design/flowable/form-bind',
        name: 'ProcessDesignFlowableFormBind',
        component: () => import('@/views/process/design/flowable/form-bind/Index.vue')
    },
    {
        path: '/process/design/flowable/node-config',
        name: 'ProcessDesignFlowableNodeConfig',
        component: () => import('@/views/process/design/flowable/node-config/Index.vue')
    },
    {
        path: '/process/design/flowable/version',
        name: 'ProcessDesignFlowableVersion',
        component: () => import('@/views/process/design/flowable/version/Index.vue')
    },

    // ========== 流程中心 - 模板发布管理 ==========
    {
        path: '/process/design/template/process',
        name: 'ProcessDesignTemplateProcess',
        component: () => import('@/views/process/design/template/process/Index.vue')
    },
    {
        path: '/process/design/template/notification',
        name: 'ProcessDesignTemplateNotification',
        component: () => import('@/views/process/design/template/notification/Index.vue')
    },
    {
        path: '/process/design/template/opinion',
        name: 'ProcessDesignTemplateOpinion',
        component: () => import('@/views/process/design/template/opinion/Index.vue')
    },
    {
        path: '/process/design/template/print',
        name: 'ProcessDesignTemplatePrint',
        component: () => import('@/views/process/design/template/print/Index.vue')
    },

    // ========== 流程中心 - 流程监控与运维 ==========
    {
        path: '/process/monitor/instances',
        name: 'ProcessMonitorInstances',
        component: () => import('@/views/process/monitor/instances/Index.vue')
    },
    {
        path: '/process/monitor/tasks',
        name: 'ProcessMonitorTasks',
        component: () => import('@/views/process/monitor/tasks/Index.vue')
    },
    {
        path: '/process/monitor/proxy',
        name: 'ProcessMonitorProxy',
        component: () => import('@/views/process/monitor/proxy/Index.vue')
    },
    {
        path: '/process/monitor/urge',
        name: 'ProcessMonitorUrge',
        component: () => import('@/views/process/monitor/urge/Index.vue')
    },
    {
        path: '/process/monitor/logs',
        name: 'ProcessMonitorLogs',
        component: () => import('@/views/process/monitor/audit-logs/Index.vue')
    },
    {
        path: '/process/monitor/exceptions',
        name: 'ProcessMonitorExceptions',
        component: () => import('@/views/process/monitor/exceptions/Index.vue')
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
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 始终滚动到顶部
        return { top: 0 }
    }
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('bi_token')

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
