<template>
  <div class="app-integration">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input v-model="searchKeyword" placeholder="搜索应用名称" clearable style="width: 200px" />
        <el-select v-model="filterType" placeholder="对接类型" clearable style="width: 150px">
          <el-option label="组织人员同步" value="组织人员同步" />
          <el-option label="数据对接" value="数据对接" />
          <el-option label="消息推送" value="消息推送" />
        </el-select>
        <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd" icon="Plus">新增应用</el-button>
      </div>
    </div>

    <!-- 应用列表 -->
    <el-table
        :data="integrations"
        border
        row-key="id"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column prop="name" label="应用名称" min-width="180" />
      <el-table-column prop="type" label="对接类型" width="150" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="url" label="对接地址" min-width="250" show-overflow-tooltip />
      <el-table-column prop="authType" label="鉴权方式" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.authType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="syncCycle" label="同步周期" width="120" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button link type="success" size="small" @click="handleTest(row)">测试</el-button>
          <el-button link :type="row.status === 'enabled' ? 'warning' : 'success'" size="small" @click="handleToggle(row)">
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="integrations.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 应用编辑对话框 -->
    <IntegrationDialog
        v-model="showDialog"
        :type="dialogType"
        :data="currentIntegration"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IntegrationDialog from './IntegrationDialog.vue'

const searchKeyword = ref('')
const filterType = ref('')
const filterStatus = ref('')
const showDialog = ref(false)
const dialogType = ref('add')
const currentIntegration = ref(null)

const integrations = ref([
  { id: 1, name: '人力资源系统对接', type: '组织人员同步', url: 'http://10.0.0.50:8081/api/sync', authType: 'Token', syncCycle: '每小时', status: 'enabled', remark: '同步HR系统的组织架构和人员数据' },
  { id: 2, name: '财务数据对接', type: '数据对接', url: 'http://10.0.0.60:9090/api/data', authType: '密钥', syncCycle: '每日 02:00', status: 'enabled', remark: '同步财务报表和审批数据' },
  { id: 3, name: '钉钉消息推送', type: '消息推送', url: 'https://oapi.dingtalk.com/robot/send', authType: 'Token', syncCycle: '实时', status: 'enabled', remark: '推送审批消息和通知' }
])

const handleAdd = () => {
  dialogType.value = 'add'
  currentIntegration.value = null
  showDialog.value = true
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  currentIntegration.value = { ...row }
  showDialog.value = true
}

const handleTest = (row) => {
  ElMessage.info(`正在测试对接地址：${row.url}`)
}

const handleToggle = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}应用「${row.name}」吗？${action === '禁用' ? '禁用后将停止同步和推送。' : ''}`, `${action}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = integrations.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      integrations.value[index] = { ...integrations.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    formData.status = 'enabled'
    integrations.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDialog.value = false
}
</script>

<style lang="scss" scoped>
.app-integration {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
