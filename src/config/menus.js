// 前台菜单配置（普通用户）
export const frontMenus = [
    {
        title: '我的工作台',
        icon: 'HomeFilled',
        children: [
            { title: '首页看板', path: '/' },
            { title: '我的待办', path: '/process/approval/todo' },
            { title: '我的消息', path: '/message/station' },
            { title: '我已处理', path: '/process/approval/done' },
            { title: '我发起的', path: '/process/approval/launched' },
            { title: '抄送管理', path: '/process/approval/cced' },
            { title: '我的日程', path: '/process/approval/my-schedule' }
        ]
    },
    {
        title: '流程审批中心',
        icon: 'DocumentChecked',
        children: [
            { title: '发起审批', path: '/process/approval/start' },
            { title: '审批委托', path: '/process/approval/delegate' },
            { title: '流程进度查询', path: '/process/approval/progress' },
            { title: '流程归档查询', path: '/process/approval/archive' }
        ]
    },
    {
        title: '日常办公',
        icon: 'Briefcase',
        children: [
            {
                title: '会议管理',
                children: [
                    { title: '我的会议', path:  '/office/meeting/my-meetings' },
                    { title: '发起会议', path: '/office/meeting/create-meeting' },
                    { title: '会议室预约', path: '/office/meeting/room-booking' },
                    { title: '会议通知', path: '/office/meeting/notification' },
                    { title: '会议纪要', path: '/office/meeting/agenda' },
                    { title: '会议统计分析', path: '/office/meeting/statistics' }
                ]
            },
            {
                title: '组织通讯录',
                children: [
                    { title: '组织架构通讯录', path: '/office/org/contacts/employee' },
                    { title: '个人联系人', path: '/office/org/contacts/personal' },
                    { title: '个人名片维护', path: '/office/org/contacts/my-card' }
                ]
            },
            { title: '内部邮件', path: '/message/email' },
            { title: '报表汇总', path: '/office/reports' }
        ]
    },
    {
        title: '公文与内容管理',
        icon: 'Reading',
        children: [
            { title: '新闻公告', path: '/cms/news' },
            {
                title: '公文管理',
                children: [
                    { title: '个人公文中心', path: '/cms/document/personal' },
                    { title: '收发文管理', path: '/cms/document/send-receive' },
                    { title: '流转与督办', path: '/cms/document/circulation' },
                    { title: '查询与归档', path: '/cms/document/query-archive' },
                    { title: '文号管理', path: '/cms/document/document-number' }
                ]
            },
            { title: '规章制度', path: '/cms/regulation' },
            { title: '企业知识库', path: '/cms/knowledge' },
            { title: '文档中心', path: '/cms/archive-library' }
        ]
    },
    {
        title: 'AI智能助手',
        icon: 'ChatDotRound',
        children: [
            { title: 'AI问答客服', path: '/ai/qa' },
            { title: '智能写作', path: '/ai/writing' },
            { title: '文档智能摘要', path: '/ai/summary' },
            { title: '会议纪要自动生成', path: '/ai/meeting' }
        ]
    },
    {
        title: '个人中心',
        icon: 'User',
        children: [
            { title: '个人信息', path: '/personal/info' },
            {
                title: '账号安全',
                children: [
                    { title: '登录密码修改', path: '/personal/security/password' },
                    { title: '个人登录日志', path: '/personal/security/login-log' },
                    { title: '账号安全设置', path: '/personal/security/settings' }
                ]
            },
            { title: '系统偏好设置', path: '/personal/preferences' }
        ]
    }
]

