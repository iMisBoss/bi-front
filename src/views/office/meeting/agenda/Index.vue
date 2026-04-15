<template>
  <div class="meeting-agenda-container">
    <!-- 顶部操作栏 -->
    <div class="page-header">
      <div class="header-left">
        <el-input
            v-model="searchForm.keyword"
            placeholder="搜索纪要标题、会议名称、决议内容"
            prefix-icon="Search"
            clearable
            style="width: 280px"
            @input="handleSearch"
        />
        <el-select
            v-model="searchForm.timeRange"
            placeholder="时间筛选"
            clearable
            style="width: 120px; margin-left: 12px"
            @change="handleSearch"
        >
          <el-option label="今日" value="today" />
          <el-option label="本周" value="week" />
          <el-option label="本月" value="month" />
          <el-option label="近3月" value="quarter" />
        </el-select>
        <el-select
            v-model="searchForm.status"
            placeholder="状态筛选"
            clearable
            style="width: 120px; margin-left: 12px"
            @change="handleSearch"
        >
          <el-option label="草稿" value="draft" />
          <el-option label="待审批" value="pending" />
          <el-option label="已发布" value="published" />
          <el-option label="已归档" value="archived" />
          <el-option label="驳回" value="rejected" />
        </el-select>
        <el-select
            v-model="searchForm.meetingType"
            placeholder="会议类型"
            clearable
            style="width: 130px; margin-left: 12px"
            @change="handleSearch"
        >
          <el-option label="部门例会" value="dept" />
          <el-option label="项目评审" value="project" />
          <el-option label="培训会" value="training" />
          <el-option label="涉密会议" value="secret" />
        </el-select>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建纪要
        </el-button>
        <el-button @click="handleBatchExport" :disabled="selectedRecords.length === 0">
          批量导出
        </el-button>
        <el-button v-if="isAdmin" @click="handleBatchArchive" :disabled="selectedRecords.length === 0">
          批量归档
        </el-button>
        <el-button v-if="isAdmin" @click="showTemplateDialog = true">
          模板管理
        </el-button>
        <el-button @click="handleRefresh" icon="Refresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧分类导航 -->
      <CategoryNavigation
          :categories="categories"
          :activeCategory="activeCategory"
          @change="handleCategoryChange"
      />

      <!-- 中间纪要列表 -->
      <div class="center-panel">
        <div class="list-toolbar">
          <div class="view-switch">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button value="card">卡片视图</el-radio-button>
              <el-radio-button value="list">列表视图</el-radio-button>
            </el-radio-group>
          </div>
          <div class="sort-options">
            <el-select v-model="sortBy" size="small" style="width: 120px">
              <el-option label="按时间倒序" value="time_desc" />
              <el-option label="按时间正序" value="time_asc" />
              <el-option label="按状态" value="status" />
            </el-select>
          </div>
        </div>

        <!-- 卡片视图 -->
        <CardView
            v-if="viewMode === 'card'"
            :records="filteredRecords"
            @click="handleViewDetail"
            @edit="handleEdit"
            @submit="handleSubmit"
            @publish="handlePublish"
            @export="handleExport"
        />

        <!-- 列表视图 -->
        <ListView
            v-if="viewMode === 'list'"
            :records="filteredRecords"
            :selected-ids="selectedRecordIds"
            @select="handleSelectRecord"
            @click="handleViewDetail"
            @edit="handleEdit"
            @submit="handleSubmit"
            @publish="handlePublish"
            @export="handleExport"
        />

        <!-- 分页 -->
        <div class="pagination-bar">
          <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSearch"
              @current-change="handleSearch"
          />
          <div class="stats-info">
            共 {{ pagination.total }} 条纪要，待审批 {{ pendingCount }} 条，待发布 {{ unpublishedCount }} 条
          </div>
        </div>
      </div>

      <!-- 右侧侧边抽屉 -->
      <DetailDrawer
          v-model="drawerVisible"
          :record="currentRecord"
          :mode="drawerMode"
          :user-role="userRole"
          :is-initiator="isInitiator"
          @save="handleSave"
          @submit="handleSubmit"
          @approve="handleApprove"
          @reject="handleReject"
          @publish="handlePublish"
          @export="handleExport"
          @compare-version="handleCompareVersion"
          @close="drawerVisible = false"
      />
    </div>

    <!-- 模板管理对话框 -->
    <TemplateManagement
        v-model="showTemplateDialog"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Refresh } from '@element-plus/icons-vue'
