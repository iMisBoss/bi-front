// 菜单配置 - 分为前台工作台和后台管理中心

/**
 * 菜单项结构：
 * {
 *   id: string,              // 菜单唯一标识
 *   title: string,           // 菜单标题
 *   icon?: string,           // 图标名称
 *   path?: string,           // 路由路径（如果有子菜单则为父级标识）
 *   type: 'item' | 'submenu', // 菜单类型
 *   children?: MenuItem[],   // 子菜单
 *   roles?: string[],        // 允许访问的角色列表（不设置表示所有角色可见）
 *   permissions?: string[],  // 需要的权限列表
 *   category: 'frontend' | 'backend' // 菜单分类：前台或后台
 * }
 */

export const menuConfig = [
    // ==================== 前台工作台菜单（全员可见，按角色过滤）====================
    {
        id: 'home',
        title: '首页',
        icon: 'HomeFilled',
        path: '/',
        type: 'item',
        category: 'frontend'
    },
    {
        id: 'org',
        title: '组织人事管理',
        icon: 'User',
        type: 'submenu',
        category: 'frontend',
        roles: ['admin', 'hr', 'manager'], // 仅 HR 和管理层可见
        children: [
            {
                id: 'org-staff',
                title: '人员档案管理',
                path: '/org/staff',
                type: 'item',
                roles: ['admin', 'hr']
            },
            {
                id: 'org-department',
                title: '部门管理',
                path: '/org/department',
                type: 'item',
                roles: ['admin', 'hr']
            },
            {
                id: 'org-position',
                title: '岗位管理',
                path: '/org/position',
                type: 'item',
                roles: ['admin', 'hr']
            },
            {
                id: 'org-role',
                title: '角色权限',
                path: '/org/role',
                type: 'item',
                roles: ['admin']
            },
            {
                id: 'org-level',
                title: '职级体系',
                path: '/org/level',
                type: 'item',
                roles: ['admin', 'hr']
            },
            {
                id: 'org-employee',
                title: '员工入职离职',
                path: '/org/employee',
                type: 'item',
                roles: ['admin', 'hr']
            }
        ]
    },
    {
        id: 'process',
        title: '工作台',
        icon: 'Document',
        type: 'submenu',
        category: 'frontend',
        children: [
            {
                id: 'process-start',
                title: '发起审批',
                path: '/process/approval/start',
                type: 'item',
                icon: 'Plus'
            },
            {
                id: 'process-todo',
                title: '我的待办',
                path: '/process/approval/todo',
                type: 'item',
                icon: 'Bell'
            },
            {
                id: 'process-done',
                title: '我已处理',
                path: '/process/approval/done',
                type: 'item',
                icon: 'CircleCheck'
            },
            {
                id: 'process-launched',
                title: '我发起的',
                path: '/process/approval/launched',
                type: 'item',
                icon: 'Promotion'
            },
            {
                id: 'process-cced',
                title: '抄送我的',
                path: '/process/approval/cced',
                type: 'item',
                icon: 'Message'
            },
            {
                id: 'process-delegate',
                title: '审批委托',
                path: '/process/approval/delegate',
                type: 'item',
                icon: 'UserFilled'
            },
            {
                id: 'process-progress',
                title: '流程进度查询',
                path: '/process/approval/progress',
                type: 'item',
                icon: 'Connection'
            }
        ]
    },
    {
        id: 'cms',
        title: '内容管理中心',
        icon: 'Folder',
        type: 'submenu',
        category: 'frontend',
        children: [
            {
                id: 'cms-news',
                title: '新闻公告',
                path: '/cms/news',
                type: 'item'
            },
            {
                id: 'cms-document',
                title: '公文管理',
                path: '/cms/document',
                type: 'item',
                roles: ['admin', 'editor']
            },
            {
                id: 'cms-knowledge',
                title: '知识库',
                path: '/cms/knowledge',
                type: 'item'
            },
            {
                id: 'cms-archive-library',
                title: '档案库',
                path: '/cms/archive-library',
                type: 'item',
                roles: ['admin', 'archivist']
            },
            {
                id: 'cms-regulation',
                title: '规章制度',
                path: '/cms/regulation',
                type: 'item'
            },
            {
                id: 'cms-culture',
                title: '企业文化',
                path: '/cms/culture',
                type: 'item'
            }
        ]
    },
    {
        id: 'office',
        title: '日常办公',
        icon: 'Briefcase',
        type: 'submenu',
        category: 'frontend',
        children: [
            {
                id: 'office-attendance',
                title: '考勤打卡',
                path: '/office/attendance',
                type: 'item'
            },
            {
                id: 'office-leave',
                title: '请假休假',
                path: '/office/leave',
                type: 'item'
            },
            {
                id: 'office-meeting',
                title: '会议管理',
                path: '/office/meeting',
                type: 'item'
            },
            {
                id: 'office-vehicle',
                title: '车辆申请',
                path: '/office/vehicle',
                type: 'item'
            },
            {
                id: 'office-supplies',
                title: '用品申领',
                path: '/office/supplies',
                type: 'item'
            },
            {
                id: 'office-seal',
                title: '用印申请',
                path: '/office/seal',
                type: 'item'
            }
        ]
    },
    {
        id: 'ai',
        title: 'AI 智能助手',
        icon: 'ChatDotRound',
        type: 'submenu',
        category: 'frontend',
        children: [
            {
                id: 'ai-qa',
                title: 'AI 问答客服',
                path: '/ai/qa',
                type: 'item'
            },
            {
                id: 'ai-writing',
                title: '智能写作',
                path: '/ai/writing',
                type: 'item'
            },
            {
                id: 'ai-summary',
                title: '文档摘要',
                path: '/ai/summary',
                type: 'item'
            },
            {
                id: 'ai-meeting',
                title: '会议纪要',
                path: '/ai/meeting',
                type: 'item'
            }
        ]
    },
    {
        id: 'message',
        title: '消息中心',
        icon: 'Bell',
        type: 'submenu',
        category: 'frontend',
        children: [
            {
                id: 'message-station',
                title: '站内消息',
                path: '/message/station',
                type: 'item'
            },
            {
                id: 'message-sms',
                title: '短信通知',
                path: '/message/sms',
                type: 'item'
            },
            {
                id: 'message-email',
                title: '邮件推送',
                path: '/message/email',
                type: 'item'
            },
            {
                id: 'message-remind',
                title: '建行员工提醒',
                path: '/message/remind',
                type: 'item'
            }
        ]
    },

    // ==================== 后台管理中心菜单（仅管理员可见）====================
    {
        id: 'process-center',
        title: '流程中心',
        icon: 'Document',
        type: 'submenu',
        category: 'backend',
        roles: ['admin', 'process_admin'], // 仅管理员和流程管理员可见
        children: [
            {
                id: 'process-handle-query',
                title: '全局流程管理',
                path: '/process/approval/handle-query',
                type: 'item',
                icon: 'Monitor',
                roles: ['admin', 'process_admin']
            },
            {
                id: 'process-center-design',
                title: '流程设计中心',
                type: 'submenu',
                roles: ['admin', 'process_designer'],
                children: [
                    {
                        id: 'process-design-basic',
                        title: '基础能力配置',
                        type: 'submenu',
                        roles: ['admin'],
                        children: [
                            {
                                id: 'design-business-object',
                                title: '业务对象管理',
                                path: '/process/design/business-object',
                                type: 'item',
                                roles: ['admin']
                            },
                            {
                                id: 'design-auto-number',
                                title: '自动编号规则配置',
                                path: '/process/design/auto-number',
                                type: 'item',
                                roles: ['admin']
                            },
                            {
                                id: 'design-approver-rules',
                                title: '审批人规则引擎',
                                path: '/process/design/approver-rules',
                                type: 'item',
                                roles: ['admin']
                            },
                            {
                                id: 'design-params',
                                title: '全局流程参数',
                                path: '/process/design/params',
                                type: 'item',
                                roles: ['admin']
                            },
                            {
                                id: 'design-variables',
                                title: '系统变量库',
                                path: '/process/design/variables',
                                type: 'item',
                                roles: ['admin']
                            }
                        ]
                    },
                    {
                        id: 'process-design-form',
                        title: '低代码表单设计器',
                        type: 'submenu',
                        roles: ['admin', 'form_designer'],
                        children: [
                            {
                                id: 'form-design',
                                title: '表单设计',
                                path: '/process/design/form/design',
                                type: 'item'
                            },
                            {
                                id: 'form-template',
                                title: '表单模板',
                                path: '/process/design/form/template',
                                type: 'item'
                            },
                            {
                                id: 'form-permission',
                                title: '字段权限',
                                path: '/process/design/form/permission',
                                type: 'item'
                            },
                            {
                                id: 'form-linkage',
                                title: '联动规则',
                                path: '/process/design/form/linkage',
                                type: 'item'
                            }
                        ]
                    },
                    {
                        id: 'process-design-flowable',
                        title: 'Flowable 流程设计器',
                        type: 'submenu',
                        roles: ['admin', 'process_designer'],
                        children: [
                            {
                                id: 'flowable-bpmn',
                                title: 'BPMN 可视化设计',
                                path: '/process/design/flowable/bpmn',
                                type: 'item'
                            },
                            {
                                id: 'flowable-form-bind',
                                title: '流程 - 表单绑定',
                                path: '/process/design/flowable/form-bind',
                                type: 'item'
                            },
                            {
                                id: 'flowable-node-config',
                                title: '节点属性配置',
                                path: '/process/design/flowable/node-config',
                                type: 'item'
                            },
                            {
                                id: 'flowable-version',
                                title: '流程版本管理',
                                path: '/process/design/flowable/version',
                                type: 'item'
                            }
                        ]
                    },
                    {
                        id: 'process-design-template',
                        title: '模板发布管理',
                        type: 'submenu',
                        roles: ['admin'],
                        children: [
                            {
                                id: 'template-process',
                                title: '流程模板管理',
                                path: '/process/design/template/process',
                                type: 'item'
                            },
                            {
                                id: 'template-notification',
                                title: '通知模板',
                                path: '/process/design/template/notification',
                                type: 'item'
                            },
                            {
                                id: 'template-opinion',
                                title: '审批意见模板',
                                path: '/process/design/template/opinion',
                                type: 'item'
                            },
                            {
                                id: 'template-print',
                                title: '打印模板',
                                path: '/process/design/template/print',
                                type: 'item'
                            }
                        ]
                    }
                ]
            },
            {
                id: 'process-center-monitor',
                title: '流程监控与运维',
                type: 'submenu',
                roles: ['admin', 'process_admin'],
                children: [
                    {
                        id: 'monitor-instances',
                        title: '流程实例监控',
                        path: '/process/monitor/instances',
                        type: 'item'
                    },
                    {
                        id: 'monitor-tasks',
                        title: '待办任务全局管理',
                        path: '/process/monitor/tasks',
                        type: 'item'
                    },
                    {
                        id: 'monitor-proxy',
                        title: '审批代理管理',
                        path: '/process/monitor/proxy',
                        type: 'item'
                    },
                    {
                        id: 'monitor-urge',
                        title: '催办与提醒',
                        path: '/process/monitor/urge',
                        type: 'item'
                    },
                    {
                        id: 'monitor-logs',
                        title: '流程操作审计日志',
                        path: '/process/monitor/logs',
                        type: 'item'
                    },
                    {
                        id: 'monitor-exceptions',
                        title: '异常流程处理',
                        path: '/process/monitor/exceptions',
                        type: 'item'
                    }
                ]
            }
        ]
    },
    {
        id: 'system',
        title: '系统管理',
        icon: 'Setting',
        type: 'submenu',
        category: 'backend',
        roles: ['admin', 'super_admin'], // 仅超级管理员可见
        children: [
            {
                id: 'system-config',
                title: '参数配置',
                path: '/system/config',
                type: 'item',
                roles: ['admin']
            },
            {
                id: 'system-log',
                title: '日志审计',
                path: '/system/log',
                type: 'item',
                roles: ['admin', 'auditor']
            },
            {
                id: 'system-backup',
                title: '数据备份',
                path: '/system/backup',
                type: 'item',
                roles: ['admin']
            },
            {
                id: 'system-version',
                title: '版本管理',
                path: '/system/version',
                type: 'item',
                roles: ['admin']
            }
        ]
    },
    {
        id: 'mobile',
        title: '移动端',
        icon: 'Cellphone',
        type: 'submenu',
        category: 'backend',
        roles: ['admin', 'mobile_admin'],
        children: [
            {
                id: 'mobile-integration',
                title: '移动端集成',
                path: '/mobile/integration',
                type: 'item'
            },
            {
                id: 'mobile-approval',
                title: '移动审批',
                path: '/mobile/approval',
                type: 'item'
            },
            {
                id: 'mobile-attendance',
                title: '移动考勤',
                path: '/mobile/attendance',
                type: 'item'
            },
            {
                id: 'mobile-push',
                title: '消息推送',
                path: '/mobile/push',
                type: 'item'
            }
        ]
    }
]

