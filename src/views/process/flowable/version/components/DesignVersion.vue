<template>
  <div class="design-version">
    <!-- 1. 查询区：独立的 el-form -->
    <div class="search-area">
      <el-form :inline="true" :model="query">
        <el-form-item label="流程名称">
          <el-input v-model="query.name" placeholder="模糊搜索" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="流程分类">
          <el-select v-model="query.category" placeholder="全部分类" clearable style="width: 140px">
            <el-option label="人事类" value="hr" />
            <el-option label="财务类" value="finance" />
            <el-option label="行政类" value="admin" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="版本状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="草稿" value="draft" />
            <el-option label="已废弃" value="abandoned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 2. 批量操作区 -->
    <div class="batch-actions" v-if="selection.length > 0">
      <span class="selected-count">已选择 {{ selection.length }} 项</span>
      <el-button size="small" type="warning" @click="handleBatchAbandon">批量废弃</el-button>
      <el-button size="small" type="danger" plain @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 3. 表格区：独立的 el-table，与 el-form 是兄弟关系 -->
    <div class="table-container" v-loading="loading">
      <el-table
          :data="tableData"
          border
          row-key="id"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="流程名称" min-width="200">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleEdit(row)">{{ row.name }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="流程分类" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="getCategoryType(row.category)">{{ getCategoryLabel(row.category) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="版本号" width="100" align="center">
          <template #default="{ row }"><span class="version-tag">V{{ row.version }}</span></template>
        </el-table-column>
        <el-table-column label="设计人" width="120" align="center" prop="creator" />
        <el-table-column label="更新时间" width="180" align="center" prop="updateTime" />
        <el-table-column label="版本状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'draft' ? 'info' : 'danger'">
              {{ row.status === 'draft' ? '草稿' : '已废弃' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="420" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <el-button size="small" type="primary" link @click="handleEdit(row)">编辑设计</el-button>
              <el-button size="small" type="primary" link @click="handlePublish(row)" v-if="row.status === 'draft'">发布版本</el-button>
              <el-button size="small" type="info" link @click="handleVersionHistory(row)">版本历史</el-button>
              <el-button size="small" type="warning" link @click="handleCopy(row)">复制版本</el-button>
              <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                <el-button size="small" link>更多<el-icon><ArrowDown /></el-icon></el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="abandon" v-if="row.status === 'draft'">废弃版本</el-dropdown-item>
                    <el-dropdown-item command="delete" divided type="danger">删除版本</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <el-pagination layout="total, sizes, prev, pager, next" :total="total" :page-sizes="[10, 20, 50]" v-model:page-size="pageSize" v-model:current-page="currentPage" />
      </div>
    </div>

    <!-- 4. 弹窗：必须放在最外层，不能放在 table-container 内 -->
    <el-dialog v-model="historyVisible" title="版本历史" width="600px">
      <el-timeline v-if="currentVersions.length">
        <el-timeline-item v-for="v in currentVersions" :key="v.version" :timestamp="v.time" placement="top">
          <el-card>
            <div class="history-item">
              <span class="version-label">V{{ v.version }}</span>
              <el-tag size="small" :type="v.status === 'published' ? 'success' : 'info'">{{ v.statusLabel }}</el-tag>
              <span class="history-desc">{{ v.desc }}</span>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无版本历史" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const emit = defineEmits(['refresh'])

const loading = ref(false)
const query = reactive({ name: '', category: '', status: '' })
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(5)
const selection = ref([])
const historyVisible = ref(false)
const currentVersions = ref([])

const tableData = ref([
  { id: 1, name: '请假审批流程', category: 'hr', version: '1.3', status: 'draft', creator: '系统管理员', updateTime: '2026-03-15 14:20' },
  { id: 2, name: '加班审批流程', category: 'hr', version: '1.2', status: 'draft', creator: '系统管理员', updateTime: '2026-02-20 16:45' },
  { id: 3, name: '费用报销流程', category: 'finance', version: '1.1', status: 'draft', creator: '财务管理员', updateTime: '2026-01-10 17:30' },
  { id: 4, name: '会议申请流程', category: 'admin', version: '1.0', status: 'draft', creator: '行政管理员', updateTime: '2026-01-05 09:00' },
  { id: 5, name: '车辆申请流程', category: 'admin', version: '0.9', status: 'abandoned', creator: '系统管理员', updateTime: '2023-12-01 18:00' }
])

const getCategoryType = (cat) => ({ hr: 'primary', finance: 'success', admin: 'warning', other: 'info' })[cat] || 'info'
const getCategoryLabel = (cat) => ({ hr: '人事类', finance: '财务类', admin: '行政类', other: '其他' })[cat] || cat

const handleSearch = () => { ElMessage.success('查询完成') }
const handleReset = () => { query.name = ''; query.category = ''; query.status = ''; currentPage.value = 1; ElMessage.success('已重置') }
const handleSelectionChange = (val) => { selection.value = val }

const handleEdit = (row) => { router.push({ path: '/process/design/flowable/bpmn', query: { processId: row.id } }) }

const handlePublish = (row) => {
  ElMessageBox.confirm(`确定要发布流程「${row.name}」V${row.version} 吗？发布后将同步至运行版本。`, '发布确认', { confirmButtonText: '确认发布', cancelButtonText: '取消', type: 'warning' }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
      total.value = tableData.value.length
    }
    ElMessage.success('发布成功，已同步至运行版本')
    emit('refresh')
  }).catch(() => {})
}

