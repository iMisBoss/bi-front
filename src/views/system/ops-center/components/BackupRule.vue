<template>
  <div class="backup-rule">
    <el-alert
        title="数据备份规则：数据库备份强制开启，不可关闭。备份任务后台异步执行，零业务阻塞。"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
    />

    <!-- 备份范围配置 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">备份范围配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="系统数据库">
          <el-switch v-model="backupConfig.database" disabled />
          <span style="margin-left: 10px; color: #909399">（强制开启，不可关闭）</span>
        </el-form-item>
        <el-form-item label="附件文件">
          <el-switch v-model="backupConfig.attachments" />
        </el-form-item>
        <el-form-item label="日志数据">
          <el-switch v-model="backupConfig.logs" />
        </el-form-item>
        <el-form-item label="配置文件">
          <el-switch v-model="backupConfig.configs" />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 备份模式配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">备份模式配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="备份模式">
          <el-radio-group v-model="backupConfig.mode">
            <el-radio label="full" value="full">全量备份（完整备份所有数据，稳定）</el-radio>
            <el-radio label="incremental" value="incremental">增量备份（仅备份变更数据，省空间）</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 定时任务配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">定时任务配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="执行周期">
          <el-select v-model="backupConfig.cycle" style="width: 200px">
            <el-option label="每日" value="daily" />
            <el-option label="每周" value="weekly" />
            <el-option label="每月" value="monthly" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间">
          <el-time-picker
              v-model="backupConfig.execTime"
              placeholder="选择执行时间"
              style="width: 200px"
          />
          <span style="margin-left: 10px; color: #909399">（建议闲时执行，默认凌晨2点）</span>
        </el-form-item>
        <el-form-item label="保留份数">
          <el-input-number v-model="backupConfig.keepCount" :min="1" :max="30" />
          <span style="margin-left: 10px">份（自动删除旧备份）</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 存储与安全 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">存储与安全</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="备份路径">
          <el-input v-model="backupConfig.storagePath" placeholder="/data/backup" disabled />
        </el-form-item>
        <el-form-item label="备份加密">
          <el-switch v-model="backupConfig.encrypted" />
          <span style="margin-left: 10px; color: #909399">（AES加密存储，禁止明文）</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 异常配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">异常配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="失败自动重试">
          <el-switch v-model="backupConfig.autoRetry" />
        </el-form-item>
        <el-form-item label="重试次数">
          <el-input-number v-model="backupConfig.retryCount" :min="1" :max="5" :disabled="!backupConfig.autoRetry" />
          <span style="margin-left: 10px">次</span>
        </el-form-item>
        <el-form-item label="失败实时告警">
          <el-switch v-model="backupConfig.failureAlert" />
        </el-form-item>
        <el-form-item label="成功静默通知">
          <el-switch v-model="backupConfig.successNotify" />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="save-actions">
      <el-button @click="handleTestBackup">手动测试备份</el-button>
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const backupConfig = reactive({
  database: true,
  attachments: true,
  logs: false,
  configs: true,
  mode: 'full',
  cycle: 'daily',
  execTime: new Date(2026, 3, 15, 2, 0, 0),
  keepCount: 7,
  storagePath: '/data/backup',
  encrypted: true,
  autoRetry: true,
  retryCount: 3,
  failureAlert: true,
  successNotify: false
})

const handleTestBackup = () => {
  ElMessageBox.confirm('确定要执行一次手动备份测试吗？', '测试备份', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.success('备份测试任务已提交，正在后台执行')
  }).catch(() => {})
}

const handleSave = () => {
  ElMessage.success('备份规则配置保存成功')
}
</script>

<style lang="scss" scoped>
.backup-rule {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;

  .config-card {
    border-radius: 8px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .save-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-bottom: 20px;
  }
}
</style>