import CategoryNavigation from './components/CategoryNavigation.vue'
import CardView from './components/CardView.vue'
import ListView from './components/ListView.vue'
import DetailDrawer from './components/DetailDrawer.vue'
import TemplateManagement from './components/TemplateManagement.vue'

const isAdmin = ref(false)
const userRole = ref('employee')
const isInitiator = ref(false)
const activeCategory = ref('myDraft')
const viewMode = ref('card')
const sortBy = ref('time_desc')
const drawerVisible = ref(false)
const drawerMode = ref('view')
const currentRecord = ref(null)
const showTemplateDialog = ref(false)
const selectedRecords = ref([])
const selectedRecordIds = ref([])

const searchForm = reactive({
  keyword: '',
  timeRange: '',
  status: '',
  meetingType: ''
})

const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 分类导航
const categories = ref([
  { key: 'myDraft', label: '我的起草', count: 3, icon: 'Edit' },
  { key: 'pendingApproval', label: '待我审批', count: 2, icon: 'Bell' },
  { key: 'canView', label: '我可查看', count: 15, icon: 'View' },
  { key: 'published', label: '已发布', count: 8, icon: 'Document' },
  { key: 'archived', label: '已归档', count: 25, icon: 'Folder' },
  { key: 'all', label: '全部纪要', count: 0, icon: 'List' }
])

// 纪要数据
const allRecords = ref([
  {
    id: 1,
    title: '技术部Q2季度规划会议-会议纪要',
    meetingName: '技术部Q2季度规划会议',
    meetingTime: '2026-04-15 14:00',
    initiator: '张经理',
    initiatorDept: '技术部',
    status: 'draft',
    statusLabel: '草稿',
    statusColor: 'info',
    lastEditTime: '2026-04-15 16:30',
    publishTime: null,
    archiveTime: null,
    decisions: [
      'Q2目标：完成产品2.0版本上线',
      '资源分配：新增3名开发人员'
    ],
    todoCount: 5,
    visibility: 'department',
    isSecret: false,
    version: 1,
    meetingType: 'dept',
    creatorId: 'zhang_manager'
  },
  {
    id: 2,
    title: '产品需求评审会-会议纪要',
    meetingName: '产品需求评审会',
    meetingTime: '2026-04-14 10:00',
    initiator: '李总监',
    initiatorDept: '产品部',
    status: 'pending',
    statusLabel: '待审批',
    statusColor: 'warning',
    lastEditTime: '2026-04-14 11:30',
    publishTime: null,
    archiveTime: null,
    decisions: [
      '确认Q2核心需求清单',
      '优先级调整：支付功能优先'
    ],
    todoCount: 8,
    visibility: 'meeting',
    isSecret: false,
    version: 2,
    meetingType: 'project',
    creatorId: 'li_director'
  },
  {
    id: 3,
    title: '月度经营分析会-会议纪要',
    meetingName: '月度经营分析会',
    meetingTime: '2026-04-10 09:00',
    initiator: '王主任',
    initiatorDept: '总裁办',
    status: 'published',
    statusLabel: '已发布',
    statusColor: 'success',
    lastEditTime: '2026-04-10 11:00',
    publishTime: '2026-04-10 14:00',
    archiveTime: null,
    decisions: [
      'Q1营收达成率95%',
      'Q2重点拓展华东市场'
    ],
    todoCount: 12,
    visibility: 'company',
    isSecret: false,
    version: 1,
    meetingType: 'dept',
    creatorId: 'wang_director'
  },
  {
    id: 4,
    title: '高管战略会议-会议纪要',
    meetingName: '高管战略会议',
    meetingTime: '2026-04-08 14:00',
    initiator: '赵总',
    initiatorDept: '总裁办',
    status: 'archived',
    statusLabel: '已归档',
    statusColor: 'primary',
    lastEditTime: '2026-04-08 17:00',
    publishTime: '2026-04-08 18:00',
    archiveTime: '2026-05-08 18:00',
    decisions: [
      '年度战略目标调整',
      '组织架构优化方案'
    ],
    todoCount: 6,
    visibility: 'specific',
    isSecret: true,
    version: 1,
    meetingType: 'secret',
    creatorId: 'zhao_ceo'
  }
])

