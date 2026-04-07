<template>
  <div class="progress-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>流程进度查询</h2>
      </div>
      <div class="header-right">
        <el-input
            v-model="searchText"
            placeholder="搜索流程名称/编号"
            style="width: 300px"
            clearable
            @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <!-- Tab 页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="我发起的流程" name="initiated" />
        <el-tab-pane label="我处理的流程" name="handled" />
        <el-tab-pane label="我参与的流程" name="involved" />
      </el-tabs>

      <!-- 流程列表 -->
      <el-table
          :data="filteredProcessList"
          style="width: 100%"
          border
          v-loading="loading"
          @row-click="handleRowClick"
      >
        <el-table-column prop="processNo" label="流程编号" width="160" />
        <el-table-column prop="processName" label="流程名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="title" label="流程标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="startTime" label="发起时间" width="160" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentNode" label="当前节点" width="150" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button
                size="small"
                type="primary"
                @click.stop="handleViewProgress(row)"
                icon="View"
            >
              查看进度
            </el-button>
            <el-button
                v-if="canUrge(row)"
                size="small"
                type="warning"
                @click.stop="handleUrge(row)"
                icon="Bell"
            >
              一键催办
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="table-footer">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 流程进度弹框 -->
    <el-dialog
        v-model="progressDialogVisible"
        title="流程进度详情"
        width="1200px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <div v-if="currentProcess" class="progress-detail">
        <!-- 流程基本信息 -->
        <el-card class="info-card" shadow="hover">
          <el-descriptions :column="3" border>
            <el-descriptions-item label="流程编号">{{ currentProcess.processNo }}</el-descriptions-item>
            <el-descriptions-item label="流程名称">{{ currentProcess.processName }}</el-descriptions-item>
            <el-descriptions-item label="流程标题">{{ currentProcess.title }}</el-descriptions-item>
            <el-descriptions-item label="发起人">{{ currentProcess.initiator }}</el-descriptions-item>
            <el-descriptions-item label="发起时间">{{ currentProcess.startTime }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(currentProcess.status)" size="small">
                {{ getStatusText(currentProcess.status) }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 可视化流程图 -->
        <el-card class="flowchart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Connection /></el-icon>
                可视化流程图
              </span>
            </div>
          </template>

          <div class="flowchart-container">
            <div class="flowchart-nodes">
              <div
                  v-for="(node, index) in flowNodes"
                  :key="node.id"
                  class="flow-node"
                  :class="[
                    getNodeStatusClass(node.status),
                    { 'is-timeout': node.isTimeout }
                  ]"
              >
                <div class="node-content">
                  <div class="node-index">{{ index + 1 }}</div>
                  <div class="node-info">
                    <div class="node-name">{{ node.name }}</div>
                    <div class="node-handler" v-if="node.handler">
                      <el-icon><User /></el-icon>
                      {{ node.handler }}
                    </div>
                    <div class="node-time" v-if="node.handleTime">
                      <el-icon><Clock /></el-icon>
                      {{ node.handleTime }}
                    </div>
                    <div class="node-status" v-if="node.status">
                      <el-tag :type="getNodeStatusTagType(node.status)" size="small">
                        {{ getNodeStatusText(node.status) }}
                      </el-tag>
                    </div>
                    <div class="node-timeout" v-if="node.isTimeout">
                      <el-icon><Warning /></el-icon>
                      已超时 {{ node.timeoutDuration }}
                    </div>
                  </div>
                </div>

                <!-- 节点间连线 -->
                <div v-if="index < flowNodes.length - 1" class="node-arrow">
                  <el-icon><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 流转日志和操作记录 -->
        <el-card class="log-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><Document /></el-icon>
                流转日志与操作记录
              </span>
            </div>
          </template>

          <el-timeline class="operation-timeline">
            <el-timeline-item
                v-for="(log, index) in operationLogs"
                :key="index"
                :timestamp="log.timestamp"
                placement="top"
                :color="log.color"
                :size="log.type === 'start' ? 'large' : 'normal'"
            >
              <el-card shadow="hover" :class="['log-item', `log-${log.type}`]">
                <div class="log-header">
                  <div class="log-type-badge" :style="{ backgroundColor: log.color }">
                    {{ getLogTypeText(log.type) }}
                  </div>
                  <div class="log-meta">
                    <span class="log-operator">{{ log.operator }}</span>
                    <span class="log-node">{{ log.node }}</span>
                  </div>
                </div>
                <div class="log-content">{{ log.content }}</div>
                <div class="log-footer" v-if="log.duration">
                  <el-tag size="small" type="info">
                    <el-icon><Timer /></el-icon>
                    处理耗时：{{ log.duration }}
                  </el-tag>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 超时节点催办 -->
        <el-alert
            v-if="hasTimeoutNodes && canUrge(currentProcess)"
            title="检测到超时未处理节点"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 16px;"
        >
          <template #default>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>当前有 {{ timeoutNodes.length }} 个节点超时未处理，可发送催办通知</span>
              <el-button type="warning" size="small" @click="handleUrgeAll" icon="Bell">
                一键催办全部
              </el-button>
            </div>
          </template>
        </el-alert>
      </div>

      <template #footer>
        <el-button @click="progressDialogVisible = false" icon="Close">关闭</el-button>
        <el-button
            v-if="canUrge(currentProcess)"
            type="warning"
            @click="handleUrge(currentProcess)"
            icon="Bell"
        >
          一键催办
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, View, Bell, Connection, User, Clock, Document,
  ArrowRight, Warning, Timer, Check, CircleClose
} from '@element-plus/icons-vue'

