<template>
  <div class="number-rule-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>公文管理</el-breadcrumb-item>
      <el-breadcrumb-item>文号规则管理</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="main-card" shadow="never">
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleAdd" icon="Plus">新增规则</el-button>
          <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
        </div>
      </div>

      <el-table
          :data="ruleData"
          border
          row-key="id"
          :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
          style="flex: 1"
      >
        <el-table-column prop="name" label="规则名称" min-width="150" />
        <el-table-column prop="prefix" label="文号前缀" width="120" />
        <el-table-column prop="yearFormat" label="年份格式" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.yearFormat === 'full' ? '2026' : '26' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="serialDigits" label="流水号位数" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.serialDigits }}位</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applyType" label="适用公文类型" width="150" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button
                link
                :type="row.status === 'enabled' ? 'warning' : 'success'"
                size="small"
                @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
            :total="ruleData.length"
            :page-size="10"
            layout="total, prev, pager, next"
        />
      </div>
    </el-card>

    <NumberRuleDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentRule"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import NumberRuleDrawer from './components/NumberRuleDrawer.vue'

const currentRule = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)
const ruleData = ref([])

onMounted(() => {
  loadRuleData()
})

const loadRuleData = () => {
  ruleData.value = [
    { id: 1, name: '公司发文规则', prefix: '公司发', yearFormat: 'full', serialDigits: 3, applyType: '发文', status: 'enabled' },
    { id: 2, name: '技术部发文规则', prefix: '技术发', yearFormat: 'short', serialDigits: 3, applyType: '发文', status: 'enabled' },
    { id: 3, name: '收文登记规则', prefix: '收字', yearFormat: 'full', serialDigits: 4, applyType: '收文', status: 'enabled' },
    { id: 4, name: '通知规则', prefix: '通知', yearFormat: 'short', serialDigits: 3, applyType: '通知', status: 'disabled' }
  ]
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentRule.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentRule.value = { ...row }
  showDrawer.value = true
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}规则「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除规则「${row.name}」吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ruleData.value = ruleData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleRefresh = () => {
  loadRuleData()
  ElMessage.success('刷新成功')
}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = ruleData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      ruleData.value[index] = { ...ruleData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    ruleData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
}
</script>

<style lang="scss" scoped>
.number-rule-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .main-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 8px;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 16px;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left {
      display: flex;
      gap: 8px;
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
