<template>
  <div class="template-control">
    <!-- 批量操作区 -->
    <div class="batch-zone">
      <span class="zone-title">全局批量操作</span>
      <div class="zone-actions">
        <el-button size="small" @click="handleBatchEnable">批量启用</el-button>
        <el-button size="small" @click="handleBatchDisable">批量停用</el-button>
        <el-button size="small" @click="handleBatchSync">批量同步分类</el-button>
        <el-divider direction="vertical" />
        <el-button size="small" type="primary" plain @click="handleBatchConfig">批量配置规则</el-button>
      </div>
    </div>

    <!-- 模板列表 -->
    <el-table :data="tableData" border v-loading="loading">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="流程名称" min-width="180" prop="name" />
      <el-table-column label="分类" width="100" align="center" prop="category" />
      <el-table-column label="绑定状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.bindForm ? 'success' : 'danger'">{{ row.bindForm ? '已绑定' : '未绑定' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="运行状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" @change="handleToggleEnabled(row)" />
        </template>
      </el-table-column>
      <el-table-column label="允许发起" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.allowInit" @change="handleSwitchChange(row, 'allowInit')" />
        </template>
      </el-table-column>
      <el-table-column label="允许撤回" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.allowWithdraw" @change="handleSwitchChange(row, 'allowWithdraw')" />
        </template>
      </el-table-column>
      <el-table-column label="审批催办" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.allowUrge" @change="handleSwitchChange(row, 'allowUrge')" />
        </template>
      </el-table-column>
      <el-table-column label="数据归档" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.allowArchive" @change="handleSwitchChange(row, 'allowArchive')" />
        </template>
      </el-table-column>
      <el-table-column label="创建人" width="120" align="center" prop="creator" />
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleLog(row)">操作日志</el-button>
          <el-button size="small" type="info" link @click="handleSync(row)">一键同步</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const tableData = ref([
  { id: 1, name: '请假审批流程', category: '人事类', bindForm: true, enabled: true, allowInit: true, allowWithdraw: true, allowUrge: false, allowArchive: true, creator: '系统管理员' },
  { id: 2, name: '加班审批流程', category: '人事类', bindForm: true, enabled: true, allowInit: true, allowWithdraw: false, allowUrge: true, allowArchive: true, creator: '系统管理员' },
  { id: 3, name: '费用报销流程', category: '财务类', bindForm: false, enabled: false, allowInit: false, allowWithdraw: false, allowUrge: false, allowArchive: false, creator: '财务管理员' }
])

const handleToggleEnabled = (row) => {
  ElMessage.success(`「${row.name}」已${row.enabled ? '启用' : '停用'}`)
}

const handleSwitchChange = (row, field) => {
  const labels = { allowInit: '允许发起', allowWithdraw: '允许撤回', allowUrge: '审批催办', allowArchive: '数据归档' }
  ElMessage.success(`「${row.name}」的${labels[field]}已${row[field] ? '开启' : '关闭'}（实时生效）`)
}

const handleBatchEnable = () => { ElMessage.success('批量启用成功') }
const handleBatchDisable = () => { ElMessage.success('批量停用成功') }
const handleBatchSync = () => { ElMessage.success('批量同步分类成功') }
const handleBatchConfig = () => { ElMessage.info('批量配置规则功能开发中...') }
const handleLog = (row) => { ElMessage.info(`查看「${row.name}」操作日志`) }
const handleSync = (row) => { ElMessage.success(`「${row.name}」配置已同步`) }
</script>

<style scoped lang="scss">
.template-control {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  overflow-y: auto;

  .batch-zone {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    background: #f7f8fa;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    margin-bottom: 16px;

    .zone-title { font-size: 14px; font-weight: 500; color: #1f2329; }
    .zone-actions { display: flex; align-items: center; gap: 8px; }

    :deep(.el-divider--vertical) { margin: 0 6px; height: 18px; }
  }

  :deep(.el-table) { border-radius: 6px; overflow: hidden; }
  :deep(.el-button--link) { font-size: 13px; }
}
</style>
