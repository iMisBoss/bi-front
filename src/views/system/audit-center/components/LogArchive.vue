<template>
  <div class="log-archive">
    <!-- 存储统计 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">存储统计</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">日志占用空间</div>
            <div class="stat-value">{{ storageStats.logSpace }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">归档包数量</div>
            <div class="stat-value">{{ storageStats.archiveCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">归档包大小</div>
            <div class="stat-value">{{ storageStats.archiveSize }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">剩余存储空间</div>
            <div class="stat-value">{{ storageStats.freeSpace }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 自动归档配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">自动归档配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="归档周期">
          <el-select v-model="archiveConfig.archiveCycle" style="width: 200px">
            <el-option label="按日归档" value="daily" />
            <el-option label="按周归档" value="weekly" />
            <el-option label="按月归档" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="归档阈值">
          <el-input-number v-model="archiveConfig.archiveThreshold" :min="10000" :max="1000000" />
          <span style="margin-left: 10px">条</span>
        </el-form-item>
        <el-form-item label="存储路径">
          <el-input v-model="archiveConfig.storagePath" placeholder="/data/archive" disabled />
        </el-form-item>
        <el-form-item label="加密存储">
          <el-switch v-model="archiveConfig.encrypted" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 归档文件管理 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">归档文件管理</span>
          <el-button type="primary" size="small" @click="handleManualArchive" :loading="archiving">手动归档</el-button>
        </div>
      </template>

      <el-table :data="archiveFiles" border style="flex: 1">
        <el-table-column prop="name" label="归档包名称" min-width="250" />
        <el-table-column prop="date" label="归档日期" width="120" />
        <el-table-column prop="recordCount" label="记录数" width="120" align="center" />
        <el-table-column prop="size" label="文件大小" width="120" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
            <el-button link type="primary" size="small" @click="handleRestore(row)">恢复</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 数据清理规则 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">数据清理规则</span>
      </template>
      <el-alert
          title="警告：仅清理已归档的原始日志，未归档日志禁止清理。清理操作需二次确认并双重留痕。"
          type="warning"
          :closable="false"
          style="margin-bottom: 16px"
      />
      <el-form label-width="150px">
        <el-form-item label="清理周期">
          <el-select v-model="cleanConfig.cleanCycle" style="width: 200px">
            <el-option label="按日清理" value="daily" />
            <el-option label="按周清理" value="weekly" />
            <el-option label="按月清理" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="清理范围">
          <el-radio-group v-model="cleanConfig.cleanScope">
            <el-radio label="archived" value="archived">仅清理已归档日志</el-radio>
            <el-radio label="all" value="all">清理全部历史日志</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-button type="danger" @click="handleCleanNow">立即清理</el-button>
    </el-card>

    <div class="save-actions">
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const archiving = ref(false)

const storageStats = reactive({
  logSpace: '2.5 GB',
  archiveCount: '12 个',
  archiveSize: '800 MB',
  freeSpace: '47.5 GB'
})

const archiveConfig = reactive({
  archiveCycle: 'monthly',
  archiveThreshold: 100000,
  storagePath: '/data/archive',
  encrypted: true
})

const cleanConfig = reactive({
  cleanCycle: 'monthly',
  cleanScope: 'archived'
})

const archiveFiles = ref([
  { id: 1, name: 'audit_log_202603_archive.zip', date: '2026-03-31', recordCount: 125680, size: '85 MB', status: '已归档' },
  { id: 2, name: 'audit_log_202602_archive.zip', date: '2026-02-29', recordCount: 98500, size: '72 MB', status: '已归档' },
  { id: 3, name: 'audit_log_202601_archive.zip', date: '2026-01-31', recordCount: 110200, size: '78 MB', status: '已归档' }
])

const handleManualArchive = () => {
  ElMessageBox.confirm('确定要手动归档当前日志吗？', '手动归档', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    archiving.value = true
    setTimeout(() => {
      archiving.value = false
      ElMessage.success('手动归档成功')
    }, 1500)
  }).catch(() => {})
}

const handleDownload = (row) => {
  ElMessage.success(`正在下载归档包：${row.name}`)
}

const handleRestore = (row) => {
  ElMessageBox.confirm(`确定要恢复归档包「${row.name}」的日志吗？`, '恢复日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('日志恢复成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除归档包「${row.name}」吗？此操作不可恢复！`, '删除归档包', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    archiveFiles.value = archiveFiles.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleCleanNow = () => {
  ElMessageBox.confirm('确定要立即清理已归档的原始日志吗？此操作不可恢复！', '清理日志', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('日志清理成功')
  }).catch(() => {})
}

const handleSave = () => {
  ElMessage.success('归档配置保存成功')
}
</script>

<style lang="scss" scoped>
.log-archive {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  .config-card {
    border-radius: 8px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .stat-item {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 8px;
    text-align: center;

    .stat-label {
      margin-bottom: 8px;
      color: #606266;
      font-size: 14px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }

  .save-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    padding-bottom: 20px;
  }
}
</style>
