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
            { title: '我的日程', path: '/workbench/my-schedule' }
        ]
    },
    {
        title: '流程审批中心',
        icon: 'DocumentChecked',
        children: [
            { title: '发起审批', path: '/process/approval/start' },
            { title: '审批委托',path: '/process/approval/delegate' },
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
                    { title: '我的会议', path: '/office/meeting/my-meetings' },
                    { title: '发起会议', path: '/office/meeting/create' },
                    { title: '会议室预约', path: '/office/meeting/room-booking' },
                    { title: '会议通知', path: '/office/meeting/notifications' },
                    { title: '会议纪要', path: '/office/meeting/minutes' },
                    { title: '会议统计分析', path: '/office/meeting/statistics' }
                ]
            },
            {
                title: '组织通讯录',
                children: [
                    { title: '组织架构通讯录', path: '/org/employee' },
                    { title: '我的常用联系人', path: '/org/contacts/favorites' },
                    { title: '外部联系人', path: '/org/contacts/external' },
                    { title: '个人名片维护', path: '/org/contacts/my-card' }
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
                    { title: '手机号绑定', path: '/personal/security/phone' },
                    { title: '登录设备管理', path: '/personal/security/devices' },
                    { title: '个人登录日志', path: '/personal/security/login-log' },
                    { title: '账号安全设置', path: '/personal/security/settings' }
                ]
            },
            { title: '我的收藏', path: '/personal/favorites' },
            { title: '我的下载', path: '/personal/downloads' },
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
            { title: '表单可视化设计', path: '/process/design/form/design' },
            { title: '表单管理', path: '/process/design/form/management' },
            {
                title: '表单配置',
                children: [
                    { title: '业务对象管理', path: '/process/design/business-object' },
                    { title: '自动编号规则配置', path: '/process/design/auto-number' }
                ]
            }
        ]
    },
    {
        title: '流程中心',
        icon: 'Connection',
        children: [
            { title: '流程建模设计', path: '/process/design/flowable/bpmn' },
            { title: '流程模板中心', path: '/process/design/flowable/version' },
            {
                title: '流程配置',
                children: [
                    { title: '流程分类管理', path: '/process/design/flowable/categories' },
                    { title: '全局参数设置', path: '/process/design/params' },
                    { title: '变量管理', path: '/process/design/variables' },
                    { title: '数据资源管理', path: '/process/design/data-resources' }
                ]
            },
            {
                title: '实例运维',
                children: [
                    { title: '流程实例中心', path: '/process/approval/handle-query' },
                    { title: '审批委托管控', path: '/process/admin/delegate-control' }
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
            { title: '组织架构管理', path: '/org/structure', tabs: ['部门', '岗位', '职务', '办公地点'] },
            { title: '人员用户管理', path: '/org/users', tabs: ['组织用户', '在职', '离职', '禁用', '历史用户'] },
            { title: '通讯录管理', path: '/org/contacts', tabs: ['展示字段', '权限管控', '外部联系人'] },
            { title: '数据安全配置', path: '/org/security', tabs: ['敏感字段脱敏', '敏感数据访问'] },
            { title: '群组管理', path: '/org/groups' }
        ]
    },
    {
        title: '日常办公管理',
        icon: 'Briefcase',
        children: [
            { title: '会议管理', path: '/office/meeting', tabs: ['会议室信息', '预约权限', '模板', '审批流程', '统计', '基础配置'] },
            { title: '内部邮件管控', path: '/office/email' }
        ]
    },
    {
        title: '公文与内容管理',
        icon: 'Reading',
        children: [
            { title: '公文管理', path: '/cms/document', tabs: ['模板', '文号规则', '发文', '收文流程', '模板权限', '涉密管控', '归档'] },
            { title: '内容管理', path: '/cms/content', tabs: ['栏目', '新闻公告', '规章制度', '文档权限', '发布审批', '知识库'] }
        ]
    },
    {
        title: 'AI智能助手管理',
        icon: 'ChatDotRound',
        children: [
            { title: 'AI管理', path: '/ai/admin', tabs: ['功能权限', '敏感词管控', '使用审计', '模型配置'] }
        ]
    },
    {
        title: '系统管理',
        icon: 'Setting',
        children: [
            { title: '权限菜单管理', path: '/system/permission', tabs: ['角色权限', '系统菜单', '系统导航'] },
            { title: '系统参数配置', path: '/system/config', tabs: ['前台设置', '后台设置', '数据字典'] }
        ]
    },
    {
        title: '审计日志管理',
        icon: 'Monitor',
        children: [
            { title: '审计管理', path: '/system/audit', tabs: ['全量操作日志', '登录登出日志', '审计规则', '敏感告警', '日志归档'] }
        ]
    },
    {
        title: '运维监控',
        icon: 'DataLine',
        children: [
            { title: '运维管理', path: '/system/operations', tabs: ['日志采集', 'IP黑白名单', '系统服务监控', '备份规则', '备份记录'] }
        ]
    },
    {
        title: '集成中心',
        icon: 'Link',
        children: [
            { title: '集成管理', path: '/integration/admin', tabs: ['应用集成', '定时任务配置', '任务执行日志', '公共接口', '接口调用日志', 'JAR包管理'] }
        ]
    }
]

// 根据角色获取菜单
export const getMenusByRole = (role) => {
    return role === 'admin' ? backMenus : frontMenus
}
