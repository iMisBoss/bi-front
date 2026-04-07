<template>
  <div class="approval-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="handleBack" icon="ArrowLeft">返回</el-button>
        <h2>{{ approvalInfo.title }}</h2>
        <el-tag :type="getStatusType(approvalInfo.status)" size="large">
          {{ approvalInfo.status }}
        </el-tag>
      </div>
      <div class="header-right">
        <el-button @click="handleSave" icon="Download">保存</el-button>
        <el-button type="primary" @click="handleSubmit" icon="Check">提交</el-button>
        <el-button @click="handlePrint" icon="Printer">打印</el-button>
        <el-button @click="handleFavorite" icon="Star">收藏</el-button>
        <el-button @click="handleLinkProcess" icon="Connection">关联流程</el-button>
        <el-button @click="handleClose" icon="Close">关闭</el-button>
      </div>
    </div>

    <!-- Tab 页签 -->
    <el-tabs v-model="activeTab" class="detail-tabs">
      <!-- 批示表单 -->
      <el-tab-pane label="批示表单" name="form">
        <div class="tab-content">
          <ApprovalForm />
        </div>
      </el-tab-pane>

      <!-- 流程记录 -->
      <el-tab-pane label="流程记录" name="history">
        <div class="tab-content">
          <ProcessHistory />
        </div>
      </el-tab-pane>

      <!-- 流程图 -->
      <el-tab-pane label="流程图" name="flowchart">
        <div class="tab-content">
          <ProcessFlowchart />
        </div>
      </el-tab-pane>

      <!-- 关联流程 -->
      <el-tab-pane label="关联流程" name="related">
        <div class="tab-content">
          <RelatedProcesses />
        </div>
      </el-tab-pane>

      <!-- 相关附件 - 仅在审批中状态显示 -->
      <el-tab-pane
          v-if="showRelatedAttachments"
          label="相关附件"
          name="attachments"
      >
        <div class="tab-content">
          <RelatedAttachments />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Download, Check, Printer, Star, Connection, Close } from '@element-plus/icons-vue'
import ApprovalForm from './tabs/ApprovalForm.vue'
import ProcessHistory from './tabs/ProcessHistory.vue'
import ProcessFlowchart from './tabs/ProcessFlowchart.vue'
import RelatedProcesses from './tabs/RelatedProcesses.vue'
import RelatedAttachments from './tabs/RelatedAttachments.vue'

const activeTab = ref('form')

const approvalInfo = reactive({
  id: '',
  title: '公司事务申请',
  status: '审批中',
  applicant: '张三',
  department: '信息技术部',
  applyTime: '2024-01-15 09:30:00',
  templateName: '公司事务申请'
})

// 计算属性：是否显示相关附件 Tab（仅在审批中状态显示）
const showRelatedAttachments = computed(() => {
  return approvalInfo.status === '审批中'
})

// 获取 URL 参数
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search)
  approvalInfo.id = params.get('id') || ''
  const templateId = params.get('templateId') || ''
  console.log('审批 ID:', approvalInfo.id, '模板 ID:', templateId)
}

const getStatusType = (status) => {
  const statusMap = {
    '草稿': 'info',
    '审批中': 'warning',
    '已通过': 'success',
    '已驳回': 'danger',
    '已撤销': 'info'
  }
  return statusMap[status] || 'info'
}

const handleBack = () => {
  window.history.back()
}

const handleSave = () => {
  console.log('保存审批')
  ElMessage.success('保存成功')
}

const handleSubmit = () => {
  ElMessageBox.confirm('确认提交该审批吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('提交审批')
    ElMessage.success('提交成功')
  }).catch(() => {})
}

const handlePrint = () => {
  console.log('打印审批')
  window.print()
}

const handleFavorite = () => {
  console.log('收藏审批')
  ElMessage.success('收藏成功')
}

const handleLinkProcess = () => {
  console.log('关联流程')
  activeTab.value = 'related'
}

const handleClose = () => {
  ElMessageBox.confirm('确认关闭该审批吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('关闭审批')
    ElMessage.success('已关闭')
    window.close()
  }).catch(() => {})
}

onMounted(() => {
  getUrlParams()
})
</script>

<style scoped lang="scss">
.approval-detail {
  padding: 20px;
  min-height: 100vh;
  background-color: #f5f7fa;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 16px 24px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #333;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .detail-tabs {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    :deep(.el-tabs__header) {
      padding: 0 24px;
      margin-bottom: 0;
      background-color: #fafafa;
      border-bottom: 1px solid #e8e8e8;
      border-radius: 4px 4px 0 0;
    }

    :deep(.el-tabs__item) {
      height: 50px;
      line-height: 50px;
      font-size: 15px;
      color: #606266;

      &.is-active {
        color: #409EFF;
        font-weight: 600;
      }
    }

    .tab-content {
      padding: 24px;
      min-height: 600px;
    }
  }
}

@media print {
  .page-header,
  .detail-tabs :deep(.el-tabs__header) {
    display: none;
  }

  .tab-content {
    padding: 0;
  }
}
</style>