const activeTab = ref('initiated')
const loading = ref(false)
const progressDialogVisible = ref(false)
const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const currentProcess = ref(null)

// 流程列表数据
const processList = ref([
  {
    id: 1,
    processNo: 'LC20240115001',
    processName: '请假审批流程',
    title: '张三 - 2024 年春节请假申请',
    initiator: '张三',
    startTime: '2024-01-15 09:00:00',
    status: 'processing',
    currentNode: '部门经理审批',
    isInitiator: true
  },
  {
    id: 2,
    processNo: 'LC20240114001',
    processName: '采购申请流程',
    title: '李四 - 办公电脑采购申请',
    initiator: '李四',
    startTime: '2024-01-14 10:30:00',
    status: 'processing',
    currentNode: '财务审批',
    isInitiator: false
  },
  {
    id: 3,
    processNo: 'LC20240113001',
    processName: '费用报销流程',
    title: '王五 - 差旅费报销',
    initiator: '王五',
    startTime: '2024-01-13 14:20:00',
    status: 'completed',
    currentNode: '已结束',
    isInitiator: true
  },
  {
    id: 4,
    processNo: 'LC20240112001',
    processName: '会议申请流程',
    title: '赵六 - 年度总结会议申请',
    initiator: '赵六',
    startTime: '2024-01-12 08:50:00',
    status: 'processing',
    currentNode: '行政确认',
    isInitiator: true
  },
  {
    id: 5,
    processNo: 'LC20240111001',
    processName: '用印申请流程',
    title: '孙七 - 合同盖章申请',
    initiator: '孙七',
    startTime: '2024-01-11 16:00:00',
    status: 'timeout',
    currentNode: '法务审核',
    isInitiator: true
  }
])

// 流程节点数据
const flowNodes = ref([])

// 操作日志数据
const operationLogs = ref([])

// 超时节点
const timeoutNodes = computed(() => {
  return flowNodes.value.filter(node => node.isTimeout)
})

const hasTimeoutNodes = computed(() => {
  return timeoutNodes.value.length > 0
})

// 过滤后的流程列表
const filteredProcessList = computed(() => {
  let result = []

  if (activeTab.value === 'initiated') {
    result = processList.value.filter(item => item.isInitiator)
  } else if (activeTab.value === 'handled') {
    result = processList.value.filter(item => !item.isInitiator)
  } else {
    result = processList.value
  }

  // 搜索过滤
  if (searchText.value) {
    const text = searchText.value.toLowerCase()
    result = result.filter(item =>
        item.processName.toLowerCase().includes(text) ||
        item.processNo.toLowerCase().includes(text) ||
        item.title.toLowerCase().includes(text)
    )
  }

  return result
})

const getStatusType = (status) => {
  const typeMap = {
    'draft': 'info',
    'processing': 'warning',
    'completed': 'success',
    'terminated': 'danger',
    'timeout': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'draft': '草稿',
    'processing': '处理中',
    'completed': '已完成',
    'terminated': '已终止',
    'timeout': '已超时'
  }
  return textMap[status] || '未知'
}

// 获取节点状态样式类
const getNodeStatusClass = (status) => {
  if (!status) return ''
  const classMap = {
    'pending': 'node-pending',
    'processing': 'node-processing',
    'completed': 'node-completed',
    'rejected': 'node-rejected',
    'timeout': 'node-timeout'
  }
  return classMap[status] || ''
}

