<template>
  <div class="content-manage">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button type="primary" @click="handleBatchPublish" :disabled="selectedRows.length === 0">批量发布</el-button>
          <el-button type="warning" @click="handleBatchOffline" :disabled="selectedRows.length === 0">批量下架</el-button>
          <el-button @click="handleBatchTop" :disabled="selectedRows.length === 0">批量置顶</el-button>
          <el-button @click="handleExport" icon="Download">导出</el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd" icon="Plus">新增内容</el-button>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="filter-bar">
      <el-select v-model="columnFilter" placeholder="选择栏目" style="width: 150px" clearable @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="新闻公告" value="1" />
        <el-option label="公司公告" value="2" />
        <el-option label="部门通知" value="3" />
        <el-option label="规章制度" value="4" />
      </el-select>
      <el-select v-model="statusFilter" placeholder="状态" style="width: 120px" clearable @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="草稿" value="draft" />
        <el-option label="待审批" value="pending" />
        <el-option label="已发布" value="published" />
        <el-option label="已过期" value="expired" />
        <el-option label="已下架" value="offline" />
      </el-select>
      <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 240px"
          @change="handleFilter"
      />
      <el-input
          v-model="searchKeyword"
          placeholder="搜索标题/创建人"
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="handleSearch"
      />
    </div>

    <!-- 内容列表 -->
    <el-table
        :data="filteredContents"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="title" label="标题" min-width="250" show-overflow-tooltip />
      <el-table-column prop="column" label="栏目" width="120" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="top" label="置顶" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.top" type="warning" size="small">置顶</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="publishTime" label="发布时间" width="160" />
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button
              v-if="row.status === 'published'"
              link
              type="warning"
              size="small"
              @click="handleOffline(row)"
          >
            下架
          </el-button>
          <el-button
              v-if="row.status === 'offline'"
              link
              type="success"
              size="small"
              @click="handlePublish(row)"
          >
            上架
          </el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 内容编辑抽屉 -->
    <ContentDrawer
        v-model="showDrawer"
        :type="drawerType"
        :data="currentContent"
        @confirm="handleConfirmSave"
    />

    <!-- 内容详情抽屉 -->
    <ContentDetailDrawer
        v-model="showDetailDrawer"
        :data="currentContent"
        @edit="handleEdit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ContentDrawer from './ContentDrawer.vue'
import ContentDetailDrawer from './ContentDetailDrawer.vue'

const props = defineProps({
  orgData: {
    type: Object,
    default: null
  }
})

const selectedRows = ref([])
const currentContent = ref(null)
const drawerType = ref('add')
const showDrawer = ref(false)
const showDetailDrawer = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const columnFilter = ref('')
const statusFilter = ref('')
const dateRange = ref(null)

const contentData = ref([
  {
    id: 1,
    title: '关于召开2026年度第一次全员大会的通知',
    column: '公司公告',
    status: 'published',
    top: true,
    publishTime: '2026-04-15 10:00',
    creator: '张三',
    content: '<p>各位同事：公司定于2026年4月20日上午9:00在总部大会议室召开2026年度第一次全员大会...</p>',
    scope: '全公司',
    effectiveTime: '2026-04-15',
    expireTime: '2026-04-25'
  },
  {
    id: 2,
    title: '2026年Q1产品规划方案',
    column: '部门通知',
    status: 'draft',
    top: false,
    publishTime: '',
    creator: '李四',
    content: '<p>产品部Q1规划...</p>',
    scope: '产品部',
    effectiveTime: '',
    expireTime: ''
  },
  {
    id: 3,
    title: '技术部代码规范更新通知',
    column: '部门通知',
    status: 'published',
    top: false,
    publishTime: '2026-04-10 15:00',
    creator: '王五',
    content: '<p>技术部各位同事：附件是最新的代码规范文档...</p>',
    scope: '技术部',
    effectiveTime: '2026-04-10',
    expireTime: ''
  },
  {
    id: 4,
    title: '关于清明节放假安排的通知',
    column: '公司公告',
    status: 'expired',
    top: false,
    publishTime: '2026-03-25 09:00',
    creator: '行政部',
    content: '<p>各位同事：清明节放假安排如下...</p>',
    scope: '全公司',
    effectiveTime: '2026-04-01',
    expireTime: '2026-04-10'
  },
  {
    id: 5,
    title: '财务部报销流程优化方案',
    column: '规章制度',
    status: 'pending',
    top: false,
    publishTime: '',
    creator: '周八',
    content: '<p>财务部报销流程优化...</p>',
    scope: '全公司',
    effectiveTime: '',
    expireTime: ''
  },
  {
    id: 6,
    title: '2025年度工作总结报告',
    column: '公司公告',
    status: 'offline',
    top: false,
    publishTime: '2026-01-15 10:00',
    creator: '张三',
    content: '<p>2025年度工作总结...</p>',
    scope: '全公司',
    effectiveTime: '2026-01-15',
    expireTime: ''
  }
])

