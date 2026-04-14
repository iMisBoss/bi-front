<template>
  <div class="function-permission">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="permissionTarget">
          <el-radio label="role">按角色授权</el-radio>
          <el-radio label="department">按部门授权</el-radio>
          <el-radio label="user">按人员授权</el-radio>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button @click="handleBatchGrant" :disabled="selectedRows.length === 0">批量授权</el-button>
        <el-button @click="handleBatchRevoke" :disabled="selectedRows.length === 0">批量回收</el-button>
        <el-button @click="handleQueryPermission" icon="Search">权限查询</el-button>
        <el-button @click="handleExport" icon="Download">导出</el-button>
      </div>
    </div>

    <!-- 权限矩阵表 -->
    <el-table
        :data="permissionData"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="名称" width="200" />
      <el-table-column label="智能问答" width="100" align="center">
        <template #default="{ row }">
          <el-select v-model="row.qa" size="small">
            <el-option label="不可用" value="none" />
            <el-option label="仅查看" value="view" />
            <el-option label="可使用" value="use" />
            <el-option label="高级使用" value="advanced" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="文档总结" width="100" align="center">
        <template #default="{ row }">
          <el-select v-model="row.summary" size="small">
            <el-option label="不可用" value="none" />
            <el-option label="仅查看" value="view" />
            <el-option label="可使用" value="use" />
            <el-option label="高级使用" value="advanced" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="文案生成" width="100" align="center">
        <template #default="{ row }">
          <el-select v-model="row.writing" size="small">
            <el-option label="不可用" value="none" />
            <el-option label="仅查看" value="view" />
            <el-option label="可使用" value="use" />
            <el-option label="高级使用" value="advanced" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="流程咨询" width="100" align="center">
        <template #default="{ row }">
          <el-select v-model="row.assistant" size="small">
            <el-option label="不可用" value="none" />
            <el-option label="仅查看" value="view" />
            <el-option label="可使用" value="use" />
            <el-option label="高级使用" value="advanced" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="知识库检索" width="100" align="center">
        <template #default="{ row }">
          <el-select v-model="row.knowledge" size="small">
            <el-option label="不可用" value="none" />
            <el-option label="仅查看" value="view" />
            <el-option label="可使用" value="use" />
            <el-option label="高级使用" value="advanced" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="特权人员" width="100" align="center">
        <template #default="{ row }">
          <el-switch v-model="row.isPrivileged" />
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-button type="primary" @click="handleSave">保存配置</el-button>
      <span style="margin-left: 16px; color: #909399">提示：未授权人员将无任何AI功能入口</span>
    </div>

    <!-- 权限查询对话框 -->
    <PermissionQueryDialog v-model="showQueryDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PermissionQueryDialog from './PermissionQueryDialog.vue'

const props = defineProps({
  orgData: {
    type: Object,
    default: null
  }
})

const permissionTarget = ref('role')
const selectedRows = ref([])
const showQueryDialog = ref(false)

const permissionData = ref([
  { id: 1, name: '系统管理员', qa: 'advanced', summary: 'advanced', writing: 'advanced', assistant: 'advanced', knowledge: 'advanced', isPrivileged: true },
  { id: 2, name: '部门管理员', qa: 'use', summary: 'use', writing: 'use', assistant: 'use', knowledge: 'use', isPrivileged: false },
  { id: 3, name: '普通员工', qa: 'use', summary: 'view', writing: 'use', assistant: 'view', knowledge: 'view', isPrivileged: false },
  { id: 4, name: '实习生', qa: 'view', summary: 'none', writing: 'view', assistant: 'none', knowledge: 'none', isPrivileged: false }
])

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleBatchGrant = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => {
    row.qa = 'use'
    row.summary = 'use'
    row.writing = 'use'
    row.assistant = 'use'
    row.knowledge = 'use'
  })
  ElMessage.success('批量授权成功')
}

const handleBatchRevoke = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => {
    row.qa = 'none'
    row.summary = 'none'
    row.writing = 'none'
    row.assistant = 'none'
    row.knowledge = 'none'
  })
  ElMessage.success('批量回收成功')
}

const handleQueryPermission = () => {
  showQueryDialog.value = true
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleSave = () => {
  ElMessage.success('权限配置保存成功')
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

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
}
</style>