// 获取节点状态标签类型
const getNodeStatusTagType = (status) => {
  const typeMap = {
    'pending': 'info',
    'processing': 'warning',
    'completed': 'success',
    'rejected': 'danger',
    'timeout': 'danger'
  }
  return typeMap[status] || 'info'
}

// 获取节点状态文本
const getNodeStatusText = (status) => {
  const textMap = {
    'pending': '待处理',
    'processing': '处理中',
    'completed': '已完成',
    'rejected': '已拒绝',
    'timeout': '已超时'
  }
  return textMap[status] || '未知'
}

// 获取日志类型文本
const getLogTypeText = (type) => {
  const textMap = {
    'start': '发起',
    'approve': '审批',
    'reject': '驳回',
    'transfer': '转办',
    'assign': '加签',
    'urge': '催办',
    'timeout': '超时',
    'complete': '完成'
  }
  return textMap[type] || '未知'
}

// 判断是否可以催办（仅自己发起的流程且处理中）
const canUrge = (row) => {
  return row?.isInitiator && row?.status === 'processing'
}

// Tab 切换
const handleTabChange = (tab) => {
  console.log('切换到 Tab:', tab)
}

// 搜索
const handleSearch = () => {
  console.log('搜索:', searchText.value)
}

// 行点击
const handleRowClick = (row) => {
  // 可以设置为双击查看详情，单击选中
}

// 查看进度
const handleViewProgress = (row) => {
  currentProcess.value = row
  progressDialogVisible.value = true

  // 加载流程节点数据
  loadFlowNodes(row.id)

  // 加载操作日志
  loadOperationLogs(row.id)
}

// 加载流程节点
const loadFlowNodes = (processId) => {
  // 模拟数据
  flowNodes.value = [
    {
      id: 'node1',
      name: '发起人提交',
      handler: '张三',
      handleTime: '2024-01-15 09:00:00',
      status: 'completed',
      isTimeout: false
    },
    {
      id: 'node2',
      name: '部门经理审批',
      handler: '李四',
      handleTime: '2024-01-15 10:30:00',
      status: 'completed',
      isTimeout: false,
      timeoutDuration: null
    },
    {
      id: 'node3',
      name: '人力资源审核',
      handler: '王五',
      handleTime: null,
      status: 'processing',
      isTimeout: true,
      timeoutDuration: '2 小时 30 分钟'
    },
    {
      id: 'node4',
      name: '分管领导审批',
      handler: null,
      handleTime: null,
      status: 'pending',
      isTimeout: false
    },
    {
      id: 'node5',
      name: '归档',
      handler: null,
      handleTime: null,
      status: 'pending',
      isTimeout: false
    }
  ]
}

// 加载操作日志
const loadOperationLogs = (processId) => {
  // 模拟数据
  operationLogs.value = [
    {
      type: 'start',
      operator: '张三',
      node: '发起人提交',
      timestamp: '2024-01-15 09:00:00',
      content: '发起请假审批流程，请假时间：2024-02-10 至 2024-02-17，共 7 天',
      color: '#409EFF',
      duration: null
    },
    {
      type: 'approve',
      operator: '李四',
      node: '部门经理审批',
      timestamp: '2024-01-15 10:30:00',
      content: '同意。工作已安排妥当，请批准。',
      color: '#67C23A',
      duration: '1 小时 30 分钟'
    },
    {
      type: 'timeout',
      operator: '系统',
      node: '人力资源审核',
      timestamp: '2024-01-15 14:00:00',
      content: '该节点已超过规定处理时限（2 小时），已自动发送催办通知',
      color: '#E6A23C',
      duration: null
    },
    {
      type: 'urge',
      operator: '张三',
      node: '人力资源审核',
      timestamp: '2024-01-15 14:05:00',
      content: '发起人对当前节点发起催办',
      color: '#F56C6C',
      duration: null
    }
  ]
}

// 一键催办
const handleUrge = (row) => {
  ElMessageBox.confirm('确认向当前处理人发送催办通知吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 模拟催办操作
    ElMessage.success('催办通知已发送')

    // 添加催办日志
    operationLogs.value.unshift({
      type: 'urge',
      operator: row.initiator,
      node: row.currentNode,
      timestamp: new Date().toLocaleString('zh-CN'),
      content: '发起人对当前节点发起催办',
      color: '#F56C6C',
      duration: null
    })
  }).catch(() => {})
}

