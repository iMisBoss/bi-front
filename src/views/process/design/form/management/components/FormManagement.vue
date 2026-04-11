<!-- src/views/process/design/form/management/FormManagement.vue -->
<template>
  <div class="form-management-tab">
    <!-- 搜索区 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline>
        <el-form-item label="表单名称">
          <el-input
              v-model="searchForm.formName"
              placeholder="请输入表单名称"
              clearable
              style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="表单分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 150px">
            <el-option label="人事类" value="hr" />
            <el-option label="财务类" value="finance" />
            <el-option label="行政类" value="admin" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" plain @click="$emit('batch-import')">
          <el-icon><Upload /></el-icon>
          导入表单
        </el-button>
        <el-button type="warning" plain @click="$emit('batch-export', selectedForms)">
          <el-icon><Download /></el-icon>
          导出表单
        </el-button>
        <el-button type="primary" @click="$emit('add')">
          <el-icon><Plus /></el-icon>
          新增表单
        </el-button>
        <el-button
            v-if="selectedForms.length > 0"
            type="success"
            plain
            @click="$emit('batch-toggle-status', selectedForms)"
        >
          <el-icon><CircleCheck /></el-icon>
          批量启用
        </el-button>
        <el-button
            v-if="selectedForms.length > 0"
            type="warning"
            plain
            @click="$emit('batch-disable', selectedForms)"
        >
          <el-icon><CircleClose /></el-icon>
          批量禁用
        </el-button>
        <el-button
            v-if="selectedForms.length > 0"
            type="danger"
            plain
            @click="$emit('batch-delete', selectedForms)"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="total-count">
          共 {{ filteredList.length }} 条记录
          <span v-if="selectedForms.length > 0" class="selected-count">
            （已选 {{ selectedForms.length }} 条）
          </span>
        </span>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="paginatedList"
        border
        stripe
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="formName" label="表单名称" min-width="180" show-overflow-tooltip />
      <el-table-column prop="category" label="表单分类" width="120" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getCategoryType(row.category)">{{ getCategoryLabel(row.category) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fieldCount" label="字段数量" width="100" align="center" />
      <el-table-column prop="boundFlowCount" label="绑定流程数" width="110" align="center">
        <template #default="{ row }">
          <span class="flow-count">{{ row.boundFlowCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="launchCount" label="发起次数" width="100" align="center">
        <template #default="{ row }">
          <span class="launch-count">{{ row.launchCount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="表单状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="表单说明" min-width="200" show-overflow-tooltip />
      <el-table-column prop="creator" label="创建人" width="120" align="center" />
      <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
      <el-table-column label="操作" width="240" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" @click="$emit('preview', row)">
              <el-icon><View /></el-icon>
              预览
            </el-button>
            <el-button size="small" type="primary" @click="$emit('edit', row)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-dropdown @command="(command) => handleMoreAction(command, row)" trigger="click">
              <el-button size="small" type="info" plain>
                更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="bind-flow">
                    <el-icon><Connection /></el-icon>
                    绑定流程
                  </el-dropdown-item>
                  <el-dropdown-item command="save-as-template">
                    <el-icon><CopyDocument /></el-icon>
                    保存为模板
                  </el-dropdown-item>
                  <el-dropdown-item command="toggle-status" :divided="true">
                    <el-icon>
                      <CircleClose v-if="row.status === 'enabled'" />
                      <CircleCheck v-else />
                    </el-icon>
                    {{ row.status === 'enabled' ? '禁用' : '启用' }}
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" :divided="true" style="color: #f56c6c;">
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页栏 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredList.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Edit, Delete, View, CircleCheck, CircleClose, Upload, Download, Connection, CopyDocument, ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  formList: {
    type: Array,
    required: true
  },
  searchForm: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:searchForm',
  'search',
  'reset',
  'selection-change',
  'preview',
  'edit',
  'bind-flow',
  'save-as-template',
  'toggle-status',
  'delete',
  'batch-import',
  'batch-export',
  'batch-toggle-status',
  'batch-disable',
  'batch-delete',
  'add'
])
const pagination = ref({
  currentPage: 1,
  pageSize: 10
})

const selectedForms = ref([])

// 过滤后的列表
const filteredList = computed(() => {
  let result = [...props.formList]

  if (props.searchForm.formName) {
    const keyword = props.searchForm.formName.toLowerCase()
    result = result.filter(f => f.formName.toLowerCase().includes(keyword))
  }

  if (props.searchForm.category) {
    result = result.filter(f => f.category === props.searchForm.category)
  }

  if (props.searchForm.status) {
    result = result.filter(f => f.status === props.searchForm.status)
  }

  return result
})

// 分页后的列表
const paginatedList = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredList.value.slice(start, end)
})

