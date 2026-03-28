<template>
  <div class="mobile-approval-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>移动审批</span>
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <el-tab-pane label="待我审批" name="pending">
              <el-badge :value="pendingCount" :hidden="pendingCount === 0" />
            </el-tab-pane>
            <el-tab-pane label="我已审批" name="approved" />
            <el-tab-pane label="我发起的" name="initiated" />
          </el-tabs>
        </div>
      </template>

      <el-timeline>
        <el-timeline-item
            v-for="item in tableData"
            :key="item.id"
            :timestamp="item.applyTime"
            placement="top"
            :color="getStatusColor(item.status)"
        >
          <el-card shadow="hover">
            <div class="approval-item">
              <div class="approval-header">
                <div class="approval-title">
                  <el-tag :type="getTypeTag(item.type)" size="small">{{ item.typeName }}</el-tag>
                  <span class="title-text">{{ item.title }}</span>
                </div>
                <el-tag :type="item.status === 1 ? 'warning' : item.status === 2 ? 'success' : 'info'" size="small">
                  {{ item.statusText }}
                </el-tag>
              </div>
              <div class="approval-content">
                <p><strong>申请人：</strong>{{ item.applicant }}</p>
                <p><strong>申请时间：</strong>{{ item.applyTime }}</p>
                <p><strong>申请内容：</strong>{{ item.content }}</p>
              </div>
              <div class="approval-actions">
                <el-button
                    v-if="activeTab === 'pending' && item.status === 1"
                    type="primary"
                    size="small"
                    @click="handleApprove(item)"
                >
                  同意
                </el-button>
                <el-button
                    v-if="activeTab === 'pending' && item.status === 1"
                    type="danger"
                    size="small"
                    @click="handleReject(item)"
                >
                  拒绝
                </el-button>
                <el-button
                    size="small"
                    @click="handleView(item)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="tableData.length === 0" description="暂无审批记录" />
    </el-card>

    <el-dialog v-model="dialogVisible" title="审批详情" width="600px">
      <div class="approval-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="申请类型">{{ currentApproval.typeName }}</el-descriptions-item>
          <el-descriptions-item label="申请人">{{ currentApproval.applicant }}</el-descriptions-item>
          <el-descriptions-item label="申请部门">{{ currentApproval.department }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentApproval.applyTime }}</el-descriptions-item>
          <el-descriptions-item label="申请内容" :span="2">
            {{ currentApproval.content }}
          </el-descriptions-item>
          <el-descriptions-item label="附件">
            <el-tag v-for="(file, index) in currentApproval.attachments" :key="index" style="margin-right: 10px">
              {{ file }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider v-if="currentApproval.approvalFlow && currentApproval.approvalFlow.length > 0">
          审批流程
        </el-divider>

        <el-timeline v-if="currentApproval.approvalFlow && currentApproval.approvalFlow.length > 0">
          <el-timeline-item
              v-for="(node, index) in currentApproval.approvalFlow"
              :key="index"
              :timestamp="node.time"
              :color="node.status === 1 ? '#67c23a' : '#f56c6c'"
          >
            <div class="approval-node">
              <div class="node-title">{{ node.name }} - {{ node.approver }}</div>
              <div class="node-status">
                <el-tag :type="node.status === 1 ? 'success' : 'danger'" size="small">
                  {{ node.status === 1 ? '已同意' : '已拒绝' }}
                </el-tag>
                <span v-if="node.comment" class="node-comment">{{ node.comment }}</span>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button
            v-if="activeTab === 'pending' && currentApproval.status === 1"
            type="primary"
            @click="handleApprove(currentApproval)"
        >
          同意
        </el-button>
        <el-button
            v-if="activeTab === 'pending' && currentApproval.status === 1"
            type="danger"
            @click="handleReject(currentApproval)"
        >
          拒绝
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="opinionVisible" :title="opinionType === 'approve' ? '同意' : '拒绝'" width="500px">
      <el-form :model="opinionForm" label-width="80px">
        <el-form-item label="审批意见">
          <el-input v-model="opinionForm.comment" type="textarea" :rows="4" placeholder="请输入审批意见" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="opinionVisible = false">取消</el-button>
        <el-button :type="opinionType === 'approve' ? 'primary' : 'danger'" @click="handleOpinionSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const activeTab = ref('pending')
const tableData = ref([])
const dialogVisible = ref(false)
const opinionVisible = ref(false)
const opinionType = ref('approve')
const currentApproval = ref({})
const opinionForm = ref({
  comment: ''
})

const pendingCount = computed(() => {
  return tableData.value.filter(item => item.status === 1).length
})

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      {
        id: 1,
        type: 'leave',
        typeName: '请假',
        title: '张三的请假申请',
        applicant: '张三',
        department: '技术部',
        applyTime: '2024-01-15 10:00',
        content: '因个人原因，需请假 3 天，时间：2024 年 1 月 20 日至 1 月 22 日',
        status: 1,
        statusText: '待审批',
        attachments: ['请假条.pdf'],
        approvalFlow: [
          { name: '部门经理审批', approver: '李四', time: '2024-01-15 11:00', status: 1, comment: '同意' }
        ]
      },
      {
        id: 2,
        type: 'meeting',
        typeName: '会议',
        title: '会议室预定申请',
        applicant: '王五',
        department: '市场部',
        applyTime: '2024-01-14 09:00',
        content: '申请使用第一会议室，时间：2024 年 1 月 18 日下午 2 点',
        status: 2,
        statusText: '已审批',
        attachments: [],
        approvalFlow: [
          { name: '行政审批', approver: '赵六', time: '2024-01-14 10:00', status: 1, comment: '已安排' }
        ]
      }
    ]
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleView = (row) => {
  currentApproval.value = row
  dialogVisible.value = true
}

const handleApprove = (row) => {
  currentApproval.value = row
  opinionType.value = 'approve'
  opinionForm.value = { comment: '' }
  opinionVisible.value = true
}

const handleReject = (row) => {
  currentApproval.value = row
  opinionType.value = 'reject'
  opinionForm.value = { comment: '' }
  opinionVisible.value = true
}

const handleOpinionSubmit = () => {
  const action = opinionType.value === 'approve' ? '同意' : '拒绝'
  ElMessage.success(`已${action}`)
  opinionVisible.value = false
  dialogVisible.value = false
  loadData()
}

const getTypeTag = (type) => {
  const types = { leave: 'warning', meeting: 'primary', vehicle: 'success', seal: 'danger' }
  return types[type] || 'info'
}

const getStatusColor = (status) => {
  const colors = { 1: '#e6a23c', 2: '#67c23a', 3: '#909399' }
  return colors[status] || '#dcdfe6'
}
</script>

<style lang="scss" scoped>
.mobile-approval-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .approval-item {
    .approval-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .approval-title {
        display: flex;
        align-items: center;
        gap: 10px;

        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .approval-content {
      margin-bottom: 15px;

      p {
        margin: 8px 0;
        color: #606266;
        line-height: 1.6;

        strong {
          color: #333;
        }
      }
    }

    .approval-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
  }

  .approval-detail {
    .approval-node {
      .node-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
      }

      .node-status {
        display: flex;
        align-items: center;
        gap: 10px;

        .node-comment {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
}
</style>