// 一键催办全部超时节点
const handleUrgeAll = () => {
  ElMessageBox.confirm(`确认向 ${timeoutNodes.value.length} 个超时节点的处理人发送催办通知吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success(`已向 ${timeoutNodes.value.length} 个节点发送催办通知`)

    // 添加催办日志
    timeoutNodes.value.forEach(node => {
      operationLogs.value.unshift({
        type: 'urge',
        operator: currentProcess.value.initiator,
        node: node.name,
        timestamp: new Date().toLocaleString('zh-CN'),
        content: '发起人对超时节点发起催办',
        color: '#F56C6C',
        duration: null
      })
    })
  }).catch(() => {})
}

onMounted(() => {
  // 加载数据
  total.value = processList.value.length
})
</script>

<style scoped lang="scss">
.progress-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 140px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h2 {
        font-size: 20px;
        color: #333;
        margin: 0;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .tab-card {
    :deep(.el-card__body) {
      padding: 0;
    }

    :deep(.el-tabs__header) {
      padding: 0 20px;
      margin-bottom: 0;
      background-color: #fafafa;
      border-bottom: 1px solid #e8e8e8;
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
  }

  .table-footer {
    margin-top: 20px;
    padding: 0 20px 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 进度详情样式
.progress-detail {
  .info-card {
    margin-bottom: 20px;
  }

  .flowchart-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;

        .el-icon {
          margin-right: 8px;
          vertical-align: middle;
        }
      }
    }

    .flowchart-container {
      padding: 20px;
      overflow-x: auto;

      .flowchart-nodes {
        display: flex;
        align-items: flex-start;
        gap: 20px;
        min-width: max-content;

        .flow-node {
          position: relative;
          display: flex;
          align-items: center;

          .node-content {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: #f5f7fa;
            border-radius: 8px;
            border: 2px solid #e4e7ed;
            transition: all 0.3s;

            .node-index {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background: #909399;
              color: #fff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              flex-shrink: 0;
            }

            .node-info {
              display: flex;
              flex-direction: column;
              gap: 8px;
              min-width: 150px;

              .node-name {
                font-size: 14px;
                font-weight: 600;
                color: #333;
              }

              .node-handler,
              .node-time {
                font-size: 12px;
                color: #606266;
                display: flex;
                align-items: center;
                gap: 4px;

                .el-icon {
                  font-size: 12px;
                }
              }
            }
          }

          .node-arrow {
            margin-left: 20px;
            color: #909399;
            font-size: 20px;
          }

          // 节点状态样式
          &.node-pending .node-content {
            border-color: #909399;
            background: #f4f4f5;

            .node-index {
              background: #909399;
            }
          }

          &.node-processing .node-content {
            border-color: #E6A23C;
            background: #fdf6ec;

            .node-index {
              background: #E6A23C;
            }
          }

          &.node-completed .node-content {
            border-color: #67C23A;
            background: #f0f9ff;

            .node-index {
              background: #67C23A;
            }
          }

          &.node-rejected .node-content {
            border-color: #F56C6C;
            background: #fef0f0;

            .node-index {
              background: #F56C6C;
            }
          }

          &.node-timeout .node-content {
            border-color: #F56C6C;
            background: #fef0f0;
            animation: pulse 2s infinite;

            .node-index {
              background: #F56C6C;
            }

            .node-timeout {
              color: #F56C6C;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }
      }
    }
  }

  .log-card {
    .card-header {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;

        .el-icon {
          margin-right: 8px;
          vertical-align: middle;
        }
      }
    }

    .operation-timeline {
      padding: 20px;

      .log-item {
        margin-bottom: 16px;

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .log-type-badge {
            padding: 4px 12px;
            border-radius: 12px;
            color: #fff;
            font-size: 12px;
            font-weight: 600;
          }

          .log-meta {
            display: flex;
            gap: 16px;
            font-size: 13px;

            .log-operator {
              color: #333;
              font-weight: 600;
            }

            .log-node {
              color: #909399;
            }
          }
        }

        .log-content {
          font-size: 14px;
          color: #606266;
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .log-footer {
          margin-top: 8px;
        }

        // 日志类型样式
        &.log-start {
          border-left: 4px solid #409EFF;
        }

        &.log-approve {
          border-left: 4px solid #67C23A;
        }

        &.log-reject {
          border-left: 4px solid #F56C6C;
        }

        &.log-timeout {
          border-left: 4px solid #E6A23C;
        }

        &.log-urge {
          border-left: 4px solid #F56C6C;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(245, 108, 108, 0);
  }
}
</style>
