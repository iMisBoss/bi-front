<template>
  <div class="personal-document-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>个人公文中心</h2>
      </div>
    </div>

    <!-- Tab 页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="待办办理" name="todo" />
        <el-tab-pane label="我的公文" name="my" />
        <el-tab-pane label="发起公文" name="start" />
      </el-tabs>

      <!-- 待办办理 -->
      <div v-if="activeTab === 'todo'" class="tab-content">
        <el-table :data="todoList" border v-loading="loading">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="sender" label="发起人" width="100" />
          <el-table-column prop="receiveTime" label="接收时间" width="160" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleProcess(row)">办理</el-button>
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ todoList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="todoList.length" />
        </div>
      </div>

      <!-- 我的公文 -->
      <div v-if="activeTab === 'my'" class="tab-content">
        <el-table :data="myList" border v-loading="loading">
          <el-table-column prop="title" label="公文标题" min-width="250" show-overflow-tooltip />
          <el-table-column prop="docType" label="公文类型" width="120" />
          <el-table-column prop="docNumber" label="文号" width="150" />
          <el-table-column prop="sendTime" label="发送时间" width="160" sortable />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small" effect="plain">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination">
          <span class="total">共 {{ myList.length }} 条</span>
          <el-pagination layout="prev, pager, next" :total="myList.length" />
        </div>
      </div>

      <!-- 发起公文 -->
      <div v-if="activeTab === 'start'" class="tab-content">
        <el-row :gutter="20">
          <el-col :span="8" v-for="item in docTypes" :key="item.value">
            <el-card shadow="hover" class="doc-type-card" @click="handleStartDoc(item)">
              <div class="card-icon">
                <el-icon :size="40" :color="item.color"><component :is="item.icon" /></el-icon>
              </div>
              <div class="card-title">{{ item.label }}</div>
              <div class="card-desc">{{ item.desc }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Edit, Folder } from '@element-plus/icons-vue'

const activeTab = ref('todo')
const loading = ref(false)

const todoList = ref([
  { id: 1, title: '关于加强春节放假通知', docType: '通知', docNumber: '建信发〔2026〕1号', sender: '行政部', receiveTime: '2026-01-15 09:00', status: '待办理' },
  { id: 2, title: '2026年度工作计划报告', docType: '报告', docNumber: '建信报〔2026〕2号', sender: '财务部', receiveTime: '2026-01-14 14:00', status: '办理中' }
])

const myList = ref([
  { id: 101, title: '关于申请采购办公用品的请示', docType: '请示', docNumber: '建信请〔2026〕5号', sendTime: '2026-01-13 10:00', status: '审批中' },
  { id: 102, title: '关于调整会议安排的通知', docType: '通知', docNumber: '建信发〔2026〕3号', sendTime: '2026-01-12 16:00', status: '已发布' }
])

const docTypes = ref([
  { value: 'request', label: '请示', desc: '向上级请求指示或批准', icon: Document, color: '#409EFF' },
  { value: 'report', label: '报告', desc: '向上级汇报工作或反映情况', icon: Edit, color: '#67C23A' },
  { value: 'notice', label: '通知', desc: '传达要求下级机关办理的事项', icon: Folder, color: '#E6A23C' },
  { value: 'decision', label: '决定', desc: '对重要事项作出决策和部署', icon: Document, color: '#F56C6C' }
])

const handleTabChange = (tab) => {
  console.log('切换到 Tab:', tab)
}

const handleProcess = (row) => {
  ElMessage.info('打开公文办理流程')
}

const handleView = (row) => {
  ElMessage.info('查看公文详情')
}

const handleStartDoc = (item) => {
  ElMessage.info(`发起${item.label}`)
}

const getStatusType = (status) => {
  const map = { '待办理': 'warning', '办理中': 'primary', '已发布': 'success', '审批中': 'warning' }
  return map[status] || 'info'
}

onMounted(() => {
  console.log('个人公文中心加载')
})
</script>

<style scoped lang="scss">
.personal-document-page {
  padding: 20px;
  background: #f0f2f5;
  min-height: calc(100vh - 60px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    background: #fff;
    padding: 16px 20px;
    border-radius: 4px;

    .header-left h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .tab-card {
    :deep(.el-card__body) {
      padding: 0 20px 20px;
    }

    :deep(.el-tabs__header) {
      padding: 0;
      margin-bottom: 16px;
      background-color: transparent;
      border-bottom: 1px solid #e8e8e8;
    }

    .tab-content {
      .pagination {
        margin-top: 16px;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .total {
          font-size: 14px;
          color: #606266;
        }
      }

      .doc-type-card {
        margin-bottom: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-5px);
        }

        .card-icon {
          margin-bottom: 16px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .card-desc {
          font-size: 13px;
          color: #909399;
        }
      }
    }
  }
}
</style>
