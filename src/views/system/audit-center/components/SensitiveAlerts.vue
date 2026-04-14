<template>
  <div class="sensitive-alerts">
    <!-- 告警统计 -->
    <el-row :gutter="16" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #f56c6c">{{ alertStats.unhandled }}</div>
            <div class="stat-label">未处理告警</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value" style="color: #e6a23c">{{ alertStats.highRisk }}</div>
            <div class="stat-label">高风险告警</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ alertStats.todayAlerts }}</div>
            <div class="stat-label">今日告警数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-content">
            <div class="stat-value">{{ alertStats.handled }}</div>
            <div class="stat-label">已处理告警</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-radio-group v-model="alertStatus">
          <el-radio label="all">全部</el-radio>
          <el-radio label="unhandled">未处理</el-radio>
          <el-radio label="handled">已处理</el-radio>
          <el-radio label="ignored">已忽略</el-radio>
        </el-radio-group>
      </div>
      <div class="toolbar-right">
        <el-button-group>
          <el-button @click="handleBatchHandle" :disabled="selectedRows.length === 0">批量处理</el-button>
          <el-button @click="handleBatchIgnore" :disabled="selectedRows.length === 0">批量忽略</el-button>
        </el-button-group>
        <el-button @click="handleExport" icon="Download">导出告警记录</el-button>
      </div>
    </div>

    <!-- 告警列表 -->
    <el-table
        :data="filteredAlerts"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="time" label="触发时间" width="160" />
      <el-table-column prop="type" label="告警类型" width="150" />
      <el-table-column prop="user" label="触发用户" width="100" />
      <el-table-column prop="riskLevel" label="风险等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getRiskType(row.riskLevel)" size="small">{{ row.riskLevel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="告警内容" min-width="250" show-overflow-tooltip />
      <el-table-column prop="status" label="处理状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getAlertStatusType(row.status)" size="small">{{ getAlertStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="handler" label="处理人" width="100" />
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">详情</el-button>
          <el-button
              v-if="row.status === 'unhandled'"
              link
              type="success"
              size="small"
              @click="handleHandle(row)"
          >
            处理
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          :total="alerts.length"
          :page-size="20"
          layout="total, prev, pager, next, jumper"
      />
    </div>

    <!-- 告警详情抽屉 -->
    <el-drawer v-model="showDetailDrawer" title="告警详情" size="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="触发时间">{{ currentAlert?.time }}</el-descriptions-item>
        <el-descriptions-item label="告警类型">{{ currentAlert?.type }}</el-descriptions-item>
        <el-descriptions-item label="触发用户">{{ currentAlert?.user }}</el-descriptions-item>
        <el-descriptions-item label="风险等级">
          <el-tag :type="getRiskType(currentAlert?.riskLevel)">{{ currentAlert?.riskLevel }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="告警内容">{{ currentAlert?.content }}</el-descriptions-item>
        <el-descriptions-item label="处理状态">{{ getAlertStatusText(currentAlert?.status) }}</el-descriptions-item>
        <el-descriptions-item label="处理人">{{ currentAlert?.handler || '未处理' }}</el-descriptions-item>
        <el-descriptions-item label="处理意见">{{ currentAlert?.opinion || '无' }}</el-descriptions-item>
      </el-descriptions>

      <el-form v-if="currentAlert?.status === 'unhandled'" label-width="100px" style="margin-top: 20px">
        <el-form-item label="处理意见">
          <el-input
              v-model="handleOpinion"
              type="textarea"
              :rows="3"
              placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="showDetailDrawer = false">关闭</el-button>
          <el-button v-if="currentAlert?.status === 'unhandled'" type="primary" @click="handleConfirmHandle">确认处理</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const alertStatus = ref('all')
const selectedRows = ref([])
const showDetailDrawer = ref(false)
const currentAlert = ref(null)
const handleOpinion = ref('')

const alertStats = reactive({
  unhandled: 8,
  highRisk: 3,
  todayAlerts: 12,
  handled: 156
})

const alerts = ref([
  { id: 1, time: '2026-04-15 10:30', type: '账号安全', user: '张三', riskLevel: '高', content: '多次密码错误，账号已被锁定', status: 'unhandled', handler: '', opinion: '' },
  { id: 2, time: '2026-04-15 09:15', type: '权限风险', user: '李四', riskLevel: '高', content: '批量回收权限操作，涉及15个用户', status: 'unhandled', handler: '', opinion: '' },
  { id: 3, time: '2026-04-14 16:20', type: '数据风险', user: '王五', riskLevel: '中', content: '导出全量审计日志', status: 'handled', handler: '管理员', opinion: '已核实为正常操作' },
  { id: 4, time: '2026-04-14 14:10', type: '系统风险', user: '赵六', riskLevel: '中', content: '修改审计规则配置', status: 'handled', handler: '管理员', opinion: '已确认变更' },
  { id: 5, time: '2026-04-14 11:30', type: '账号安全', user: '钱七', riskLevel: '低', content: '异地登录提醒', status: 'ignored', handler: '管理员', opinion: '误报，已忽略' }
])

const filteredAlerts = computed(() => {
  if (alertStatus.value === 'all') {
    return alerts.value
  }
  return alerts.value.filter(alert => alert.status === alertStatus.value)
})

const getRiskType = (level) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[level] || ''
}

const getAlertStatusType = (status) => {
  const types = {
    'unhandled': 'danger',
    'handled': 'success',
    'ignored': 'info'
  }
  return types[status] || ''
}

const getAlertStatusText = (status) => {
  const texts = {
    'unhandled': '未处理',
    'handled': '已处理',
    'ignored': '已忽略'
  }
  return texts[status] || status
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleViewDetail = (row) => {
  currentAlert.value = row
  handleOpinion.value = ''
  showDetailDrawer.value = true
}

const handleHandle = (row) => {
  currentAlert.value = row
  handleOpinion.value = ''
  showDetailDrawer.value = true
}

const handleConfirmHandle = () => {
  if (!handleOpinion.value) {
    ElMessage.warning('请输入处理意见')
    return
  }
  currentAlert.value.status = 'handled'
  currentAlert.value.handler = '系统管理员'
  currentAlert.value.opinion = handleOpinion.value
  showDetailDrawer.value = false
  ElMessage.success('告警处理成功')
}

const handleBatchHandle = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => {
    row.status = 'handled'
    row.handler = '系统管理员'
    row.opinion = '批量处理'
  })
  ElMessage.success('批量处理成功')
  selectedRows.value = []
}

const handleBatchIgnore = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => {
    row.status = 'ignored'
    row.handler = '系统管理员'
    row.opinion = '批量忽略'
  })
  ElMessage.success('批量忽略成功')
  selectedRows.value = []
}

const handleExport = () => {
  ElMessage.success('告警记录导出成功')
}
</script>

<style lang="scss" scoped>
.sensitive-alerts {
  display: flex;
  flex-direction: column;
  height: 100%;

  .stat-card {
    border-radius: 8px;

    .stat-content {
      text-align: center;
      padding: 12px 0;

      .stat-value {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