// 获取分类标签类型
const getCategoryType = (category) => {
  const typeMap = {
    hr: '',
    finance: 'warning',
    admin: 'success',
    other: 'info'
  }
  return typeMap[category] || ''
}

// 获取分类标签文本
const getCategoryLabel = (category) => {
  const labelMap = {
    hr: '人事类',
    finance: '财务类',
    admin: '行政类',
    other: '其他'
  }
  return labelMap[category] || category
}

// 更多操作
const handleMoreAction = (command, row) => {
  switch (command) {
    case 'bind-flow':
      emit('bind-flow', row)
      break
    case 'save-as-template':
      emit('save-as-template', row)
      break
    case 'toggle-status':
      handleToggleStatus(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 查询
const handleSearch = () => {
  pagination.value.currentPage = 1
  emit('search')
}

// 重置
const handleReset = () => {
  pagination.value.currentPage = 1
  emit('reset')
}

// 选择变化
const handleSelectionChange = (rows) => {
  selectedForms.value = rows
  emit('selection-change', rows)
}

// 启用/禁用
const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  const message = row.status === 'enabled'
      ? `禁用后用户将无法发起该表单，是否确认${action}「${row.formName}」？`
      : `是否确认${action}「${row.formName}」？`

  ElMessageBox.confirm(
      message,
      `确认${action}`,
      {
        confirmButtonText: `确认${action}`,
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    emit('toggle-status', row)
  }).catch(() => {})
}

// 删除
const handleDelete = (row) => {
  if (row.launchCount > 0) {
    ElMessageBox.confirm(
        `该表单已被发起 ${row.launchCount} 次，删除后将无法恢复。建议先禁用表单，是否确认删除？`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      emit('delete', row)
    }).catch(() => {})
  } else {
    ElMessageBox.confirm(
        `确定要删除表单「${row.formName}」吗？删除后无法恢复。`,
        '删除确认',
        {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      emit('delete', row)
    }).catch(() => {})
  }
}

// 分页
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handlePageChange = (page) => {
  pagination.value.currentPage = page
}
</script>

<style scoped lang="scss">
.form-management-tab {
  .search-bar {
    padding: 16px 20px;
    margin-bottom: 16px;
    background: #f5f7fa;
    border-radius: 8px;

    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 16px;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px 0;

    .toolbar-left {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .toolbar-right {
      .total-count {
        font-size: 13px;
        color: #909399;

        .selected-count {
          color: #667eea;
          font-weight: 600;
          margin-left: 4px;
        }
      }
    }
  }

  :deep(.el-table) {
    border-radius: 8px;
    overflow: hidden;

    .el-table__header th {
      background: #fafafa;
      font-weight: 600;
      color: #303133;
    }

    .use-count,
    .flow-count,
    .launch-count {
      font-weight: 600;
      color: #667eea;
    }
  }

  :deep(.el-table__cell) {
    .action-buttons {
      display: flex !important;
      gap: 6px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
      white-space: nowrap !important;
      min-width: 220px;

      .el-button {
        margin: 0 !important;
        padding: 5px 10px;
        white-space: nowrap !important;
        font-size: 12px;
        flex-shrink: 0;
      }

      :deep(.el-dropdown) {
        flex-shrink: 0;

        .el-button {
          padding: 5px 10px;
        }
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
  }
}
</style>
