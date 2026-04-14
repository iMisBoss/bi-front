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
    {
        path: '/Empty',
        name: 'Empty',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/admin/home',
        name: 'AdminHome',
        component: () => import('@/views/admin/Home.vue'),
        meta: { requiresAuth: true, title: '后台管理首页' }
    },

    // ========== 流程前端（审批相关） ==========
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
        path: '/process/approval/start',
        name: 'ProcessApprovalStart',
        component: () => import('@/views/process/approval/start/Index.vue')
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
    {
        path: '/process/approval/archive',
        name: 'ProcessApprovalArchive',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/approval/message',
        name: 'ProcessApprovalMessage',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/approval/my-schedule',
        name: 'ProcessApprovalMySchedule',
        component: () => import('@/views/process/approval/my-schedule/Index.vue')
    },

    // ========== 流程后端（设计建模） ==========
    {
        path: '/process/flowable/bpmn',
        name: 'ProcessFlowableBpmn',
        component: () => import('@/views/process/flowable/bpmn/Index.vue')
    },
    {
        path: '/process/flowable/version',
        name: 'ProcessFlowableVersion',
        component: () => import('@/views/process/flowable/version/Index.vue')
    },
    {
        path: '/process/flowable/categories',
        name: 'ProcessFlowableCategories',
        component: () => import('@/views/process/flowable/categories/Index.vue')
    },
    {
        path: '/process/flowable/params',
        name: 'ProcessFlowableParams',
        component: () => import('@/views/process/flowable/params/Index.vue')
    },
    {
        path: '/process/flowable/variables',
        name: 'ProcessFlowableVariables',
        component: () => import('@/views/process/flowable/variables/Index.vue')
    },
    {
        path: '/process/flowable/data-resources',
        name: 'ProcessFlowableDataResources',
        component: () => import('@/views/process/flowable/data-resources/Index.vue')
    },
    {
        path: '/process/flowable/handle-query',
        name: 'ProcessFlowableHandleQuery',
        component: () => import('@/views/process/flowable/handle-query/Index.vue')
    },
    {
        path: '/process/flowable/delegate-control',
        name: 'ProcessFlowableDelegateControl',
        component: () => import('@/views/process/flowable/delegate-control/Index.vue')
    },

    // ========== 表单中心 ==========
    {
        path: '/form/design',
        name: 'FormDesign',
        component: () => import('@/views/form/design/Index.vue')
    },
    {
        path: '/form/management',
        name: 'FormManagement',
        component: () => import('@/views/form/management/Index.vue')
    },
    {
        path: '/form/business-object',
        name: 'FormBusinessObject',
        component: () => import('@/views/form/business-object/Index.vue')
    },
    {
        path: '/form/auto-number',
        name: 'FormAutoNumber',
        component: () => import('@/views/form/auto-number/Index.vue')
    },

    // ========== 门户中心 ==========
    {
        path: '/portal/designer',
        name: 'PortalDesigner',
        component: () => import('@/views/portal/designer/Index.vue')
    },
    {
        path: '/portal/management',
        name: 'PortalManagement',
        component: () => import('@/views/portal/management/Index.vue')
    },
    {
        path: '/portal/categories',
        name: 'PortalCategories',
        component: () => import('@/views/portal/categories/Index.vue')
    },
    {
        path: '/portal/components-lib',
        name: 'PortalComponentsLib',
        component: () => import('@/views/portal/components-lib/Index.vue')
    },
    {
        path: '/portal/user-rules',
        name: 'PortalUserRules',
        component: () => import('@/views/portal/user-rules/Index.vue')
    },
    {
        path: '/portal/global-config',
        name: 'PortalGlobalConfig',
        component: () => import('@/views/portal/global-config/Index.vue')
    },

    // ========== 组织人事管理（后台） ==========
    {
        path: '/office/org/admin/structure',
        name: 'OfficeOrgAdminStructure',
        component: () => import('@/views/office/org/admin/structure/Index.vue')
    },
    {
        path: '/office/org/admin/position',
        name: 'OfficeOrgAdminPosition',
        component: () => import('@/views/office/org/admin/position/Index.vue')
    },
    {
        path: '/office/org/admin/users',
        name: 'OfficeOrgAdminUsers',
        component: () => import('@/views/office/org/admin/users/Index.vue')
    },
    {
        path: '/office/org/admin/contacts',
        name: 'OfficeOrgAdminContacts',
        component: () => import('@/views/office/org/admin/contacts/Index.vue')
    },
    {
        path: '/office/org/admin/security',
        name: 'OfficeOrgAdminSecurity',
        component: () => import('@/views/office/org/admin/security/Index.vue')
    },
    {
        path: '/office/org/admin/groups',
        name: 'OfficeOrgAdminGroups',
        component: () => import('@/views/office/org/admin/groups/Index.vue')
    },

    // ========== 组织通讯录（前台） ==========
    {
        path: '/office/org/contacts/employee',
        name: 'OfficeOrgContactsEmployee',
        component: () => import('@/views/office/org/contacts/employee/Index.vue')
    },
    {
        path: '/office/org/contacts/favorites',
        name: 'OfficeOrgContactsFavorites',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/org/contacts/external',
        name: 'OfficeOrgContactsExternal',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/org/contacts/my-card',
        name: 'OfficeOrgContactsMyCard',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 日常办公 ==========
    {
        path: '/office/meeting/my-meetings',
        name: 'OfficeMeetingMyMeetings',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/create',
        name: 'OfficeMeetingCreate',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/room-booking',
        name: 'OfficeMeetingRoomBooking',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/notifications',
        name: 'OfficeMeetingNotifications',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/minutes',
        name: 'OfficeMeetingMinutes',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/statistics',
        name: 'OfficeMeetingStatistics',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting-admin',
        name: 'OfficeMeetingAdmin',
        component: () => import('@/views/office/meeting-admin/Index.vue')
    },
    {
        path: '/office/reports',
        name: 'OfficeReports',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 公文与内容管理 ==========
    {
        path: '/cms/news',
        name: 'CmsNews',
        component: () => import('@/views/cms/news/Index.vue')
    },
    {
        path: '/cms/regulation',
        name: 'CmsRegulation',
        component: () => import('@/views/cms/regulation/Index.vue')
    },
    {
        path: '/cms/knowledge',
        name: 'CmsKnowledge',
        component: () => import('@/views/cms/knowledge/Index.vue')
    },
    {
        path: '/cms/archive-library',
        name: 'CmsArchiveLibrary',
        component: () => import('@/views/cms/archive-library/Index.vue')
    },
    {
        path: '/cms/document/personal',
        name: 'CmsDocumentPersonal',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/send-receive',
        name: 'CmsDocumentSendReceive',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/circulation',
        name: 'CmsDocumentCirculation',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/query-archive',
        name: 'CmsDocumentQueryArchive',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/document-number',
        name: 'CmsDocumentNumber',
        component: () => import('@/views/Empty.vue')
    },
    // ========== 公文管理（管理员后台） ==========
    {
        path: '/cms/document-admin/templates',
        name: 'CmsDocumentAdminTemplates',
        component: () => import('@/views/cms/document-admin/templates/Index.vue')
    },
    {
        path: '/cms/document-admin/numbers',
        name: 'CmsDocumentAdminNumbers',
        component: () => import('@/views/cms/document-admin/numbers/Index.vue')
    },
    {
        path: '/cms/document-admin/workflow',
        name: 'CmsDocumentAdminWorkflow',
        component: () => import('@/views/cms/document-admin/workflow/Index.vue')
    },
    {
        path: '/cms/document-admin/security',
        name: 'CmsDocumentAdminSecurity',
        component: () => import('@/views/cms/document-admin/security/Index.vue')
    },
    {
        path: '/cms/document-admin/archive',
        name: 'CmsDocumentAdminArchive',
        component: () => import('@/views/cms/document-admin/archive/Index.vue')
    },
    // ========== 内容管理中心（管理员后台） ==========
    {
        path: '/cms/content-admin',
        name: 'CmsContentAdmin',
        component: () => import('@/views/cms/content-admin/Index.vue')
    },

    // ========== AI 智能助手 ==========
    {
        path: '/ai/qa',
        name: 'AIQA',
        component: () => import('@/views/ai/application/qa/Index.vue')
    },
    {
        path: '/ai/writing',
        name: 'AIWriting',
        component: () => import('@/views/ai/application/writing/Index.vue')
    },
    {
        path: '/ai/summary',
        name: 'AISummary',
        component: () => import('@/views/ai/application/summary/Index.vue')
    },
    {
        path: '/ai/meeting',
        name: 'AIMeeting',
        component: () => import('@/views/ai/application/meeting-minutes/Index.vue')
    },
    {
        path: '/ai/admin',
        name: 'AIAdmin',
        component: () => import('@/views/ai/admin/Index.vue')
    },

    // ========== 消息中心 ==========
    {
        path: '/message/email',
        name: 'MessageEmail',
        component: () => import('@/views/message/email/Index.vue')
    },
    {
        path: '/message/email-admin',
        name: 'MessageEmailAdmin',
        component: () => import('@/views/message/email-admin/Index.vue')
    },
    {
        path: '/message/station',
        name: 'MessageStation',
        component: () => import('@/views/message/station/Index.vue')
    },

    // ========== 个人中心 ==========
    {
        path: '/personal/info',
        name: 'PersonalInfo',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/security/password',
        name: 'PersonalSecurityPassword',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/security/phone',
        name: 'PersonalSecurityPhone',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/security/devices',
        name: 'PersonalSecurityDevices',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/security/login-log',
        name: 'PersonalSecurityLoginLog',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/security/settings',
        name: 'PersonalSecuritySettings',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/favorites',
        name: 'PersonalFavorites',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/downloads',
        name: 'PersonalDownloads',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/personal/preferences',
        name: 'PersonalPreferences',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 系统管理 ==========
    {
        path: '/system/permission',
        name: 'SystemPermission',
        component: () => import('@/views/system/permission/Index.vue')
    },
    {
        path: '/system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config-center/Index.vue')
    },
    {
        path: '/system/audit',
        name: 'SystemAudit',
        component: () => import('@/views/system/audit-center/Index.vue')
    },
    {
        path: '/system/log',
        name: 'SystemLog',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/operations',
        name: 'SystemOperations',
        component: () => import('@/views/system/ops-center/Index.vue')
    },
    {
        path: '/system/version',
        name: 'SystemVersion',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 集成中心 ==========
    {
        path: '/integration/admin',
        name: 'IntegrationAdmin',
        component: () => import('@/views/integration/admin/Index.vue')
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        return { top: 0 }
    }
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('bi_token')
    const userRole = localStorage.getItem('bi_user_role')

    if (to.path === '/login') {
        if (token) {
            if (userRole === 'admin') {
                next('/admin/home')
            } else {
                next('/')
            }
        } else {
            next()
        }
    } else {
        if (!token) {
            next('/login')
        } else {
            if (to.path === '/' && userRole === 'admin') {
                next('/admin/home')
            } else {
                next()
            }
        }
    }
})

export default router
