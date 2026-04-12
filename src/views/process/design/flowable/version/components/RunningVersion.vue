<template>
  <div class="running-version">
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
          </el-select>
        </el-form-item>
        <el-form-item label="运行状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 140px">
            <el-option label="已启用" value="enabled" />
            <el-option label="已停用" value="disabled" />
            <el-option label="已下线" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table :data="tableData" border v-loading="loading">
      <el-table-column label="流程名称" min-width="180">
        <template #default="{ row }">
          <el-link type="primary" :underline="false" @click="handlePreview(row)">{{ row.name }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="绑定表单" width="150" align="center">
        <template #default="{ row }">
          <span :class="{ 'no-bind': !row.bindForm }">{{ row.bindForm || '未绑定' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="运行版本号" width="110" align="center">
        <template #default="{ row }"><span class="version-tag">V{{ row.version }}</span></template>
      </el-table-column>
      <el-table-column label="发布人" width="100" align="center" prop="publisher" />
      <el-table-column label="发布时间" width="180" align="center" prop="publishTime" />
      <el-table-column label="发起次数" width="100" align="center">
        <template #default="{ row }"><span class="count-num">{{ row.initCount || 0 }}</span></template>
      </el-table-column>
      <el-table-column label="运行状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.status === 'enabled' ? 'success' : row.status === 'disabled' ? 'info' : 'danger'">
            {{ row.status === 'enabled' ? '已启用' : row.status === 'disabled' ? '已停用' : '已下线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="360" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-group">
            <el-button size="small" type="primary" link @click="handlePreview(row)">预览流程</el-button>
            <el-button size="small" type="warning" link @click="handleRollback(row)">版本回滚</el-button>
            <el-button size="small" :type="row.status === 'enabled' ? 'warning' : 'success'" link @click="handleToggle(row)">
              {{ row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
            <el-button size="small" type="info" link @click="openBindForm(row)">表单绑定</el-button>
            <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
              <el-button size="small" link>更多<el-icon><ArrowDown /></el-icon></el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="offline" type="danger">下线版本</el-dropdown-item>
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

    <!-- 表单绑定子组件 -->
    <FormBindDialog ref="bindFormRef" />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import FormBindDialog from './FormBindDialog.vue'

const router = useRouter()
const emit = defineEmits(['refresh'])

const loading = ref(false)
const query = reactive({ name: '', category: '', status: '' })
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(3)
const bindFormRef = ref(null)

const tableData = ref([
  { id: 1, name: '请假审批流程', category: 'hr', version: '1.2', bindForm: '请假申请表', publisher: '系统管理员', publishTime: '2024-03-10 10:00', initCount: 156, status: 'enabled' },
  { id: 2, name: '加班审批流程', category: 'hr', version: '1.1', bindForm: '加班申请表', publisher: '系统管理员', publishTime: '2024-02-15 14:30', initCount: 89, status: 'enabled' },
  { id: 3, name: '费用报销流程', category: 'finance', version: '1.0', bindForm: '', publisher: '财务管理员', publishTime: '2024-01-05 09:00', initCount: 45, status: 'disabled' }
])

const handleSearch = () => { ElMessage.success('查询完成') }
const handleReset = () => { query.name = ''; query.category = ''; query.status = ''; ElMessage.success('已重置') }

const handlePreview = (row) => { ElMessage.info(`预览流程「${row.name}」流程图`) }

const handleRollback = (row) => {
  ElMessageBox.confirm(`确定回滚「${row.name}」至上一个版本？此操作将记录审计日志。`, '版本回滚', { confirmButtonText: '确认回滚', cancelButtonText: '取消', type: 'warning' }).then(() => {
    ElMessage.success('版本回滚成功')
  }).catch(() => {})
}

const handleToggle = (row) => {
  const action = row.status === 'enabled' ? '停用' : '启用'
  if (row.status === 'disabled' && !row.bindForm) {
    ElMessage.warning('未绑定表单的流程禁止启用，请先完成表单绑定')
    return
  }
  ElMessageBox.confirm(`确定${action}流程「${row.name}」？${action === '停用' ? '停用后员工无法发起新审批。' : ''}`, `${action}确认`, { type: 'warning' }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const openBindForm = (row) => {
  bindFormRef.value?.open(row)

  // 简单的监听逻辑：实际项目中，bindFormRef 内部成功回调后应通知父组件更新 tableData
  // 这里为了演示，我们在 close 后模拟刷新
  const originClose = bindFormRef.value.visible
  // 注意：这里仅作示例，实际逻辑应放在子组件的 emit 事件中
}

const handleMore = (cmd, row) => {
  if (cmd === 'offline') {
    ElMessageBox.confirm(`确定下线「${row.name}」？下线后不可恢复！`, '下线确认', { type: 'error' }).then(() => {
      row.status = 'offline'
      ElMessage.success('已下线')
    }).catch(() => {})
  }
}
</script>

<style scoped lang="scss">
.running-version {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
  overflow-y: auto;

  .search-area {
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    padding: 16px 20px;
    margin-bottom: 16px;
  }

  .version-tag {
    font-family: 'Courier New', monospace;
    font-weight: 600;
    color: #00b42a;
  }

  .no-bind { color: #f53f3f; font-weight: 500; }
  .count-num { color: #3370ff; font-weight: 600; font-size: 14px; }

  .pagination-bar {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
    margin-top: auto;
  }

  :deep(.el-table) { border-radius: 6px; overflow: hidden; }

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
}
</style>
