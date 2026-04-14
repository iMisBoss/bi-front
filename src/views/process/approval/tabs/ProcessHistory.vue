<template>
  <div class="process-history">
    <!-- 当前节点 -->
    <el-card class="current-node-card">
      <template #header>
        <div class="card-header">
          <el-tag type="success">当前节点</el-tag>
        </div>
      </template>
      <div class="node-info">
        <div class="node-title">部门负责人审批</div>
        <div class="node-processor">处理人：李四（部门负责人）</div>
        <div class="node-time">到达时间：2026-01-15 10:00:00</div>
        <div class="node-status">状态：<el-tag type="warning">待处理</el-tag></div>
      </div>
    </el-card>

    <!-- 审批记录 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>审批记录</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
            v-for="(record, index) in records"
            :key="index"
            :timestamp="record.time"
            placement="top"
            :color="record.color"
        >
          <el-card>
            <div class="record-header">
              <span class="record-node">{{ record.node }}</span>
              <el-tag :type="record.statusType">{{ record.status }}</el-tag>
            </div>
            <div class="record-content">
              <div><strong>处理人：</strong>{{ record.processor }}</div>
              <div><strong>审批意见：</strong>{{ record.opinion || '无' }}</div>
              <div v-if="record.attachment">
                <strong>附件：</strong>
                <el-link type="primary">{{ record.attachment }}</el-link>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 流程节点详细信息表 -->
    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>流程节点详情</span>
        </div>
      </template>
      <el-table :data="processNodes" style="width: 100%" size="default">
        <el-table-column prop="name" label="节点名称" width="180" />
        <el-table-column prop="handler" label="处理人" width="150" />
        <el-table-column prop="time" label="处理时间" width="200" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="default">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="comment" label="审批意见" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const records = [
  {
    node: '发起人提交',
    processor: '张三',
    time: '2026-01-15 09:30:00',
    status: '已提交',
    statusType: 'success',
    color: '#67C23A',
    opinion: '请领导审批',
    attachment: null
  },
  {
    node: '部门初审',
    processor: '王五（部门主管）',
    time: '2026-01-15 09:45:00',
    status: '已通过',
    statusType: 'success',
    color: '#67C23A',
    opinion: '同意，情况属实',
    attachment: null
  }
]

// 流程节点详细数据
const processNodes = ref([
  {
    name: '开始',
    handler: '张三',
    time: '2026-01-01 09:00:00',
    status: '已完成',
    comment: '同意'
  },
  {
    name: '部门经理审批',
    handler: '李四',
    time: '2026-01-01 14:30:00',
    status: '已完成',
    comment: '同意，请尽快推进'
  },
  {
    name: '分管领导审批',
    handler: '王五',
    time: '2026-01-02 10:15:00',
    status: '处理中',
    comment: ''
  },
  {
    name: '总经理审批',
    handler: '',
    time: '',
    status: '待处理',
    comment: ''
  },
  {
    name: '结束',
    handler: '',
    time: '',
    status: '待处理',
    comment: ''
  }
])

const getStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '处理中': 'warning',
    '待处理': 'info',
    '已驳回': 'danger'
  }
  return statusMap[status] || 'info'
}
</script>

<style scoped lang="scss">
.process-history {
  height: calc(100vh - 280px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background-color: #a8a8a8;
    }
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  .current-node-card {
    .node-info {
      padding: 20px 0;

      .node-title {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 12px;
      }

      .node-processor,
      .node-time,
      .node-status {
        font-size: 14px;
        color: #666;
        margin-bottom: 8px;
      }
    }
  }

  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .record-node {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .record-content {
    div {
      margin-bottom: 8px;
      font-size: 14px;
      color: #666;
    }
  }
}
</style>
