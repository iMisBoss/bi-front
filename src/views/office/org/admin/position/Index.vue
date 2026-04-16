<template>
  <div class="job-level-page">
    <el-card class="main-card" shadow="never">
      <!-- 顶部工具栏 -->
      <JobToolbar
          :selected-count="selectedRows.length"
          :active-tab="activeTab"
          @batch-enable="handleBatchEnable"
          @batch-disable="handleBatchDisable"
          @batch-delete="handleBatchDelete"
          @export="handleExport"
          @add="handleAdd"
          @import="showImportDialog = true"
          @refresh="handleRefresh"
          @copy="handleCopy"
          @search="handleSearch"
          @filter="handleFilter"
      />

      <!-- Tab切换 -->
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="content-tabs">
        <!-- Tab1: 职级管理 -->
        <el-tab-pane label="职级管理" name="level">
          <LevelManagement
              ref="levelRef"
              :table-data="filteredLevelData"
              @selection-change="handleSelectionChange"
              @edit="handleEdit"
              @view="handleView"
              @delete="handleDelete"
              @toggle-status="handleToggleStatus"
          />
        </el-tab-pane>

        <!-- Tab2: 职务管理 -->
        <el-tab-pane label="职务管理" name="position">
          <PositionManagement
              ref="positionRef"
              :table-data="filteredPositionData"
              :level-options="levelOptions"
              @selection-change="handleSelectionChange"
              @edit="handleEdit"
              @view="handleView"
              @delete="handleDelete"
              @toggle-status="handleToggleStatus"
          />
        </el-tab-pane>
      </el-tabs>

      <!-- 底部分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑抽屉 -->
    <JobDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentData"
        :level-options="levelOptions"
        @confirm="handleConfirmSave"
    />

    <!-- 导入对话框 -->
    <JobImportDialog
        v-model="showImportDialog"
        :type="activeTab"
        @download-template="downloadTemplate"
        @confirm-import="handleConfirmImport"
    />

    <!-- 查看详情抽屉 -->
    <JobDetailDrawer
        v-model="showDetailDrawer"
        :data="currentData"
        :type="activeTab"
        @edit="handleEdit"
        @toggle-status="handleToggleStatus"
        @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import JobToolbar from './components/JobToolbar.vue'
import LevelManagement from './components/LevelManagement.vue'
import PositionManagement from './components/PositionManagement.vue'
import JobDrawer from './components/JobDrawer.vue'
import JobImportDialog from './components/JobImportDialog.vue'
import JobDetailDrawer from './components/JobDetailDrawer.vue'

const activeTab = ref('level')
const selectedRows = ref([])
const currentData = ref(null)
const drawerType = ref('add') // add, edit
const showDrawer = ref(false)
const showImportDialog = ref(false)
const showDetailDrawer = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const levelFilter = ref('')
const statusFilter = ref('')

// 职级数据
const levelData = ref([])
// 职务数据
const positionData = ref([])

// 职级选项（用于职务关联）
const levelOptions = computed(() => {
  return levelData.value
      .filter(item => item.status === 'enabled')
      .map(item => ({
        label: item.name,
        value: item.id
      }))
})

