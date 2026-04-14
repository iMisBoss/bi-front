<template>
  <div class="portal-components-lib">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-bar">
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/admin/home' }">后台首页</el-breadcrumb-item>
        <el-breadcrumb-item>门户中心</el-breadcrumb-item>
        <el-breadcrumb-item>基础配置</el-breadcrumb-item>
        <el-breadcrumb-item>组件库管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 查询区域 -->
    <div class="search-bar">
      <el-form :model="searchForm" inline size="small">
        <el-form-item label="组件名称">
          <el-input
              v-model="searchForm.name"
              placeholder="请输入组件名称"
              clearable
              style="width: 180px"
              @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="组件分组">
          <el-select v-model="searchForm.group" placeholder="请选择" clearable style="width: 160px">
            <el-option label="基础布局" value="basic" />
            <el-option label="常用功能" value="common" />
            <el-option label="业务联动" value="business" />
            <el-option label="高级组件" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="action-left">
        <el-button size="small" type="primary" @click="handleBatchEnable" :disabled="selectedRows.length === 0">
          批量启用
        </el-button>
        <el-button size="small" @click="handleBatchDisable" :disabled="selectedRows.length === 0">
          批量禁用
        </el-button>
      </div>
      <div class="action-right">
        <el-button size="small" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 核心列表 -->
    <div class="table-container">
      <el-table
          :data="filteredData"
          v-loading="loading"
          stripe
          @selection-change="handleSelectionChange"
          row-key="id"
          :row-class-name="tableRowClassName"
      >
        <el-table-column type="selection" width="50" fixed="left" />

        <el-table-column label="组件图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon :size="24" :color="row.status === 'enabled' ? '#409eff' : '#909399'">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="组件名称" min-width="120" show-overflow-tooltip />

        <el-table-column label="组件分组" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="groupTagType(row.group)" size="small">
              {{ groupLabel(row.group) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="排序号" width="100" align="center">
          <template #default="{ row }">
            <el-input-number
                v-model="row.sort"
                :min="0"
                :max="999"
                size="small"
                controls-position="right"
                style="width: 80px"
                @change="handleSortChange(row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="组件状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="组件类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'system' ? '' : 'warning'" size="small" effect="plain">
              {{ row.type === 'system' ? '系统内置' : '自定义' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button
                size="small"
                :type="row.status === 'enabled' ? 'danger' : 'success'"
                link
                @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar">
        <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
        v-model="editDialog.visible"
        title="编辑组件"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="90px"
          size="default"
      >
        <el-form-item label="组件名称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入组件名称" />
        </el-form-item>
        <el-form-item label="组件编码" prop="code">
          <el-input v-model="editForm.code" disabled />
        </el-form-item>
        <el-form-item label="组件图标" prop="icon">
          <el-input v-model="editForm.icon" disabled />
        </el-form-item>
        <el-form-item label="组件分组" prop="group">
          <el-select v-model="editForm.group" placeholder="请选择组件分组" style="width: 100%">
            <el-option label="基础布局" value="basic" />
            <el-option label="常用功能" value="common" />
            <el-option label="业务联动" value="business" />
            <el-option label="高级组件" value="advanced" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number
              v-model="editForm.sort"
              :min="0"
              :max="999"
              controls-position="right"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="组件状态" prop="status">
          <el-radio-group v-model="editForm.status">
            <el-radio value="enabled">启用</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Grid, List, Document, Coin, Calendar,
  CircleCheck, Check, Upload, Picture, Location,
  User, OfficeBuilding, Files, Box, Notebook
} from '@element-plus/icons-vue'

const loading = ref(false)
const saving = ref(false)
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  name: '',
  group: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 组件库数据（模拟数据，实际应从接口获取）
const componentData = ref([
  { id: 1, name: '1列栅格', code: 'grid_1', icon: 'Grid', group: 'basic', sort: 1, status: 'enabled', type: 'system' },
  { id: 2, name: '2列栅格', code: 'grid_2', icon: 'Grid', group: 'basic', sort: 2, status: 'enabled', type: 'system' },
  { id: 3, name: '3列栅格', code: 'grid_3', icon: 'Grid', group: 'basic', sort: 3, status: 'enabled', type: 'system' },
  { id: 4, name: '4列栅格', code: 'grid_4', icon: 'Grid', group: 'basic', sort: 4, status: 'enabled', type: 'system' },
  { id: 5, name: '卡片容器', code: 'card', icon: 'Files', group: 'basic', sort: 5, status: 'enabled', type: 'system' },
  { id: 6, name: '分割线', code: 'divider', icon: 'Document', group: 'basic', sort: 6, status: 'enabled', type: 'system' },
  { id: 7, name: '空白占位', code: 'blank', icon: 'Box', group: 'basic', sort: 7, status: 'enabled', type: 'system' },
  { id: 8, name: '单行文本', code: 'input', icon: 'Edit', group: 'common', sort: 8, status: 'enabled', type: 'system' },
  { id: 9, name: '多行文本', code: 'textarea', icon: 'Document', group: 'common', sort: 9, status: 'enabled', type: 'system' },
  { id: 10, name: '数字输入', code: 'number', icon: 'Coin', group: 'common', sort: 10, status: 'enabled', type: 'system' },
  { id: 11, name: '下拉选择', code: 'select', icon: 'CircleCheck', group: 'common', sort: 11, status: 'enabled', type: 'system' },
  { id: 12, name: '单选框组', code: 'radio', icon: 'Check', group: 'common', sort: 12, status: 'enabled', type: 'system' },
  { id: 13, name: '复选框组', code: 'checkbox', icon: 'Check', group: 'common', sort: 13, status: 'enabled', type: 'system' },
  { id: 14, name: '日期选择', code: 'date', icon: 'Calendar', group: 'common', sort: 14, status: 'enabled', type: 'system' },
  { id: 15, name: '人员选择器', code: 'userSelect', icon: 'User', group: 'common', sort: 15, status: 'enabled', type: 'system' },
  { id: 16, name: '部门选择器', code: 'deptSelect', icon: 'OfficeBuilding', group: 'common', sort: 16, status: 'enabled', type: 'system' },
  { id: 17, name: '附件上传', code: 'upload', icon: 'Upload', group: 'common', sort: 17, status: 'enabled', type: 'system' },
  { id: 18, name: '图片上传', code: 'image', icon: 'Picture', group: 'common', sort: 18, status: 'enabled', type: 'system' },
  { id: 19, name: '地址选择', code: 'address', icon: 'Location', group: 'common', sort: 19, status: 'enabled', type: 'system' },
  { id: 20, name: '组织架构选择', code: 'orgSelect', icon: 'OfficeBuilding', group: 'business', sort: 20, status: 'enabled', type: 'system' },
  { id: 21, name: '金额输入', code: 'money', icon: 'Coin', group: 'business', sort: 21, status: 'enabled', type: 'system' },
  { id: 22, name: '签名控件', code: 'signature', icon: 'Edit', group: 'business', sort: 22, status: 'enabled', type: 'system' },
  { id: 23, name: '明细表格', code: 'detailTable', icon: 'List', group: 'business', sort: 23, status: 'enabled', type: 'system' },
  { id: 24, name: '关联数据', code: 'relation', icon: 'Connection', group: 'business', sort: 24, status: 'enabled', type: 'system' },
  { id: 25, name: 'IFRAME嵌入', code: 'iframe', icon: 'Monitor', group: 'advanced', sort: 25, status: 'disabled', type: 'system' },
  { id: 26, name: '自定义HTML', code: 'customHtml', icon: 'Code', group: 'advanced', sort: 26, status: 'disabled', type: 'system' },
  { id: 27, name: '数据图表', code: 'chart', icon: 'TrendCharts', group: 'advanced', sort: 27, status: 'enabled', type: 'system' },
  { id: 28, name: '地图组件', code: 'map', icon: 'MapLocation', group: 'advanced', sort: 28, status: 'enabled', type: 'system' },
  { id: 29, name: '富文本编辑器', code: 'richText', icon: 'EditPen', group: 'advanced', sort: 29, status: 'enabled', type: 'system' },
  { id: 30, name: '轮播图', code: 'carousel', icon: 'PictureFilled', group: 'advanced', sort: 30, status: 'enabled', type: 'system' }
])

// 过滤后的数据
const filteredData = computed(() => {
  let data = [...componentData.value]

  // 名称搜索
  if (searchForm.name) {
    data = data.filter(item => item.name.includes(searchForm.name))
  }

  // 分组筛选
  if (searchForm.group) {
    data = data.filter(item => item.group === searchForm.group)
  }

  // 排序
  data.sort((a, b) => a.sort - b.sort)

  // 分页
  pagination.total = data.length
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize

  return data.slice(start, end)
})

// 编辑表单
const editFormRef = ref(null)
const editDialog = reactive({
  visible: false
})
const editForm = reactive({
  id: null,
  name: '',
  code: '',
  icon: '',
  group: '',
  sort: 0,
  status: 'enabled'
})

const editRules = {
  name: [{ required: true, message: '请输入组件名称', trigger: 'blur' }],
  group: [{ required: true, message: '请选择组件分组', trigger: 'change' }],
  sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }],
  status: [{ required: true, message: '请选择组件状态', trigger: 'change' }]
}

// 分组标签类型
const groupTagType = (group) => {
  const typeMap = {
    basic: 'primary',
    common: 'success',
    business: 'warning',
    advanced: 'danger'
  }
  return typeMap[group] || ''
}

// 分组标签文本
const groupLabel = (group) => {
  const labelMap = {
    basic: '基础布局',
    common: '常用功能',
    business: '业务联动',
    advanced: '高级组件'
  }
  return labelMap[group] || group
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  return row.status === 'disabled' ? 'disabled-row' : ''
}

// 查询
const handleSearch = () => {
  pagination.currentPage = 1
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.group = ''
  pagination.currentPage = 1
}

// 刷新
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 500)
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 批量启用
const handleBatchEnable = () => {
  ElMessageBox.confirm(`确定要启用选中的 ${selectedRows.value.length} 个组件吗？`, '批量启用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'enabled'
    })
    ElMessage.success('批量启用成功，门户设计器将同步显示这些组件')
    selectedRows.value = []
  }).catch(() => {})
}

