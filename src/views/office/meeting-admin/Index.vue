<template>
  <div class="meeting-admin-container">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>日常办公管理</el-breadcrumb-item>
      <el-breadcrumb-item>会议管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部操作栏 -->
    <el-card class="toolbar-card" shadow="hover">
      <div class="toolbar-content">
        <div class="toolbar-left">
          <el-button type="primary" @click="handleBatchEnable" :disabled="selectedRows.length === 0">
            批量启用
          </el-button>
          <el-button @click="handleBatchDisable" :disabled="selectedRows.length === 0">
            批量禁用
          </el-button>
          <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">
            批量删除
          </el-button>
          <el-button @click="handleExport">导出</el-button>
        </div>
        <div class="toolbar-right">
          <el-button type="primary" @click="handleAdd">新增</el-button>
          <el-button @click="handleImport">导入</el-button>
          <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
        </div>
      </div>

      <!-- 搜索筛选区 -->
      <div class="search-bar">
        <el-input
            v-model="searchForm.keyword"
            placeholder="搜索会议室名称、位置"
            style="width: 240px; margin-right: 12px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
            v-model="searchForm.status"
            placeholder="状态筛选"
            style="width: 120px; margin-right: 12px"
            clearable
            @change="handleSearch"
        >
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button type="primary" @click="handleSearch" icon="Search">查询</el-button>
        <el-button @click="handleResetSearch" icon="Refresh">重置</el-button>
      </div>
    </el-card>

    <!-- Tab内容区 -->
    <el-card class="main-card" shadow="hover">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- Tab1: 会议室管理 -->
        <el-tab-pane label="会议室管理" name="rooms">
          <RoomManagement
              ref="roomRef"
              @selection-change="handleSelectionChange"
              @edit="handleEdit"
              @view="handleView"
              @delete="handleDelete"
          />
        </el-tab-pane>

        <!-- Tab2: 会议记录管理 -->
        <el-tab-pane label="会议记录管理" name="records">
          <RecordManagement
              ref="recordRef"
              @selection-change="handleSelectionChange"
              @view="handleViewRecord"
              @delete="handleDeleteRecord"
          />
        </el-tab-pane>

        <!-- Tab3: 会议参数配置 -->
        <el-tab-pane label="会议参数配置" name="config">
          <ConfigManagement ref="configRef" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 右侧抽屉 - 会议室编辑/详情 -->
    <el-drawer
        v-model="drawerVisible"
        :title="drawerTitle"
        direction="rtl"
        size="600px"
        :close-on-click-modal="false"
    >
      <RoomDrawer
          v-if="drawerType === 'room'"
          :room-data="currentRow"
          :mode="drawerMode"
          @save="handleSaveRoom"
          @close="drawerVisible = false"
      />

      <!-- 会议记录详情 -->
      <MeetingRecordDetail
          v-if="drawerType === 'record'"
          :record-data="currentRow"
          @close="drawerVisible = false"
      />
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import RoomManagement from './components/RoomManagement.vue'
import RecordManagement from './components/RecordManagement.vue'
import ConfigManagement from './components/ConfigManagement.vue'
import RoomDrawer from './components/RoomDrawer.vue'
import MeetingRecordDetail from './components/MeetingRecordDetail.vue'

const activeTab = ref('rooms')
const drawerVisible = ref(false)
const drawerMode = ref('edit') // edit, view
const drawerType = ref('room') // room, record
const currentRow = ref(null)
const selectedRows = ref([])

const roomRef = ref(null)
const recordRef = ref(null)
const configRef = ref(null)

const searchForm = reactive({
  keyword: '',
  status: ''
})

const drawerTitle = ref('')

// Tab切换
const handleTabChange = (tab) => {
  console.log('切换到:', tab)
  selectedRows.value = []
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

// 搜索
const handleSearch = () => {
  if (activeTab.value === 'rooms') {
    roomRef.value?.loadData()
  } else if (activeTab.value === 'records') {
    recordRef.value?.loadData()
  }
}

// 重置搜索
const handleResetSearch = () => {
  searchForm.keyword = ''
  searchForm.status = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  if (activeTab.value !== 'rooms') {
    ElMessage.warning('请在"会议室管理"标签页中新增')
    return
  }
  drawerType.value = 'room'
  drawerMode.value = 'add'
  currentRow.value = null
  drawerTitle.value = '新增会议室'
  drawerVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  drawerType.value = 'room'
  drawerMode.value = 'edit'
  currentRow.value = row
  drawerTitle.value = '编辑会议室'
  drawerVisible.value = true
}

// 查看
const handleView = (row) => {
  drawerType.value = 'room'
  drawerMode.value = 'view'
  currentRow.value = row
  drawerTitle.value = '会议室详情'
  drawerVisible.value = true
}

// 查看会议记录
const handleViewRecord = (row) => {
  drawerType.value = 'record'
  currentRow.value = row
  drawerTitle.value = '会议详情'
  drawerVisible.value = true
}

// 删除会议室
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除会议室"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    roomRef.value?.loadData()
  }).catch(() => {})
}

// 删除会议记录
const handleDeleteRecord = (row) => {
  ElMessageBox.confirm(`确认删除会议"${row.title}"吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
    recordRef.value?.loadData()
  }).catch(() => {})
}

// 保存会议室
const handleSaveRoom = (data) => {
  ElMessage.success(drawerMode.value === 'add' ? '新增成功' : '保存成功')
  drawerVisible.value = false
  roomRef.value?.loadData()
}

// 批量启用
const handleBatchEnable = () => {
  ElMessageBox.confirm(`确认启用选中的 ${selectedRows.value.length} 个会议室吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量启用成功')
    roomRef.value?.loadData()
  }).catch(() => {})
}

// 批量禁用
const handleBatchDisable = () => {
  ElMessageBox.confirm(`确认禁用选中的 ${selectedRows.value.length} 个会议室吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量禁用成功')
    roomRef.value?.loadData()
  }).catch(() => {})
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确认删除选中的 ${selectedRows.value.length} 个会议室吗？此操作不可恢复！`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('批量删除成功')
    roomRef.value?.loadData()
  }).catch(() => {})
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中')
}

// 导入
const handleImport = () => {
  ElMessage.success('导入功能开发中')
}

// 刷新
const handleRefresh = () => {
  if (activeTab.value === 'rooms') {
    roomRef.value?.loadData()
  } else if (activeTab.value === 'records') {
    recordRef.value?.loadData()
  }
  ElMessage.success('刷新成功')
}
</script>

<style scoped lang="scss">
.meeting-admin-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 14px;
  }

  .toolbar-card {
    margin-bottom: 16px;
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 16px;
    }

    .toolbar-content {
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
      }
    }

    .search-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .main-card {
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 0;
    }

    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 20px;
      background: #fafafa;
      border-bottom: 1px solid #ebeef5;
    }

    :deep(.el-tabs__nav-wrap::after) {
      height: 0;
    }

    :deep(.el-tabs__item) {
      height: 48px;
      line-height: 48px;
      font-size: 14px;
      font-weight: 500;
    }

    :deep(.el-tabs__item.is-active) {
      color: #409eff;
      font-weight: 600;
    }

    :deep(.el-tabs__active-bar) {
      height: 2px;
    }
  }
}
</style>