// 过滤后的职级数据
const filteredLevelData = computed(() => {
  let data = [...levelData.value]

  if (searchKeyword.value && activeTab.value === 'level') {
    data = data.filter(item =>
        item.name?.includes(searchKeyword.value) ||
        item.code?.includes(searchKeyword.value)
    )
  }

  if (levelFilter.value && activeTab.value === 'level') {
    data = data.filter(item => item.level === levelFilter.value)
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  return data
})

// 过滤后的职务数据
const filteredPositionData = computed(() => {
  let data = [...positionData.value]

  if (searchKeyword.value && activeTab.value === 'position') {
    data = data.filter(item =>
        item.name?.includes(searchKeyword.value) ||
        item.code?.includes(searchKeyword.value)
    )
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  return data
})

onMounted(() => {
  loadLevelData()
  loadPositionData()
})

// 加载职级数据
const loadLevelData = () => {
  levelData.value = [
    {
      id: 1,
      name: '专员',
      code: 'LEVEL-001',
      level: '基层',
      salaryGrade: 'P1',
      approvalLimit: 5000,
      sort: 1,
      status: 'enabled',
      memberCount: 45,
      description: '基础执行层'
    },
    {
      id: 2,
      name: '主管',
      code: 'LEVEL-002',
      level: '中层',
      salaryGrade: 'P3',
      approvalLimit: 20000,
      sort: 2,
      status: 'enabled',
      memberCount: 20,
      description: '团队管理层'
    },
    {
      id: 3,
      name: '经理',
      code: 'LEVEL-003',
      level: '中层',
      salaryGrade: 'M1',
      approvalLimit: 50000,
      sort: 3,
      status: 'enabled',
      memberCount: 12,
      description: '部门管理层'
    },
    {
      id: 4,
      name: '总监',
      code: 'LEVEL-004',
      level: '高层',
      salaryGrade: 'M3',
      approvalLimit: 200000,
      sort: 4,
      status: 'enabled',
      memberCount: 5,
      description: '事业部管理层'
    },
    {
      id: 5,
      name: '总经理',
      code: 'LEVEL-005',
      level: '高管',
      salaryGrade: 'E1',
      approvalLimit: 1000000,
      sort: 5,
      status: 'enabled',
      memberCount: 2,
      description: '公司决策层'
    }
  ]
  updateTotal()
}

// 加载职务数据
const loadPositionData = () => {
  positionData.value = [
    {
      id: 1,
      name: '前端开发工程师',
      code: 'POS-001',
      levelId: 2,
      levelName: '主管',
      sequence: '技术序列',
      sort: 1,
      status: 'enabled',
      memberCount: 8,
      department: '技术部'
    },
    {
      id: 2,
      name: '后端开发工程师',
      code: 'POS-002',
      levelId: 2,
      levelName: '主管',
      sequence: '技术序列',
      sort: 2,
      status: 'enabled',
      memberCount: 12,
      department: '技术部'
    },
    {
      id: 3,
      name: '产品经理',
      code: 'POS-003',
      levelId: 3,
      levelName: '经理',
      sequence: '产品序列',
      sort: 3,
      status: 'enabled',
      memberCount: 5,
      department: '产品部'
    },
    {
      id: 4,
      name: '财务专员',
      code: 'POS-004',
      levelId: 1,
      levelName: '专员',
      sequence: '职能序列',
      sort: 4,
      status: 'enabled',
      memberCount: 6,
      department: '财务部'
    },
    {
      id: 5,
      name: '人事经理',
      code: 'POS-005',
      levelId: 3,
      levelName: '经理',
      sequence: '职能序列',
      sort: 5,
      status: 'disabled',
      memberCount: 0,
      department: '人事部'
    }
  ]
  updateTotal()
}

// 更新总数
const updateTotal = () => {
  total.value = activeTab.value === 'level' ? levelData.value.length : positionData.value.length
}

// ==================== 事件处理 ====================

// Tab切换
const handleTabChange = (tab) => {
  selectedRows.value = []
  searchKeyword.value = ''
  levelFilter.value = ''
  statusFilter.value = ''
  updateTotal()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 新增
const handleAdd = () => {
  drawerType.value = 'add'
  currentData.value = null
  showDrawer.value = true
}

// 编辑
const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentData.value = { ...row }
  showDrawer.value = true
  showDetailDrawer.value = false
}

// 查看
const handleView = (row) => {
  currentData.value = row
  showDetailDrawer.value = true
}

// 删除
const handleDelete = (row) => {
  const typeName = activeTab.value === 'level' ? '职级' : '职务'

  if (row.memberCount > 0) {
    ElMessageBox.alert(
        `该${typeName}下存在 ${row.memberCount} 名员工，无法删除。请先将人员调动至其他${typeName}后再删除。`,
        '删除失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  ElMessageBox.confirm(
      `确定要删除该${typeName}吗？删除后不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    if (activeTab.value === 'level') {
      levelData.value = levelData.value.filter(item => item.id !== row.id)
    } else {
      positionData.value = positionData.value.filter(item => item.id !== row.id)
    }
    ElMessage.success('删除成功')
    updateTotal()
  })
}

// 切换状态
const handleToggleStatus = (row) => {
  const typeName = activeTab.value === 'level' ? '职级' : '职务'

  if (row.status === 'enabled' && row.memberCount > 0) {
    ElMessageBox.alert(
        `该${typeName}下存在 ${row.memberCount} 名在职员工，无法禁用。请先将人员调动后再禁用。`,
        '禁用失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}该${typeName}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  })
}

// 复制
const handleCopy = (row) => {
  drawerType.value = 'add'
  currentData.value = {
    ...row,
    id: null,
    name: `${row.name}(副本)`,
    code: ''
  }
  showDrawer.value = true
}

// 确认保存
const handleConfirmSave = (formData) => {
  if (formData.id) {
    // 编辑模式
    if (activeTab.value === 'level') {
      const index = levelData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        levelData.value[index] = { ...levelData.value[index], ...formData }
      }
    } else {
      const index = positionData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        positionData.value[index] = { ...positionData.value[index], ...formData }
      }
    }
    ElMessage.success('编辑成功')
  } else {
    // 新增模式
    formData.id = Date.now()
    if (activeTab.value === 'level') {
      levelData.value.push(formData)
    } else {
      positionData.value.push(formData)
    }
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
  updateTotal()
}

// 批量启用
const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
      `确定要批量启用 ${selectedRows.value.length} 条数据吗？`,
      '批量启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'enabled'
    })
    ElMessage.success('批量启用成功')
    selectedRows.value = []
  })
}

// 批量禁用
const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return

  const invalidRows = selectedRows.value.filter(row => row.memberCount > 0)

  if (invalidRows.length > 0) {
    const names = invalidRows.map(row => row.name).join('、')
    ElMessageBox.alert(
        `以下数据存在绑定人员，无法禁用：${names}`,
        '批量禁用失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  ElMessageBox.confirm(
      `确定要批量禁用 ${selectedRows.value.length} 条数据吗？`,
      '批量禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return

  const invalidRows = selectedRows.value.filter(row => row.memberCount > 0)

  if (invalidRows.length > 0) {
    const names = invalidRows.map(row => row.name).join('、')
    ElMessageBox.alert(
        `以下数据存在绑定人员，无法删除：${names}`,
        '批量删除失败',
        {
          confirmButtonText: '知道了',
          type: 'warning'
        }
    )
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？删除后不可恢复！`,
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
  ).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    if (activeTab.value === 'level') {
      levelData.value = levelData.value.filter(item => !ids.includes(item.id))
    } else {
      positionData.value = positionData.value.filter(item => !ids.includes(item.id))
    }
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    updateTotal()
  })
}

// 导出
const handleExport = () => {
  ElMessage.success(`${activeTab.value === 'level' ? '职级' : '职务'}数据导出成功`)
}

// 刷新
const handleRefresh = () => {
  if (activeTab.value === 'level') {
    loadLevelData()
  } else {
    loadPositionData()
  }
  ElMessage.success('刷新成功')
}

// 搜索和筛选
const handleSearch = () => {}
const handleFilter = () => {}

// 分页
const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 导入
const downloadTemplate = () => {
  ElMessage.success('模板下载成功')
}

const handleConfirmImport = () => {
  ElMessage.success('导入成功')
  showImportDialog.value = false
  if (activeTab.value === 'level') {
    loadLevelData()
  } else {
    loadPositionData()
  }
}
</script>

<style lang="scss" scoped>
.job-level-page {
  padding: 20px;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

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

  .content-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
      padding-bottom: 0;
      border-bottom: 1px solid #ebeef5;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      display: flex;
      flex-direction: column;
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