// 过滤后的纪要
const filteredRecords = computed(() => {
  let result = allRecords.value

  // 分类过滤
  if (activeCategory.value === 'myDraft') {
    result = result.filter(r => r.creatorId === 'current_user' && (r.status === 'draft' || r.status === 'rejected'))
  } else if (activeCategory.value === 'pendingApproval') {
    result = result.filter(r => r.status === 'pending')
  } else if (activeCategory.value === 'canView') {
    result = result.filter(r => r.status === 'published')
  } else if (activeCategory.value === 'published') {
    result = result.filter(r => r.status === 'published' && r.creatorId === 'current_user')
  } else if (activeCategory.value === 'archived') {
    result = result.filter(r => r.status === 'archived')
  }

  // 关键词搜索
  if (searchForm.keyword) {
    const keyword = searchForm.keyword.toLowerCase()
    result = result.filter(r =>
        r.title.toLowerCase().includes(keyword) ||
        r.meetingName.toLowerCase().includes(keyword) ||
        r.decisions.some(d => d.toLowerCase().includes(keyword))
    )
  }

  // 状态筛选
  if (searchForm.status) {
    result = result.filter(r => r.status === searchForm.status)
  }

  // 会议类型筛选
  if (searchForm.meetingType) {
    result = result.filter(r => r.meetingType === searchForm.meetingType)
  }

  // 排序
  if (sortBy.value === 'time_desc') {
    result.sort((a, b) => new Date(b.lastEditTime) - new Date(a.lastEditTime))
  } else if (sortBy.value === 'time_asc') {
    result.sort((a, b) => new Date(a.lastEditTime) - new Date(b.lastEditTime))
  } else if (sortBy.value === 'status') {
    const statusMap = { pending: 4, draft: 3, published: 2, archived: 1, rejected: 5 }
    result.sort((a, b) => statusMap[b.status] - statusMap[a.status])
  }

  pagination.total = result.length
  return result
})

// 统计数量
const pendingCount = computed(() => {
  return allRecords.value.filter(r => r.status === 'pending').length
})

