<template>
  <div class="function-permission">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="authTarget" @change="handleTargetChange">
          <el-radio label="role">按角色授权</el-radio>
          <el-radio label="department">按部门授权</el-radio>
          <el-radio label="user">按人员授权</el-radio>
        </el-radio-group>

        <el-select
            v-model="selectedTarget"
            :placeholder="`请选择${authTargetLabel}`"
            clearable
            style="width: 240px; margin-left: 16px"
            @change="handleTargetSelect"
        >
          <el-option
              v-for="item in authTargetData"
              :key="item.id"
              :label="item.name"
              :value="item.id"
          />
        </el-select>

        <el-tag v-if="currentAuthTarget" type="primary" style="margin-left: 12px">
          当前配置：{{ currentAuthTarget.name }}
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button type="primary" @click="handleBatchAuth" :disabled="selectedRows.length === 0">批量授权</el-button>
          <el-button type="warning" @click="handleBatchRevoke" :disabled="selectedRows.length === 0">批量回收</el-button>
        </el-button-group>
        <el-button @click="handleExport" icon="Download">导出</el-button>
        <el-button @click="showQueryDialog = true" icon="Search">权限查询</el-button>
      </div>
    </div>

    <!-- AI功能权限矩阵 -->
    <el-table :data="aiFunctionList" border style="flex: 1">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="AI功能" min-width="200" />
      <el-table-column prop="description" label="说明" min-width="250" show-overflow-tooltip />
      <el-table-column label="使用权限" width="200" align="center">
        <template #default="{ row }">
          <el-select v-model="row.permission" size="small" style="width: 120px">
            <el-option label="仅查看" value="view" />
            <el-option label="可使用" value="use" />
            <el-option label="高级使用" value="advanced" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="启用" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" />
        </template>
      </el-table-column>
    </el-table>

    <div class="table-footer">
      <el-alert
          title="提示：权限变更实时生效，所有操作将记录审计日志"
          type="info"
          :closable="false"
          style="flex: 1"
      />
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>

    <!-- 权限查询对话框 -->
    <el-dialog v-model="showQueryDialog" title="AI权限查询" width="600px">
      <el-form label-width="100px">
        <el-form-item label="人员姓名">
          <el-input v-model="queryUserName" placeholder="输入姓名查询" clearable />
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleQuery">查询</el-button>

      <el-table v-if="queryResult" :data="queryResult" border style="margin-top: 20px">
        <el-table-column prop="function" label="AI功能" />
        <el-table-column prop="permission" label="权限" align="center" />
        <el-table-column prop="grantedTime" label="授权时间" width="160" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const authTarget = ref('role')
const selectedTarget = ref('')
const currentAuthTarget = ref(null)
const selectedRows = ref([])
const showQueryDialog = ref(false)
const queryUserName = ref('')
const queryResult = ref(null)

const aiFunctionList = ref([
  { id: 1, name: '智能问答', description: '基于企业知识库的智能问答服务', permission: 'use', enabled: true },
  { id: 2, name: '文档内容总结', description: '自动提取文档核心要点，生成摘要', permission: 'use', enabled: true },
  { id: 3, name: '公告/制度文案生成', description: '智能生成公告、制度等公文内容', permission: 'advanced', enabled: true },
  { id: 4, name: '流程咨询助手', description: '解答OA流程使用问题，提供操作指导', permission: 'use', enabled: true },
  { id: 5, name: '知识库智能检索', description: '自然语言检索企业知识库内容', permission: 'advanced', enabled: true }
])

const authTargetData = computed(() => {
  if (authTarget.value === 'role') {
    return [
      { id: 1, name: '系统管理员', type: '角色', userCount: 3 },
      { id: 2, name: '部门管理员', type: '角色', userCount: 15 },
      { id: 3, name: '普通员工', type: '角色', userCount: 150 },
      { id: 4, name: '外部访客', type: '角色', userCount: 20 }
    ]
  } else if (authTarget.value === 'department') {
    return [
      { id: 1, name: '公司总部', type: '部门', userCount: 188 },
      { id: 2, name: '技术部', type: '部门', userCount: 45 },
      { id: 3, name: '产品部', type: '部门', userCount: 32 },
      { id: 4, name: '财务部', type: '部门', userCount: 18 },
      { id: 5, name: '行政部', type: '部门', userCount: 25 }
    ]
  } else {
    return [
      { id: 1, name: '张三', type: '人员', userCount: 1 },
      { id: 2, name: '李四', type: '人员', userCount: 1 },
      { id: 3, name: '王五', type: '人员', userCount: 1 }
    ]
  }
})

const authTargetLabel = computed(() => {
  const labels = {
    role: '角色',
    department: '部门',
    user: '人员'
  }
  return labels[authTarget.value]
})

const handleTargetChange = () => {
  selectedTarget.value = ''
  currentAuthTarget.value = null
}

const handleTargetSelect = (value) => {
  currentAuthTarget.value = authTargetData.value.find(item => item.id === value)
}

const handleBatchAuth = () => {
  if (!currentAuthTarget.value) {
    ElMessage.warning('请先选择授权对象')
    return
  }
  ElMessage.success(`已为「${currentAuthTarget.value.name}」批量授权`)
}

const handleBatchRevoke = () => {
  if (!currentAuthTarget.value) {
    ElMessage.warning('请先选择授权对象')
    return
  }
  ElMessage.success(`已回收「${currentAuthTarget.value.name}」的权限`)
}

const handleExport = () => {
  ElMessage.success('权限配置导出成功')
}

const handleSave = () => {
  ElMessage.success('权限配置保存成功')
}

const handleQuery = () => {
  if (!queryUserName.value) {
    ElMessage.warning('请输入人员姓名')
    return
  }
  queryResult.value = [
    { function: '智能问答', permission: '可使用', grantedTime: '2026-04-01' },
    { function: '文档内容总结', permission: '可使用', grantedTime: '2026-04-01' },
    { function: '公告/制度文案生成', permission: '仅查看', grantedTime: '2026-04-05' }
  ]
  ElMessage.success('查询完成')
}
</script>

<style lang="scss" scoped>
.function-permission {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .table-footer {
    margin-top: 16px;
    display: flex;
    gap: 12px;
    align-items: center;
    flex-shrink: 0;
  }
}
</style>
