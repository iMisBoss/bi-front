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
        component: () => import('@/views/AdminHome.vue'),
        meta: { requiresAuth: true, title: '后台管理首页' }
    },

    // ========== 工作台 ==========
    {
        path: '/workbench/cced-by-me',
        name: 'WorkbenchCcedByMe',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/workbench/my-schedule',
        name: 'WorkbenchMySchedule',
        component: () => import('@/views/Empty.vue')
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
    {
        path: '/org/employee/resigned',
        name: 'OrgEmployeeResigned',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/locations',
        name: 'OrgLocations',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/users/disabled',
        name: 'OrgUsersDisabled',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/users/history',
        name: 'OrgUsersHistory',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/contacts/field-config',
        name: 'OrgContactsFieldConfig',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/contacts/permission',
        name: 'OrgContactsPermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/contacts/external',
        name: 'OrgContactsExternal',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/contacts/audit',
        name: 'OrgContactsAudit',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/security/masking-rules',
        name: 'OrgSecurityMaskingRules',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/security/access-control',
        name: 'OrgSecurityAccessControl',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/org/groups',
        name: 'OrgGroups',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 流程审批中心 ==========
    {
        path: '/process/approval/start',
        name: 'ProcessApprovalStart',
        component: () => import('@/views/process/approval/start/Index.vue')
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

    // ========== 流程运行管理 ==========
    {
        path: '/process/approval/handle-query',
        name: 'ProcessApprovalHandleQuery',
        component: () => import('@/views/process/handle-query/Index.vue')
    },
    {
        path: '/process/admin/template-control',
        name: 'ProcessAdminTemplateControl',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/admin/delegate-control',
        name: 'ProcessAdminDelegateControl',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/approval/archive',
        name: 'ProcessApprovalArchive',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/admin/version-management',
        name: 'ProcessAdminVersionManagement',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 低代码设计平台 ==========
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
    {
        path: '/process/design/data-resources',
        name: 'ProcessDesignDataResources',
        component: () => import('@/views/Empty.vue')
    },
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
    {
        path: '/process/design/flowable/categories',
        name: 'ProcessDesignFlowableCategories',
        component: () => import('@/views/Empty.vue')
    },
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
    {
        path: '/process/design/flowable/permission',
        name: 'ProcessDesignFlowablePermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/templates',
        name: 'ProcessDesignPortalTemplates',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/designer',
        name: 'ProcessDesignPortalDesigner',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/components',
        name: 'ProcessDesignPortalComponents',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/data-binding',
        name: 'ProcessDesignPortalDataBinding',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/publish',
        name: 'ProcessDesignPortalPublish',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/permission',
        name: 'ProcessDesignPortalPermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/user-rules',
        name: 'ProcessDesignPortalUserRules',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/process/design/portal/global-config',
        name: 'ProcessDesignPortalGlobalConfig',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 日常办公 ==========
    {
        path: '/office/meeting',
        name: 'OfficeMeeting',
        component: () => import('@/views/office/Meeting.vue')
    },
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
        path: '/office/meeting/admin/rooms',
        name: 'OfficeMeetingAdminRooms',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/admin/permission',
        name: 'OfficeMeetingAdminPermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/admin/templates',
        name: 'OfficeMeetingAdminTemplates',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/admin/approval-flow',
        name: 'OfficeMeetingAdminApprovalFlow',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/admin/statistics',
        name: 'OfficeMeetingAdminStatistics',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/meeting/admin/config',
        name: 'OfficeMeetingAdminConfig',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/admin/groups',
        name: 'OfficeAdminGroups',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/office/admin/email-control',
        name: 'OfficeAdminEmailControl',
        component: () => import('@/views/Empty.vue')
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
        component: () => import('@/views/cms/News.vue')
    },
    {
        path: '/cms/document',
        name: 'CmsDocument',
        component: () => import('@/views/cms/Document.vue')
    },
    {
        path: '/cms/document/personal',
        name: 'CmsDocumentPersonal',
        component: () => import('@/views/cms/document/Personal.vue')
    },
    {
        path: '/cms/document/send-receive',
        name: 'CmsDocumentSendReceive',
        component: () => import('@/views/cms/document/SendReceive.vue')
    },
    {
        path: '/cms/document/circulation',
        name: 'CmsDocumentCirculation',
        component: () => import('@/views/cms/document/Circulation.vue')
    },
    {
        path: '/cms/document/query-archive',
        name: 'CmsDocumentQueryArchive',
        component: () => import('@/views/cms/document/QueryArchive.vue')
    },
    {
        path: '/cms/document/document-number',
        name: 'CmsDocumentNumber',
        component: () => import('@/views/cms/document/DocumentNumber.vue')
    },
    {
        path: '/cms/document/handle',
        name: 'CmsDocumentHandle',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/create',
        name: 'CmsDocumentCreate',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/my-documents',
        name: 'CmsDocumentMyDocuments',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/search',
        name: 'CmsDocumentSearch',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/archived',
        name: 'CmsDocumentArchived',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/incoming',
        name: 'CmsDocumentIncoming',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/outgoing',
        name: 'CmsDocumentOutgoing',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/supervision',
        name: 'CmsDocumentSupervision',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/templates',
        name: 'CmsDocumentAdminTemplates',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/number-rules',
        name: 'CmsDocumentAdminNumberRules',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/outgoing-flow',
        name: 'CmsDocumentAdminOutgoingFlow',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/incoming-flow',
        name: 'CmsDocumentAdminIncomingFlow',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/template-permission',
        name: 'CmsDocumentAdminTemplatePermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/confidential',
        name: 'CmsDocumentAdminConfidential',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/document/admin/archive',
        name: 'CmsDocumentAdminArchive',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/regulation',
        name: 'CmsRegulation',
        component: () => import('@/views/cms/Regulation.vue')
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
        path: '/cms/admin/columns',
        name: 'CmsAdminColumns',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/admin/regulations',
        name: 'CmsAdminRegulations',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/admin/document-permission',
        name: 'CmsAdminDocumentPermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/cms/admin/publish-approval',
        name: 'CmsAdminPublishApproval',
        component: () => import('@/views/Empty.vue')
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
    {
        path: '/ai/admin/permission',
        name: 'AIAdminPermission',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/ai/admin/sensitive-words',
        name: 'AIAdminSensitiveWords',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/ai/admin/audit-log',
        name: 'AIAdminAuditLog',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/ai/admin/model-config',
        name: 'AIAdminModelConfig',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 消息中心 ==========
    {
        path: '/message/station',
        name: 'MessageStation',
        component: () => import('@/views/message/Station.vue')
    },
    {
        path: '/message/email',
        name: 'MessageEmail',
        component: () => import('@/views/message/Email.vue')
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
        path: '/system/config',
        name: 'SystemConfig',
        component: () => import('@/views/system/Config.vue')
    },
    {
        path: '/system/config/frontend',
        name: 'SystemConfigFrontend',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/config/backend',
        name: 'SystemConfigBackend',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/menus',
        name: 'SystemMenus',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/navigation',
        name: 'SystemNavigation',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/dictionary',
        name: 'SystemDictionary',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 审计日志管理 ==========
    {
        path: '/system/log',
        name: 'SystemLog',
        component: () => import('@/views/system/Log.vue')
    },
    {
        path: '/system/log/login',
        name: 'SystemLogLogin',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/log/audit-rules',
        name: 'SystemLogAuditRules',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/log/alert-config',
        name: 'SystemLogAlertConfig',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/log/archive-config',
        name: 'SystemLogArchiveConfig',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 系统运维监控 ==========
    {
        path: '/system/monitor/log-collection',
        name: 'SystemMonitorLogCollection',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/monitor/ip-filter',
        name: 'SystemMonitorIpFilter',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/monitor/services',
        name: 'SystemMonitorServices',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/system/backup',
        name: 'SystemBackup',
        component: () => import('@/views/system/Backup.vue')
    },
    {
        path: '/system/backup/records',
        name: 'SystemBackupRecords',
        component: () => import('@/views/Empty.vue')
    },

    // ========== 集成中心 ==========
    {
        path: '/integration/apps',
        name: 'IntegrationApps',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/cron/config',
        name: 'IntegrationCronConfig',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/cron/logs',
        name: 'IntegrationCronLogs',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/api/config',
        name: 'IntegrationApiConfig',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/api/logs',
        name: 'IntegrationApiLogs',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/jar-files',
        name: 'IntegrationJarFiles',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/database/connections',
        name: 'IntegrationDatabaseConnections',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/database/datasources',
        name: 'IntegrationDatabaseDatasources',
        component: () => import('@/views/Empty.vue')
    },
    {
        path: '/integration/database/jar-files',
        name: 'IntegrationDatabaseJarFiles',
        component: () => import('@/views/Empty.vue')
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
            // 已登录的管理员访问登录页，重定向到后台首页
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
            // 管理员访问普通首页，重定向到后台首页
            if (to.path === '/' && userRole === 'admin') {
                next('/admin/home')
            } else {
                next()
            }
        }
    }
})

export default router