const unpublishedCount = computed(() => {
  return allRecords.value.filter(r => r.status === 'draft' || r.status === 'rejected').length
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  // 加载数据
}

const handleCategoryChange = (category) => {
  activeCategory.value = category
  handleSearch()
}

const handleSearch = () => {
  pagination.page = 1
}

const handleSelectRecord = (id) => {
  const index = selectedRecordIds.value.indexOf(id)
  if (index > -1) {
    selectedRecordIds.value.splice(index, 1)
  } else {
    selectedRecordIds.value.push(id)
  }
  selectedRecords.value = allRecords.value.filter(r =>
      selectedRecordIds.value.includes(r.id)
  )
}

const handleViewDetail = (record) => {
  currentRecord.value = record
  drawerMode.value = record.status === 'draft' || record.status === 'rejected' ? 'edit' : 'view'
  drawerVisible.value = true
}

const handleCreate = () => {
  currentRecord.value = {
    id: null,
    title: '',
    meetingName: '',
    meetingTime: '',
    initiator: '',
    initiatorDept: '',
    status: 'draft',
    statusLabel: '草稿',
    statusColor: 'info',
    lastEditTime: new Date().toISOString(),
    publishTime: null,
    archiveTime: null,
    decisions: [],
    todoCount: 0,
    visibility: 'department',
    isSecret: false,
    version: 1,
    meetingType: 'dept',
    creatorId: 'current_user'
  }
  drawerMode.value = 'edit'
  drawerVisible.value = true
}

const handleEdit = (record) => {
  currentRecord.value = { ...record }
  drawerMode.value = 'edit'
  drawerVisible.value = true
}

const handleSubmit = (record) => {
  ElMessageBox.confirm('确认提交审批吗？', '提示', {
    confirmButtonText: '确认提交',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    record.status = 'pending'
    record.statusLabel = '待审批'
    record.statusColor = 'warning'
    ElMessage.success('已提交审批')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handlePublish = (record) => {
  ElMessageBox.confirm('确认发布会议纪要吗？发布后将通知所有参会人员', '提示', {
    confirmButtonText: '确认发布',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    record.status = 'published'
    record.statusLabel = '已发布'
    record.statusColor = 'success'
    record.publishTime = new Date().toISOString()
    ElMessage.success('已发布，通知已推送')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handleApprove = (record) => {
  ElMessageBox.prompt('请填写审批意见', '审批通过', {
    confirmButtonText: '确认通过',
    cancelButtonText: '取消'
  }).then(({ value }) => {
    record.status = 'published'
    record.statusLabel = '已发布'
    record.statusColor = 'success'
    record.publishTime = new Date().toISOString()
    ElMessage.success('审批通过，已自动发布')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handleReject = (record) => {
  ElMessageBox.prompt('请填写驳回原因', '驳回纪要', {
    confirmButtonText: '确认驳回',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '驳回原因不能为空'
  }).then(({ value }) => {
    record.status = 'rejected'
    record.statusLabel = '已驳回'
    record.statusColor = 'danger'
    ElMessage.success('已驳回')
    drawerVisible.value = false
    updateCategoryCounts()
  }).catch(() => {})
}

const handleSave = (record) => {
  if (record.id) {
    const index = allRecords.value.findIndex(r => r.id === record.id)
    if (index > -1) {
      allRecords.value[index] = { ...record, lastEditTime: new Date().toISOString() }
    }
    ElMessage.success('保存成功')
  } else {
    record.id = Date.now()
    allRecords.value.unshift({ ...record, lastEditTime: new Date().toISOString() })
    ElMessage.success('创建成功')
  }
  drawerVisible.value = false
  updateCategoryCounts()
}

const handleExport = (record) => {
  ElMessage.success('导出功能开发中')
}

const handleCompareVersion = (record) => {
  ElMessage.info('版本对比功能开发中')
}

const handleBatchExport = () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请选择要导出的纪要')
    return
  }
  ElMessage.success(`已导出 ${selectedRecords.value.length} 条纪要`)
}

const handleBatchArchive = () => {
  if (selectedRecords.value.length === 0) {
    ElMessage.warning('请选择要归档的纪要')
    return
  }

  ElMessageBox.confirm(`确认归档选中的 ${selectedRecords.value.length} 条纪要吗？归档后将不可修改`, '提示', {
    confirmButtonText: '确认归档',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedRecords.value.forEach(r => {
      r.status = 'archived'
      r.statusLabel = '已归档'
      r.statusColor = 'primary'
      r.archiveTime = new Date().toISOString()
    })
    ElMessage.success('批量归档成功')
    selectedRecords.value = []
    selectedRecordIds.value = []
    updateCategoryCounts()
  }).catch(() => {})
}

const handleRefresh = () => {
  loadData()
  ElMessage.success('刷新成功')
}

const updateCategoryCounts = () => {
  const myDraft = allRecords.value.filter(r => r.creatorId === 'current_user' && (r.status === 'draft' || r.status === 'rejected')).length
  const pending = allRecords.value.filter(r => r.status === 'pending').length
  const canView = allRecords.value.filter(r => r.status === 'published').length
  const published = allRecords.value.filter(r => r.status === 'published' && r.creatorId === 'current_user').length
  const archived = allRecords.value.filter(r => r.status === 'archived').length

  categories.value[0].count = myDraft
  categories.value[1].count = pending
  categories.value[2].count = canView
  categories.value[3].count = published
  categories.value[4].count = archived
  categories.value[5].count = allRecords.value.length
}
</script>

<style lang="scss" scoped>
.meeting-agenda-container {
  padding: 0;
  background: #f5f7fa;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;

    .header-left,
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 0;
    overflow: hidden;

    .center-panel {
      flex: 1;
      background: #fff;
      overflow-y: auto;
      padding: 16px;

      .list-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #ebeef5;
      }

      .pagination-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #ebeef5;

        .stats-info {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}
</style>