// 批量禁用
const handleBatchDisable = () => {
  ElMessageBox.confirm(`确定要禁用选中的 ${selectedRows.value.length} 个组件吗？`, '批量禁用', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 检查是否禁用了所有组件
    const enabledCount = componentData.value.filter(item => item.status === 'enabled').length
    const willDisable = selectedRows.value.filter(item => item.status === 'enabled').length

    if (enabledCount - willDisable === 0) {
      ElMessage.error('至少需要保留1个可用组件，操作已取消')
      return
    }

    selectedRows.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功，门户设计器将自动隐藏这些组件')
    selectedRows.value = []
  }).catch(() => {})
}

// 编辑
const handleEdit = (row) => {
  Object.assign(editForm, row)
  editDialog.visible = true
}

// 保存
const handleSave = async () => {
  if (!editFormRef.value) return

  await editFormRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        const index = componentData.value.findIndex(item => item.id === editForm.id)
        if (index !== -1) {
          componentData.value[index] = { ...editForm }
        }
        saving.value = false
        editDialog.visible = false
        ElMessage.success('保存成功，门户设计器刷新后生效')
      }, 500)
    }
  })
}

// 切换状态
const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'

  ElMessageBox.confirm(`确定要${action}「${row.name}」组件吗？`, `${action}确认`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 检查是否禁用了所有组件
    if (action === '禁用') {
      const enabledCount = componentData.value.filter(item => item.status === 'enabled' && item.id !== row.id).length
      if (enabledCount === 0) {
        ElMessage.error('至少需要保留1个可用组件，操作已取消')
        return
      }
    }

    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功，门户设计器将${row.status === 'enabled' ? '显示' : '隐藏'}该组件`)
  }).catch(() => {})
}

// 排序变化
const handleSortChange = (row) => {
  ElMessage.success('排序已更新，门户设计器刷新后生效')
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
}

const handleCurrentChange = (page) => {
  pagination.currentPage = page
}

onMounted(() => {
  // 初始加载
})
</script>

<style scoped lang="scss">
.portal-components-lib {
  height: 100%;
  background: #f0f2f5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .breadcrumb-bar {
    background: #fff;
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    :deep(.el-breadcrumb__item) {
      font-size: 13px;
    }
  }

  .search-bar {
    background: #fff;
    padding: 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);

    :deep(.el-form) {
      margin-bottom: 0;
    }
  }

  .action-bar {
    background: #fff;
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .action-left,
    .action-right {
      display: flex;
      gap: 8px;
    }
  }

  .table-container {
    background: #fff;
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-table) {
      flex: 1;

      .disabled-row {
        background-color: #fafafa;

        td {
          color: #c0c4cc;
        }
      }
    }

    .pagination-bar {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