/**
 * 检查用户是否有权限访问某个菜单项
 * @param {Object} menuItem - 菜单项配置
 * @param {Array} userRoles - 用户角色列表
 * @returns {boolean}
 */
export function checkMenuPermission(menuItem, userRoles) {
    // 如果没有设置角色限制，则所有用户可见
    if (!menuItem.roles || menuItem.roles.length === 0) {
        return true
    }

    // 检查用户是否拥有任一所需角色
    return menuItem.roles.some(role => userRoles.includes(role))
}

/**
 * 根据用户角色过滤菜单
 * @param {Array} menus - 菜单配置数组
 * @param {Array} userRoles - 用户角色列表
 * @param {string} category - 菜单分类：'frontend' 或 'backend'
 * @returns {Array} 过滤后的菜单
 */
export function filterMenusByRole(menus, userRoles, category = null) {
    return menus
        .filter(menu => {
            // 如果指定了分类，只返回该分类的菜单
            if (category && menu.category !== category) {
                return false
            }

            // 检查菜单权限
            return checkMenuPermission(menu, userRoles)
        })
        .map(menu => {
            // 递归处理子菜单
            if (menu.children && menu.children.length > 0) {
                return {
                    ...menu,
                    children: filterMenusByRole(menu.children, userRoles)
                }
            }
            return menu
        })
        .filter(menu => {
            // 移除没有子菜单的 submenu
            if (menu.type === 'submenu' && (!menu.children || menu.children.length === 0)) {
                return false
            }
            return true
        })
}

/**
 * 获取前台工作台菜单
 * @param {Array} userRoles - 用户角色列表
 * @returns {Array}
 */
export function getFrontendMenus(userRoles) {
    return filterMenusByRole(menuConfig, userRoles, 'frontend')
}

/**
 * 获取后台管理中心菜单
 * @param {Array} userRoles - 用户角色列表
 * @returns {Array}
 */
export function getBackendMenus(userRoles) {
    return filterMenusByRole(menuConfig, userRoles, 'backend')
}

/**
 * 获取所有可见菜单（前台 + 后台）
 * @param {Array} userRoles - 用户角色列表
 * @returns {Array}
 */
export function getAllVisibleMenus(userRoles) {
    return filterMenusByRole(menuConfig, userRoles)
}
