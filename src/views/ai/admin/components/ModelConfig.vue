<template>
  <div class="model-config">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-alert
            title="本地AI模型配置 - 所有数据仅在内网运行"
            type="info"
            :closable="false"
            style="width: 400px"
        />
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
        <el-button @click="handleReset" icon="Refresh">恢复默认</el-button>
      </div>
    </div>

    <!-- 模型状态看板 -->
    <el-card class="status-card" shadow="never">
      <div class="status-header">
        <h3>模型运行状态</h3>
        <el-button type="primary" @click="handleSelfCheck" :loading="checking">一键自检</el-button>
      </div>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">AI总开关</div>
            <el-switch v-model="config.globalEnabled" size="large" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">服务状态</div>
            <el-tag :type="modelStatus === 'running' ? 'success' : 'danger'" size="large">
              {{ modelStatus === 'running' ? '运行中' : '已停止' }}
            </el-tag>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">算力占用</div>
            <el-progress :percentage="cpuUsage" :color="getProgressColor" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="status-item">
            <div class="status-label">低算力模式</div>
            <el-switch v-model="config.lowComputeMode" size="large" />
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 基础启停控制 -->
    <el-card class="config-section" shadow="never">
      <template #header>
        <div class="card-header">
          <span>基础启停控制</span>
        </div>
      </template>
      <el-form :model="config" label-width="150px">
        <el-form-item label="启用能力集">
          <el-checkbox-group v-model="config.enabledAbilities">
            <el-checkbox label="qa">智能问答</el-checkbox>
            <el-checkbox label="summary">文档总结</el-checkbox>
            <el-checkbox label="writing">文案生成</el-checkbox>
            <el-checkbox label="assistant">流程咨询助手</el-checkbox>
            <el-checkbox label="knowledge">知识库检索</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 本地化运行参数 -->
    <el-card class="config-section" shadow="never">
      <template #header>
        <div class="card-header">
          <span>本地化运行参数</span>
        </div>
      </template>
      <el-form :model="config" label-width="150px">
        <el-form-item label="上下文对话轮数">
          <el-slider v-model="config.contextRounds" :min="1" :max="10" show-input />
          <div class="form-tip">建议3-5轮，节省内网服务器算力</div>
        </el-form-item>
        <el-form-item label="文本处理上限">
          <el-input-number v-model="config.textLimit" :min="1000" :max="50000" :step="1000" style="width: 200px" />
          <span style="margin-left: 10px">字符</span>
        </el-form-item>
        <el-form-item label="响应超时时间">
          <el-input-number v-model="config.timeout" :min="5" :max="120" :step="5" style="width: 200px" />
          <span style="margin-left: 10px">秒</span>
        </el-form-item>
        <el-form-item label="缓存开关">
          <el-switch v-model="config.cacheEnabled" />
        </el-form-item>
        <el-form-item label="缓存时长">
          <el-input-number v-model="config.cacheDuration" :min="1" :max="24" :step="1" :disabled="!config.cacheEnabled" style="width: 200px" />
          <span style="margin-left: 10px">小时</span>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 能力适配配置 -->
    <el-card class="config-section" shadow="never">
      <template #header>
        <div class="card-header">
          <span>能力适配配置</span>
        </div>
      </template>
      <el-form :model="config" label-width="150px">
        <el-form-item label="知识库匹配精度">
          <el-select v-model="config.knowledgeAccuracy" style="width: 200px">
            <el-option label="高（精确匹配）" value="high" />
            <el-option label="中（推荐）" value="medium" />
            <el-option label="低（模糊匹配）" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="公文优化规则">
          <el-checkbox-group v-model="config.docOptimization">
            <el-checkbox label="format">格式规范</el-checkbox>
            <el-checkbox label="language">语言润色</el-checkbox>
            <el-checkbox label="structure">结构优化</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  orgData: {
    type: Object,
    default: null
  }
})

const saving = ref(false)
const checking = ref(false)
const modelStatus = ref('running')
const cpuUsage = ref(45)

const config = reactive({
  globalEnabled: true,
  lowComputeMode: false,
  enabledAbilities: ['qa', 'summary', 'writing', 'assistant', 'knowledge'],
  contextRounds: 5,
  textLimit: 10000,
  timeout: 30,
  cacheEnabled: true,
  cacheDuration: 12,
  knowledgeAccuracy: 'medium',
  docOptimization: ['format', 'language']
})

const defaultConfig = {
  globalEnabled: true,
  lowComputeMode: false,
  enabledAbilities: ['qa', 'summary', 'writing', 'assistant', 'knowledge'],
  contextRounds: 5,
  textLimit: 10000,
  timeout: 30,
  cacheEnabled: true,
  cacheDuration: 12,
  knowledgeAccuracy: 'medium',
  docOptimization: ['format', 'language']
}

const getProgressColor = (percentage) => {
  if (percentage < 60) return '#67c23a'
  if (percentage < 80) return '#e6a23c'
  return '#f56c6c'
}

const handleSelfCheck = async () => {
  checking.value = true
  setTimeout(() => {
    checking.value = false
    modelStatus.value = 'running'
    cpuUsage.value = 45
    ElMessage.success('自检完成：模型运行正常，算力占用45%')
  }, 2000)
}

const handleSave = async () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('配置保存成功')
  }, 1000)
}

const handleReset = () => {
  ElMessageBox.confirm('确定要恢复默认配置吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    Object.assign(config, defaultConfig)
    ElMessage.success('已恢复默认配置')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.model-config {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .status-card {
    margin-bottom: 16px;

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h3 {
        margin: 0;
        font-size: 16px;
      }
    }

    .status-item {
      text-align: center;
      padding: 10px;

      .status-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
    }
  }

  .config-section {
    margin-bottom: 16px;

    .card-header {
      font-weight: 600;
    }

    .form-tip {
      margin-top: 4px;
      font-size: 12px;
      color: #909399;
    }
  }
}
</style>