const filteredContents = computed(() => {
  let data = [...contentData.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.title?.includes(searchKeyword.value) ||
        item.creator?.includes(searchKeyword.value)
    )
  }

  if (columnFilter.value) {
    data = data.filter(item => item.column === getColumnText(columnFilter.value))
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    data = data.filter(item => {
      if (!item.publishTime) return false
      const time = new Date(item.publishTime)
      return time >= start && time <= end
    })
  }

  total.value = data.length
  return data
})

const getStatusType = (status) => {
  const types = {
    'draft': 'info',
    'pending': 'warning',
    'published': 'success',
    'expired': '',
    'offline': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'draft': '草稿',
    'pending': '待审批',
    'published': '已发布',
    'expired': '已过期',
    'offline': '已下架'
  }
  return texts[status] || status
}

const getColumnText = (value) => {
  const columns = {
    '1': '新闻公告',
    '2': '公司公告',
    '3': '部门通知',
    '4': '规章制度'
  }
  return columns[value] || ''
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleAdd = () => {
  drawerType.value = 'add'
  currentContent.value = null
  showDrawer.value = true
}

const handleEdit = (row) => {
  drawerType.value = 'edit'
  currentContent.value = { ...row }
  showDrawer.value = true
  showDetailDrawer.value = false
}

const handleView = (row) => {
  currentContent.value = row
  showDetailDrawer.value = true
}

const handleOffline = (row) => {
  ElMessageBox.confirm(`确定要下架内容「${row.title}」吗？`, '下架内容', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'offline'
    ElMessage.success('下架成功')
  }).catch(() => {})
}

const handlePublish = (row) => {
  ElMessageBox.confirm(`确定要上架内容「${row.title}」吗？`, '上架内容', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 'published'
    row.publishTime = new Date().toLocaleString()
    ElMessage.success('上架成功')
  }).catch(() => {})
}

const handleBatchPublish = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => {
    row.status = 'published'
    row.publishTime = new Date().toLocaleString()
  })
  ElMessage.success('批量发布成功')
  selectedRows.value = []
}

const handleBatchOffline = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'offline' })
  ElMessage.success('批量下架成功')
  selectedRows.value = []
}

const handleBatchTop = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.top = true })
  ElMessage.success('批量置顶成功')
  selectedRows.value = []
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}
const handleFilter = () => {}

const handleConfirmSave = (formData) => {
  if (formData.id) {
    const index = contentData.value.findIndex(item => item.id === formData.id)
    if (index !== -1) {
      contentData.value[index] = { ...contentData.value[index], ...formData }
    }
    ElMessage.success('编辑成功')
  } else {
    formData.id = Date.now()
    contentData.value.push(formData)
    ElMessage.success('新增成功')
  }
  showDrawer.value = false
  total.value = contentData.value.length
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
.content-manage {
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
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
