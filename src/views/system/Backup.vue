<template>
  <div class="backup-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>系统备份管理</span>
          <el-button type="primary" @click="handleBackup">
            <el-icon><Download /></el-icon>
            立即备份
          </el-button>
        </div>
      </template>

      <el-table :data="backupList" style="width: 100%" v-loading="loading">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="备份名称" width="200" />
        <el-table-column prop="type" label="备份类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'full' ? 'success' : 'warning'">
              {{ row.type === 'full' ? '完整备份' : '增量备份' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="文件大小" width="120" />
        <el-table-column prop="createTime" label="备份时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="handleRestore(row)">
              恢复
            </el-button>
            <el-button size="small" @click="handleDownload(row)">
              下载
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <el-dialog
        v-model="backupDialogVisible"
        title="创建备份"
        width="400px"
    >
      <el-form :model="backupForm" label-width="100px">
        <el-form-item label="备份类型">
          <el-radio-group v-model="backupForm.type">
            <el-radio label="full">完整备份</el-radio>
            <el-radio label="increment">增量备份</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input
              v-model="backupForm.remark"
              type="textarea"
              placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="backupDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmBackup">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download } from '@element-plus/icons-vue'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const backupDialogVisible = ref(false)

const backupList = ref([
  {
    id: 1,
    name: 'backup_20260325_001',
    type: 'full',
    size: '2.5 GB',
    createTime: '2026-03-25 10:30:00',
    status: 'success'
  },
  {
    id: 2,
    name: 'backup_20260326_001',
    type: 'increment',
    size: '500 MB',
    createTime: '2026-03-26 14:20:00',
    status: 'success'
  },
  {
    id: 3,
    name: 'backup_20260327_001',
    type: 'increment',
    size: '480 MB',
    createTime: '2026-03-27 09:15:00',
    status: 'success'
  }
])

const backupForm = reactive({
  type: 'full',
  remark: ''
})

const handleBackup = () => {
  backupDialogVisible.value = true
}

const confirmBackup = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    backupDialogVisible.value = false
    ElMessage.success('备份创建成功')
    fetchBackupList()
  }, 1500)
}

const handleRestore = (row) => {
  ElMessageBox.confirm(
      `确定要恢复到备份 "${row.name}" 吗？此操作将覆盖当前系统数据。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success('系统恢复成功')
  }).catch(() => {})
}

const handleDownload = (row) => {
  ElMessage.info(`开始下载备份文件：${row.name}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除备份 "${row.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success('删除成功')
    fetchBackupList()
  }).catch(() => {})
}

const handleSizeChange = () => {
  fetchBackupList()
}

const handleCurrentChange = () => {
  fetchBackupList()
}

const fetchBackupList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

onMounted(() => {
  fetchBackupList()
})
</script>

<style scoped lang="scss">
.backup-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
