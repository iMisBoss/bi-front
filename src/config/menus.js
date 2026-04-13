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
                    { title: '组件库管理', path: '/portal/components-lib' },
                    { title: '门户分类管理', path: '/portal/categories' },
                    { title: '自定义规则配置', path: '/portal/user-rules' },
                    { title: '全局配置', path: '/portal/global-config' }
                ]
            }
        ]
    },
    {
        title: '组织人事管理后台',
        icon: 'UserFilled',
        children: [
            {
                title: '组织架构管理',
                children: [
                    { title: '部门架构维护', path: '/org/department' },
                    { title: '岗位职级体系维护', path: '/org/level' },
                    { title: '职务管理', path: '/org/position' },
                    { title: '办公地点管理', path: '/org/locations' }
                ]
            },
            {
                title: '系统用户管理',
                children: [
                    { title: '组织用户管理', path: '/org/staff' },
                    { title: '用户禁用管理', path: '/org/users/disabled' },
                    { title: '历史用户管理', path: '/org/users/history' }
                ]
            },
            {
                title: '人员档案管理',
                children: [
                    { title: '在职人员管理', path: '/org/employee' },
                    { title: '离职人员管理', path: '/org/employee/resigned' }
                ]
            },
            {
                title: '通讯录管理后台',
                children: [
                    { title: '通讯录展示字段配置', path: '/org/contacts/field-config' },
                    { title: '通讯录权限管控', path: '/org/contacts/permission' },
                    { title: '外部联系人管理', path: '/org/contacts/external' },
                    { title: '通讯录操作审计', path: '/org/contacts/audit' }
                ]
            },
            {
                title: '数据安全与脱敏配',
                children: [
                    { title: '敏感字段脱敏规则', path: '/org/security/masking-rules' },
                    { title: '敏感数据访问管控', path: '/org/security/access-control' }
                ]
            },
            { title: '群组管理', path: '/org/groups' }
        ]
    },
    {
        title: '日常办公后台管',
        icon: 'Briefcase',
        children: [
            {
                title: '会议管理后台',
                children: [
                    { title: '会议室基础信息管理', path: '/office/meeting/admin/rooms' },
                    { title: '会议室预约权限管控', path: '/office/meeting/admin/permission' },
                    { title: '会议模板配置', path: '/office/meeting/admin/templates' },
                    { title: '会议审批流程配置', path: '/office/meeting/admin/approval-flow' },
                    { title: '会议统计分析', path: '/office/meeting/admin/statistics' },
                    { title: '会议基础配置', path: '/office/meeting/admin/config' }
                ]
            },
            { title: '群组管理', path: '/office/admin/groups' },
            { title: '内部邮件管控', path: '/office/admin/email-control' }
        ]
    },
    {
        title: '公文与内容管理后台',
        icon: 'Reading',
        children: [
            {
                title: '公文管理后台',
                children: [
                    { title: '公文模板配置', path: '/cms/document/admin/templates' },
                    { title: '文号规则配置', path: '/cms/document/admin/number-rules' },
                    { title: '发文流程配置', path: '/cms/document/admin/outgoing-flow' },
                    { title: '收文流程配置', path: '/cms/document/admin/incoming-flow' },
                    { title: '公文模板权限分配', path: '/cms/document/admin/template-permission' },
                    { title: '涉密公文管控配置', path: '/cms/document/admin/confidential' },
                    { title: '公文归档管理', path: '/cms/document/admin/archive' }
                ]
            },
            {
                title: '内容管理后台',
                children: [
                    { title: '栏目管理', path: '/cms/admin/columns' },
                    { title: '新闻公告管理', path: '/cms/news' },
                    { title: '规章制度管理', path: '/cms/admin/regulations' },
                    { title: '文档中心权限配置', path: '/cms/admin/document-permission' },
                    { title: '内容发布审批配置', path: '/cms/admin/publish-approval' },
                    { title: '知识库管理', path: '/cms/knowledge' }
                ]
            }
        ]
    },
    {
        title: 'AI智能助手管理',
        icon: 'ChatDotRound',
        children: [
            { title: 'AI功能权限配置', path: '/ai/admin/permission' },
            { title: '敏感词与合规管控', path: '/ai/admin/sensitive-words' },
            { title: 'AI使用审计日志', path: '/ai/admin/audit-log' },
            { title: '模型基础配置', path: '/ai/admin/model-config' }
        ]
    },
    {
        title: '系统管理',
        icon: 'Setting',
        children: [
            { title: '角色与权限管理', path: '/org/role' },
            { title: '系统菜单管理', path: '/system/menus' },
            { title: '系统导航配置', path: '/system/navigation' },
            {
                title: '系统参数配置',
                children: [
                    { title: '前台系统设置', path: '/system/config/frontend' },
                    { title: '后台系统设置', path: '/system/config/backend' },
                    { title: '数据字典管理', path: '/system/dictionary' }
                ]
            }
        ]
    },
    {
        title: '审计日志管理中',
        icon: 'Monitor',
        children: [
            {
                title: '全量操作日志',
                children: [
                    { title: '全量操作日志', path: '/system/log' },
                    { title: '登录登出日志', path: '/system/log/login' },
                    { title: '审计规则配置', path: '/system/log/audit-rules' },
                    { title: '敏感操作告警配置', path: '/system/log/alert-config' },
                    { title: '日志归档设置', path: '/system/log/archive-config' }
                ]
            }
        ]
    },
    {
        title: '系统运维监控中',
        icon: 'DataLine',
        children: [
            { title: '日志采集设置', path: '/system/monitor/log-collection' },
            { title: 'IP黑白名单过滤', path: '/system/monitor/ip-filter' },
            { title: '系统服务监控', path: '/system/monitor/services' },
            {
                title: '数据备份管理',
                children: [
                    { title: '备份规则设置', path: '/system/backup' },
                    { title: '备份记录管理', path: '/system/backup/records' }
                ]
            }
        ]
    },
    {
        title: '集成中心',
        icon: 'Link',
        children: [
            { title: '应用集成管理', path: '/integration/apps' },
            {
                title: '定时任务管理',
                children: [
                    { title: '定时任务配置', path: '/integration/cron/config' },
                    { title: '任务执行日志', path: '/integration/cron/logs' }
                ]
            },
            {
                title: '接口管理',
                children: [
                    { title: '公共接口配置', path: '/integration/api/config' },
                    { title: '接口调用日志', path: '/integration/api/logs' }
                ]
            },
            { title: 'JAR包管理', path: '/integration/jar-files' }
        ]
    }
]

// 根据角色获取菜单
export const getMenusByRole = (role) => {
    return role === 'admin' ? backMenus : frontMenus
}