const handleVersionHistory = (row) => {
  currentVersions.value = [
    { version: row.version, status: row.status === 'draft' ? 'draft' : 'published', statusLabel: row.status === 'draft' ? '草稿' : '已发布', time: row.updateTime, desc: '当前版本' },
    { version: '1.0', status: 'published', statusLabel: '已发布', time: '2026-01-10 10:00', desc: '初始版本发布' }
  ]
  historyVisible.value = true
}

const handleCopy = (row) => { ElMessage.success(`已复制「${row.name}」新草稿版本`) }

const handleMore = (cmd, row) => {
  if (cmd === 'abandon') {
    ElMessageBox.confirm(`确定废弃「${row.name}」？废弃后不可编辑。`, '确认', { type: 'warning' }).then(() => { row.status = 'abandoned'; ElMessage.success('已废弃') })
  }
  if (cmd === 'delete') {
    ElMessageBox.confirm(`确定删除「${row.name}」？此操作不可恢复！`, '确认删除', { type: 'error' }).then(() => { ElMessage.success('已删除') })
  }
}

const handleBatchAbandon = () => { ElMessageBox.confirm(`确定批量废弃 ${selection.value.length} 个流程？`, '确认', { type: 'warning' }).then(() => { ElMessage.success('批量废弃成功') }) }
const handleBatchDelete = () => { ElMessageBox.confirm(`确定批量删除 ${selection.value.length} 个流程？此操作不可恢复！`, '确认删除', { type: 'error' }).then(() => { ElMessage.success('批量删除成功') }) }
</script>

<style scoped lang="scss">
.design-version {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  overflow-y: auto;
  background: #f5f7fa;

  .search-area {
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .batch-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    padding: 8px 16px;
    background: #f2f3f5;
    border-radius: 4px;

    .selected-count {
      font-size: 13px;
      color: #3370ff;
      font-weight: 500;
    }
  }

  .table-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 16px;

    :deep(.el-table) {
      flex: 1;
      border-radius: 6px;
      overflow: hidden;
    }

    .pagination-bar {
      padding: 12px;
      display: flex;
      justify-content: flex-end;
      background: #fff;
      border-top: 1px solid #ebeef5;
    }
  }

  .version-tag {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #3370ff;
  }

  .action-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex-wrap: nowrap;

    :deep(.el-button--link) {
      padding: 0 6px;
      margin: 0;
      font-size: 13px;
    }
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 10px;

    .version-label { font-weight: 600; color: #3370ff; font-family: 'Courier New', monospace; }
    .history-desc { color: #646a73; font-size: 13px; }
  }
}
</style>
