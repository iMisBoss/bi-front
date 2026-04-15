<template>
  <div class="compliance-analysis">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">审批通过率</span>
          <el-icon class="metric-icon" color="#67c23a"><DocumentChecked /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.approvalRate }}%</div>
        <div class="metric-sub">
          <span>驳回率 6%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">纪要完成率</span>
          <el-icon class="metric-icon" color="#409eff"><Files /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.minutesRate }}%</div>
        <div class="metric-sub">
          <span>涉密会议 100%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">待办执行率</span>
          <el-icon class="metric-icon" color="#e6a23c"><List /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.todoCompletionRate }}%</div>
        <div class="metric-sub">
          <span>按时完成 65%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">操作留痕率</span>
          <el-icon class="metric-icon" color="#909399"><Stamp /></el-icon>
        </div>
        <div class="metric-value">100%</div>
        <div class="metric-sub">
          <span>全程可追溯</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">涉密会议合规率</span>
          <el-icon class="metric-icon" color="#f56c6c"><Lock /></el-icon>
        </div>
        <div class="metric-value">100%</div>
        <div class="metric-sub">
          <span>仅管理员可见</span>
        </div>
      </el-card>
    </div>

    <!-- 核心图表区 -->
    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>审批通过率趋势（近30天）</span>
          </div>
        </template>
        <div ref="approvalTrendRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>各部门纪要完成率对比</span>
          </div>
        </template>
        <div ref="minutesDeptRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>待办执行率分析</span>
          </div>
        </template>
        <div ref="todoChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>合规异常统计</span>
          </div>
        </template>
        <el-table :data="statsData.complianceExceptions" style="width: 100%" height="300">
          <el-table-column prop="meetingName" label="会议名称" min-width="200" />
          <el-table-column prop="exceptionType" label="异常类型" width="140">
            <template #default="{ row }">
              <el-tag :type="getExceptionType(row.exceptionType)">{{ row.exceptionType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="organizer" label="发起人" width="120" />
          <el-table-column prop="meetingDate" label="会议日期" width="140" />
          <el-table-column prop="status" label="处理状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.status === '已处理' ? 'success' : 'warning'">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { DocumentChecked, Files, List, Stamp, Lock } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const approvalTrendRef = ref(null)
const minutesDeptRef = ref(null)
const todoChartRef = ref(null)

let approvalTrendChart = null
let minutesDeptChart = null
let todoChart = null

const getExceptionType = (type) => {
  const typeMap = {
    '未留痕': 'danger',
    '未提交纪要': 'warning',
    '审批异常': 'warning'
  }
  return typeMap[type] || 'info'
}

const initApprovalTrend = () => {
  if (!approvalTrendRef.value) return

  if (!approvalTrendChart) {
    approvalTrendChart = echarts.init(approvalTrendRef.value)
  }

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return `${d.getMonth() + 1}-${d.getDate()}`
  })

  const rates = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 88)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>审批通过率: {c}%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 80,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '审批通过率',
        type: 'line',
        smooth: true,
        data: rates,
        itemStyle: {
          color: '#67c23a'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(103, 194, 58, 0.3)' },
            { offset: 1, color: 'rgba(103, 194, 58, 0.05)' }
          ])
        },
        markLine: {
          data: [
            { yAxis: 90, label: { formatter: '目标值 90%' }, lineStyle: { color: '#67c23a' } }
          ]
        }
      }
    ]
  }

  approvalTrendChart.setOption(option)
}

const initMinutesDept = () => {
  if (!minutesDeptRef.value) return

  if (!minutesDeptChart) {
    minutesDeptChart = echarts.init(minutesDeptRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: ['运营部', '产品部', '销售部', '市场部', '研发部'].reverse()
    },
    series: [
      {
        name: '纪要完成率',
        type: 'bar',
        data: [
          { value: 92, itemStyle: { color: '#67c23a' } },
          { value: 88, itemStyle: { color: '#67c23a' } },
          { value: 75, itemStyle: { color: '#f56c6c' } },
          { value: 85, itemStyle: { color: '#e6a23c' } },
          { value: 90, itemStyle: { color: '#67c23a' } }
        ].reverse(),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        },
        markLine: {
          data: [
            { xAxis: 80, label: { formatter: '达标线 80%' }, lineStyle: { color: '#f56c6c' } }
          ]
        }
      }
    ]
  }

  minutesDeptChart.setOption(option)
}

const initTodoChart = () => {
  if (!todoChartRef.value) return

  if (!todoChart) {
    todoChart = echarts.init(todoChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '待办执行情况',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        data: [
          { value: 65, name: '按时完成', itemStyle: { color: '#67c23a' } },
          { value: 20, name: '超时完成', itemStyle: { color: '#e6a23c' } },
          { value: 15, name: '未完成', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }

  todoChart.setOption(option)
}

const initAllCharts = () => {
  initApprovalTrend()
  initMinutesDept()
  initTodoChart()
}

watch(() => props.statsData, () => {
  nextTick(() => {
    initAllCharts()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initAllCharts()
  })

  window.addEventListener('resize', () => {
    approvalTrendChart?.resize()
    minutesDeptChart?.resize()
    todoChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.compliance-analysis {
  .metrics-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    .metric-card {
      .metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .metric-title {
          font-size: 14px;
          color: #909399;
        }

        .metric-icon {
          font-size: 24px;
        }
      }

      .metric-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 8px;
      }

      .metric-sub {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .charts-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 16px;

    .chart-card {
      :deep(.el-card__header) {
        padding: 12px 16px;
      }

      .chart-header {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .chart-container {
        height: 300px;
      }
    }
  }
}
</style>
