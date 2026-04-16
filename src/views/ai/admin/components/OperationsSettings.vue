<template>
  <div class="operations-settings">
    <!-- 基础启停控制 -->
    <el-card class="config-card" shadow="never">
      <template #header>
        <span class="card-title">基础启停控制</span>
      </template>
      <el-form label-width="120px">
        <el-row :gutter="40">
          <el-col :span="6">
            <el-form-item label="AI总开关">
              <el-switch v-model="modelConfig.globalEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="智能问答">
              <el-switch v-model="modelConfig.qaEnabled" :disabled="!modelConfig.globalEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="文档总结">
              <el-switch v-model="modelConfig.summaryEnabled" :disabled="!modelConfig.globalEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="文案生成">
              <el-switch v-model="modelConfig.writingEnabled" :disabled="!modelConfig.globalEnabled" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 本地化运行参数 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <span class="card-title">本地化运行参数</span>
      </template>
      <el-form label-width="120px">
        <el-row :gutter="40">
          <el-col :span="8">
            <el-form-item label="上下文对话轮数">
              <el-input-number v-model="modelConfig.contextRounds" :min="1" :max="10" style="width: 120px" />
              <span style="margin-left: 8px">轮</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="文本处理上限">
              <el-input-number v-model="modelConfig.textLimit" :min="1000" :max="50000" :step="1000" style="width: 120px" />
              <span style="margin-left: 8px">字</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="响应超时时间">
              <el-input-number v-model="modelConfig.timeout" :min="5" :max="120" style="width: 120px" />
              <span style="margin-left: 8px">秒</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="40">
          <el-col :span="8">
            <el-form-item label="缓存开关">
              <el-switch v-model="modelConfig.cacheEnabled" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="缓存时长">
              <el-input-number v-model="modelConfig.cacheDuration" :min="1" :max="24" :disabled="!modelConfig.cacheEnabled" style="width: 120px" />
              <span style="margin-left: 8px">小时</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="低算力模式">
              <el-switch v-model="modelConfig.lowPowerMode" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 状态自检 -->
    <el-card class="config-card" shadow="never" style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span class="card-title">状态自检</span>
          <el-button type="primary" size="small" @click="handleSelfCheck" :loading="checking">一键自检</el-button>
        </div>
      </template>
      <div class="status-row">
        <div class="status-item">
          <div class="status-label">模型运行状态</div>
          <el-tag :type="statusCheck.modelStatus ? 'success' : 'danger'">
            {{ statusCheck.modelStatus ? '正常' : '异常' }}
          </el-tag>
        </div>
        <div class="status-item">
          <div class="status-label">算力占用</div>
          <el-tag :type="statusCheck.cpuUsage < 80 ? 'success' : 'warning'">
            {{ statusCheck.cpuUsage }}%
          </el-tag>
        </div>
        <div class="status-item">
          <div class="status-label">服务连通性</div>
          <el-tag :type="statusCheck.connectivity ? 'success' : 'danger'">
            {{ statusCheck.connectivity ? '正常' : '异常' }}
          </el-tag>
        </div>
      </div>
    </el-card>

    <div class="save-actions">
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const modelConfig = reactive({
  globalEnabled: true,
  qaEnabled: true,
  summaryEnabled: true,
  writingEnabled: true,
  contextRounds: 5,
  textLimit: 10000,
  timeout: 30,
  cacheEnabled: true,
  cacheDuration: 12,
  lowPowerMode: false
})

const checking = ref(false)

const statusCheck = reactive({
  modelStatus: true,
  cpuUsage: 45,
  connectivity: true
})

const handleSelfCheck = () => {
  checking.value = true
  setTimeout(() => {
    checking.value = false
    ElMessage.success('自检完成，所有服务正常')
  }, 1500)
}

const handleSave = () => {
  ElMessage.success('模型配置保存成功')
}
</script>

<style lang="scss" scoped>
.operations-settings {
  .config-card {
    border-radius: 8px;

    :deep(.el-card__body) {
      padding: 20px;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 15px;
      font-weight: 600;
    }
  }

  .status-row {
    display: flex;
    gap: 12px;
    flex-wrap: nowrap;

    .status-item {
      flex: 1;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      text-align: center;
      min-width: 0;

      .status-label {
        margin-bottom: 8px;
        color: #606266;
        font-size: 13px;
      }
    }
  }

  .save-actions {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
