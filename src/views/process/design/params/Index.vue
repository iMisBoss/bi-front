<template>
  <div class="global-process-params">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin' }">后台首页</el-breadcrumb-item>
      <el-breadcrumb-item>低代码设计平台</el-breadcrumb-item>
      <el-breadcrumb-item>全局流程参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 标题区 -->
    <div class="page-header">
      <div class="header-left">
        <h2>全局流程参数</h2>
        <p class="subtitle">全局生效,所有流程默认继承;单个流程可独立覆盖配置</p>
      </div>
      <div class="header-right" v-if="isAdmin">
        <el-button
            v-if="!isEditMode"
            type="primary"
            icon="Edit"
            @click="handleEditConfig"
        >
          编辑配置
        </el-button>
        <el-button
            v-if="isEditMode"
            icon="Close"
            @click="handleCancelEdit"
        >
          取消
        </el-button>
        <el-button
            type="warning"
            plain
            icon="RefreshLeft"
            @click="handleResetDefaults"
        >
          重置默认
        </el-button>
      </div>
    </div>

    <!-- 参数配置卡片区域 -->
    <div class="config-cards">
      <!-- 卡片1：基础审批配置 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="18" color="#409EFF"><Setting /></el-icon>
            <span>基础审批配置</span>
          </div>
        </template>
        <div class="card-content">
          <div class="config-item">
            <span class="item-label">允许申请人撤回(未审批节点)</span>
            <el-switch
                v-model="config.basic.allowWithdraw"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">自动跳过空审批人</span>
            <el-switch
                v-model="config.basic.skipEmptyApprover"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">自动跳过重复审批人</span>
            <el-switch
                v-model="config.basic.skipDuplicateApprover"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">驳回必须填写意见</span>
            <el-switch
                v-model="config.basic.requireRejectComment"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">同意必须填写意见</span>
            <el-switch
                v-model="config.basic.requireApproveComment"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
        </div>
      </el-card>

      <!-- 卡片2：流程流转配置 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="18" color="#67C23A"><Share /></el-icon>
            <span>流程流转配置</span>
          </div>
        </template>
        <div class="card-content">
          <div class="config-item">
            <span class="item-label">允许审批人加签</span>
            <el-switch
                v-model="config.flow.allowAddSign"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">允许审批人转签</span>
            <el-switch
                v-model="config.flow.allowTransfer"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item vertical">
            <span class="item-label">会签规则</span>
            <el-radio-group
                v-model="config.flow.countersignRule"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            >
              <el-radio label="all">全部同意才通过</el-radio>
              <el-radio label="any">一人同意即通过</el-radio>
            </el-radio-group>
          </div>
          <div class="config-item">
            <span class="item-label">允许发起人催办</span>
            <el-switch
                v-model="config.flow.allowUrge"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
        </div>
      </el-card>

      <!-- 卡片3：超时处理配置 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="18" color="#E6A23C"><Clock /></el-icon>
            <span>超时处理配置</span>
          </div>
        </template>
        <div class="card-content">
          <div class="config-item">
            <span class="item-label">开启审批超时提醒</span>
            <el-switch
                v-model="config.timeout.enableTimeoutRemind"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item vertical">
            <span class="item-label">超时提醒时长</span>
            <el-input-number
                v-model="config.timeout.remindHours"
                :min="1"
                :max="720"
                :disabled="!isEditMode"
                controls-position="right"
                style="width: 150px"
                @change="handleConfigChange"
            />
            <span class="unit-text">小时</span>
          </div>
          <div class="config-item vertical">
            <span class="item-label">超时处理方式</span>
            <el-radio-group
                v-model="config.timeout.timeoutAction"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            >
              <el-radio label="remind">仅提醒</el-radio>
              <el-radio label="autoApprove">自动通过</el-radio>
              <el-radio label="ccAdmin">抄送管理员</el-radio>
            </el-radio-group>
          </div>
        </div>
      </el-card>

      <!-- 卡片4：抄送配置 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="18" color="#909399"><CopyDocument /></el-icon>
            <span>抄送配置</span>
          </div>
        </template>
        <div class="card-content">
          <div class="config-item">
            <span class="item-label">流程办结抄送申请人直属领导</span>
            <el-switch
                v-model="config.cc.ccLeaderOnComplete"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">审批驳回抄送发起人</span>
            <el-switch
                v-model="config.cc.ccInitiatorOnReject"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">异常流程抄送系统管理员</span>
            <el-switch
                v-model="config.cc.ccAdminOnException"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
        </div>
      </el-card>

      <!-- 卡片5：通知提醒配置 -->
      <el-card class="config-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon :size="18" color="#F56C6C"><Bell /></el-icon>
            <span>通知提醒配置</span>
          </div>
        </template>
        <div class="card-content">
          <div class="config-item">
            <span class="item-label">站内信通知</span>
            <el-switch
                v-model="config.notification.stationMessage"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">短信通知</span>
            <el-switch
                v-model="config.notification.sms"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
          <div class="config-item">
            <span class="item-label">邮件通知</span>
            <el-switch
                v-model="config.notification.email"
                :disabled="!isEditMode"
                @change="handleConfigChange"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 底部操作栏（仅编辑态显示） -->
    <div v-if="isEditMode" class="footer-actions">
      <el-button icon="Close" @click="handleCancelEdit">取消</el-button>
      <el-button type="primary" icon="Check" @click="handleSaveConfig" :loading="saving">
        保存配置
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Setting, Share, Clock, CopyDocument, Bell, Edit, RefreshLeft, Close, Check
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 权限判断
const isAdmin = computed(() => userStore.isAdmin)

