// D:\Workspaces\BI\bi-front\src\views\process\design\flowable\bpmn\components\customTranslate.js

const translations = {
    'Activate the create/remove space tool': '激活创建/删除空间工具',
    'Activate the global connect tool': '激活全局连接工具',
    'Activate the hand tool': '激活抓手工具',
    'Activate the lasso tool': '激活套索工具',
    'Add Lane above': '在上方添加泳道',
    'Add Lane below': '在下方添加泳道',
    'Append {type}': '追加 {type}',
    'Append EndEvent': '追加结束事件',
    'Append Gateway': '追加网关',
    'Append Task': '追加任务',
    'Append Intermediate/Boundary Event': '追加中间/边界事件',
    'Change type': '更改类型',
    'Connect using Association': '使用关联连接',
    'Connect using Sequence/MessageFlow or Association': '使用顺序/消息流或关联连接',
    'Connect using DataInputAssociation': '使用数据输入关联连接',
    'Remove': '删除',
    'Create {type}': '创建 {type}',
    'Create StartEvent': '创建开始事件',
    'Create EndEvent': '创建结束事件',
    'Create Task': '创建任务',
    'Create User Task': '创建用户任务',
    'Create Service Task': '创建服务任务',
    'Create Gateway': '创建网关',
    'Create Exclusive Gateway': '创建排他网关',
    'Create Parallel Gateway': '创建并行网关',
    'Connect to other element': '连接到其他元素',
    'Delete': '删除',
    'Delete element': '删除元素',
    'Edit label': '编辑标签',
    'Exclusive Gateway': '排他网关',
    'Parallel Gateway': '并行网关',
    'StartEvent': '开始事件',
    'EndEvent': '结束事件',
    'Task': '任务',
    'User Task': '用户任务',
    'Service Task': '服务任务',
    'Sub Process': '子流程',
    'Sequence Flow': '顺序流',
    'Association': '关联',
    'Process': '流程',

    'Append gateway': '追加网关',
    'Append end event': '追加结束事件',
    'Append intermediate/boundary event': '追加中间/边界事件',
    'Append task': '追加任务',
    'Append exclusive gateway': '追加排他网关',
    'Append parallel gateway': '追加并行网关',
    'Append inclusive gateway': '追加包容网关',
    'Append call activity': '追加调用活动',
    'Append sub process': '追加子流程',
    'Append text annotation': '追加文本注释',

    'Connect using sequence flow': '使用顺序流连接',
    'Connect using message flow': '使用消息流连接',
    'Connect using association': '使用关联连接',

    'Change element': '更改元素',

    'Create element': '创建元素',
    'Create pool/participant': '创建池/参与者',
    'Create expanded subprocess': '创建展开子流程',
    'Create gateway': '创建网关',
    'Create event': '创建事件',
    'Create task': '创建任务',
    'Create data object': '创建数据对象',
    'Create data store': '创建数据存储',
    'Create group': '创建分组'
}

export default {
    translate: ['value', function(template, replacements) {
        replacements = replacements || {}

        let translated = translations[template]
        if (!translated) {
            translated = template
        }

        Object.keys(replacements).forEach(function(key) {
            translated = translated.replace(new RegExp('\\{' + key + '\\}', 'g'), replacements[key])
        })

        return translated
    }]
}