// 后台菜单配置（系统管理员）
export const backMenus = [
    {
        title: '后台首页',
        icon: 'HomeFilled',
        path: '/admin/home'
    },
    {
        title: '表单中心',
        icon: 'Document',
        children: [
            { title: '表单可视化设计', path: '/form/design' },
            { title: '表单管理', path: '/form/management' },
            {
                title: '表单配置',
                children: [
                    { title: '业务对象管理', path: '/form/business-object' },
                    { title: '自动编号规则配置', path: '/form/auto-number' }
                ]
            }
        ]
    },
    {
        title: '流程中心',
        icon: 'Connection',
        children: [
            { title: '流程建模设计', path: '/process/flowable/bpmn' },
            { title: '流程模板中心', path: '/process/flowable/version' },
            {
                title: '流程配置',
                children: [
                    { title: '流程分类管理', path: '/process/flowable/categories' },
                    { title: '全局参数设置', path: '/process/flowable/params' },
                    { title: '变量管理', path: '/process/flowable/variables' },
                    { title: '数据资源管理', path: '/process/flowable/data-resources' }
                ]
            },
            {
                title: '实例运维',
                children: [
                    { title: '流程实例中心', path: '/process/flowable/handle-query' },
                    { title: '审批委托管控', path: '/process/flowable/delegate-control' }
                ]
            }
        ]
    },
    {
        title: '门户中心',
        icon: 'HomeFilled',
        children: [
            { title: '门户设计器', path: '/portal/designer' },
            { title: '门户管理中心', path: '/portal/management' },
            {
                title: '基础配置',
                children: [
                    { title: '门户分类管理', path: '/portal/categories' },
                    { title: '组件库管理', path: '/portal/components-lib' },
                    { title: '自定义规则配置', path: '/portal/user-rules' },
                    { title: '全局配置', path: '/portal/global-config' }
                ]
            }
        ]
    },
    {
        title: '组织人事管理',
        icon: 'UserFilled',
        children: [
            { title: '组织架构管理', path: '/office/org/admin/structure' },
            { title: '职务职级管理', path: '/office/org/admin/position' },
            { title: '人员用户管理', path: '/office/org/admin/users' },
            { title: '通讯录管理', path: '/office/org/admin/contacts' },
            { title: '数据安全配置', path: '/office/org/admin/security' },
            { title: '群组管理', path: '/office/org/admin/groups' }
        ]
    },
    {
        title: '日常办公管理',
        icon: 'Briefcase',
        children: [
            { title: '会议管理', path: '/office/meeting-admin' },
            { title: '内部邮件管控', path: '/message/email-admin' }
        ]
    },
    {
        title: '公文与内容管理',
        icon: 'Reading',
        children: [
            {
                title: '公文管理',
                icon: 'DocumentChecked',
                children: [
                    { title: '公文模板管理', path: '/cms/document-admin/templates' },
                    { title: '文号规则管理', path: '/cms/document-admin/numbers' },
                    { title: '公文流程配置', path: '/cms/document-admin/workflow' },
                    { title: '权限与涉密管控', path: '/cms/document-admin/security' },
                    { title: '归档与数据管理', path: '/cms/document-admin/archive' }
                ]
            },
            { title: '内容管理', path: '/cms/content-admin' }
        ]
    },
    {
        title: 'AI智能助手管理',
        icon: 'ChatDotRound',
        children: [
            { title: 'AI管理', path: '/ai/admin' }
        ]
    },
    {
        title: '系统管理',
        icon: 'Setting',
        children: [
            { title: '权限菜单管理', path: '/system/permission' },
            { title: '系统参数配置', path: '/system/config' }
        ]
    },
    {
        title: '审计日志管理',
        icon: 'Monitor',
        children: [
            { title: '审计管理', path: '/system/audit' }
        ]
    },
    {
        title: '运维监控',
        icon: 'DataLine',
        children: [
            { title: '运维管理', path: '/system/operations' }
        ]
    },
    {
        title: '集成中心',
        icon: 'Link',
        children: [
            { title: '集成管理', path: '/integration/admin' }
        ]
    }
]

// 根据角色获取菜单
export const getMenusByRole = (role) => {
    return role === 'admin' ? backMenus : frontMenus
}