// 编辑模式
const isEditMode = ref(false)
const saving = ref(false)

// 配置数据
const config = reactive({
  // 基础审批配置
  basic: {
    allowWithdraw: true,
    skipEmptyApprover: true,
    skipDuplicateApprover: true,
    requireRejectComment: true,
    requireApproveComment: false
  },
  // 流程流转配置
  flow: {
    allowAddSign: true,
    allowTransfer: true,
    countersignRule: 'all',
    allowUrge: true
  },
  // 超时处理配置
  timeout: {
    enableTimeoutRemind: true,
    remindHours: 24,
    timeoutAction: 'remind'
  },
  // 抄送配置
  cc: {
    ccLeaderOnComplete: true,
    ccInitiatorOnReject: true,
    ccAdminOnException: true
  },
  // 通知提醒配置
  notification: {
    stationMessage: true,
    sms: false,
    email: true
  }
})

// 备份原始配置（用于取消编辑时恢复）
const originalConfig = ref(null)

// 配置是否被修改
const isConfigChanged = ref(false)

// 编辑配置
const handleEditConfig = () => {
  isEditMode.value = true
  // 备份当前配置
  originalConfig.value = JSON.parse(JSON.stringify(config))
  isConfigChanged.value = false
}

// 取消编辑
const handleCancelEdit = () => {
  if (isConfigChanged.value) {
    ElMessageBox.confirm(
        '您有未保存的修改,确定要取消编辑吗?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '继续编辑',
          type: 'warning'
        }
    ).then(() => {
      // 恢复原始配置
      Object.assign(config, JSON.parse(JSON.stringify(originalConfig.value)))
      isEditMode.value = false
      isConfigChanged.value = false
      ElMessage.info('已取消编辑')
    }).catch(() => {})
  } else {
    isEditMode.value = false
    isConfigChanged.value = false
  }
}

// 配置变更
const handleConfigChange = () => {
  isConfigChanged.value = true
}

// 保存配置
const handleSaveConfig = () => {
  saving.value = true

  // 模拟保存请求
  setTimeout(() => {
    saving.value = false
    isEditMode.value = false
    isConfigChanged.value = false
    originalConfig.value = null

    ElMessage.success('配置保存成功,全局实时生效')
  }, 800)
}

// 重置默认
const handleResetDefaults = () => {
  ElMessageBox.confirm(
      '确定要将所有配置恢复为默认值吗?此操作不可撤销!',
      '⚠️ 高危操作确认',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '取消',
        type: 'error',
        distinguishCancelAndClose: true
      }
  ).then(() => {
    // 恢复默认配置
    config.basic = {
      allowWithdraw: true,
      skipEmptyApprover: true,
      skipDuplicateApprover: true,
      requireRejectComment: true,
      requireApproveComment: false
    }
    config.flow = {
      allowAddSign: true,
      allowTransfer: true,
      countersignRule: 'all',
      allowUrge: true
    }
    config.timeout = {
      enableTimeoutRemind: true,
      remindHours: 24,
      timeoutAction: 'remind'
    }
    config.cc = {
      ccLeaderOnComplete: true,
      ccInitiatorOnReject: true,
      ccAdminOnException: true
    }
    config.notification = {
      stationMessage: true,
      sms: false,
      email: true
    }

    isConfigChanged.value = false
    ElMessage.success('已恢复默认配置')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">
.global-process-params {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 22px;
        color: #303133;
        font-weight: 600;
      }

      .subtitle {
        margin: 0;
        font-size: 14px;
        color: #909399;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .config-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .config-card {
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      :deep(.el-card__header) {
        padding: 16px 20px;
        border-bottom: 2px solid #f0f0f0;
      }

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .card-content {
        padding: 8px 0;

        .config-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          transition: background-color 0.2s;

          &:hover {
            background-color: #f5f7fa;
          }

          &.vertical {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;

            .unit-text {
              margin-left: 8px;
              color: #909399;
              font-size: 14px;
            }
          }

          .item-label {
            font-size: 14px;
            color: #606266;
            flex: 1;
          }
        }
      }
    }
  }

  .footer-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 16px;
    padding: 16px 20px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    z-index: 100;
  }
}
</style>
