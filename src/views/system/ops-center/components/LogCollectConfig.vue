<template>
  <div class="log-collect-config">
    <!-- 采集状态看板 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">采集状态监控</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">采集成功率</div>
            <div class="stat-value" style="color: #67c23a">{{ collectStatus.successRate }}%</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">日志总量</div>
            <div class="stat-value">{{ collectStatus.totalLogs }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">异常采集数</div>
            <div class="stat-value" style="color: #f56c6c">{{ collectStatus.errorCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">今日新增</div>
            <div class="stat-value">{{ collectStatus.todayLogs }}</div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 采集源管理 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">采集源管理</span>
          <div>
            <el-button size="small" @click="handleEnableAll">一键全启</el-button>
            <el-button size="small" @click="handleDisableAll">一键全关</el-button>
          </div>
        </div>
      </template>
      <el-table :data="collectSources" border>
        <el-table-column prop="name" label="采集类型" min-width="200" />
        <el-table-column prop="system" label="系统核心" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.system" type="danger" size="small">是</el-tag>
            <span v-else>否</span>
          </template>
        </el-table-column>
        <el-table-column prop="enabled" label="采集开关" width="120" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" :disabled="row.system" />
          </template>
        </el-table-column>
        <el-table-column prop="description" label="说明" min-width="250" show-overflow-tooltip />
      </el-table>
    </el-card>

    <!-- 采集粒度配置 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">采集粒度配置</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="采集模式">
          <el-radio-group v-model="collectConfig.granularity">
            <el-radio label="simple" value="simple">精简模式（仅核心字段，省性能）</el-radio>
            <el-radio label="full" value="full">完整模式（全参数+请求链路）</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="过滤规则">
          <el-input
              v-model="collectConfig.filterRules"
              type="textarea"
              :rows="3"
              placeholder="每行一个过滤规则，例：页面刷新、心跳检测"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 存储与清理规则 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">存储与清理规则</span>
      </template>
      <el-form label-width="150px">
        <el-form-item label="日志保留时长">
          <el-input-number v-model="collectConfig.retentionDays" :min="30" :max="365" />
          <span style="margin-left: 10px">天</span>
        </el-form-item>
        <el-form-item label="存储上限">
          <el-input-number v-model="collectConfig.storageLimit" :min="1" :max="100" />
          <span style="margin-left: 10px">GB</span>
        </el-form-item>
        <el-form-item label="超期自动归档">
          <el-switch v-model="collectConfig.autoArchive" />
        </el-form-item>
      </el-form>
    </el-card>

    <div class="save-actions">
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const collectStatus = reactive({
  successRate: 99.8,
  totalLogs: '125,680',
  errorCount: 12,
  todayLogs: 328
})

const collectConfig = reactive({
  granularity: 'full',
  filterRules: '页面刷新\n心跳检测\n鼠标移动',
  retentionDays: 90,
  storageLimit: 50,
  autoArchive: true
})

const collectSources = ref([
  { id: 1, name: '操作日志', system: true, enabled: true, description: '记录所有用户业务操作行为' },
  { id: 2, name: '登录日志', system: true, enabled: true, description: '记录账号登录登出行为' },
  { id: 3, name: '服务日志', system: false, enabled: true, description: '记录系统服务运行状态' },
  { id: 4, name: '错误日志', system: true, enabled: true, description: '记录系统异常和错误信息' },
  { id: 5, name: 'SQL执行日志', system: false, enabled: false, description: '记录数据库SQL执行记录' }
])

const handleEnableAll = () => {
  collectSources.value.forEach(source => {
    if (!source.system) {
      source.enabled = true
    }
  })
  ElMessage.success('已开启所有采集源')
}

const handleDisableAll = () => {
  collectSources.value.forEach(source => {
    if (!source.system) {
      source.enabled = false
    }
  })
  ElMessage.success('已关闭所有可配置采集源')
}

const handleSave = () => {
  ElMessage.success('日志采集配置保存成功')
}
</script>

<style lang="scss" scoped>
.log-collect-config {
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
      font-size: 24px;
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
