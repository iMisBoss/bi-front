<template>
  <div class="exception-analysis">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">异常会议总数</span>
          <el-icon class="metric-icon" color="#f56c6c"><Warning /></el-icon>
        </div>
        <div class="metric-value">45</div>
        <div class="metric-sub">
          <span>占总会议数 8%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">取消会议占比</span>
          <el-icon class="metric-icon" color="#e6a23c"><CircleClose /></el-icon>
        </div>
        <div class="metric-value">5%</div>
        <div class="metric-sub">
          <span>主动取消 3%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">超时会议占比</span>
          <el-icon class="metric-icon" color="#f56c6c"><Timer /></el-icon>
        </div>
        <div class="metric-value">12%</div>
        <div class="metric-sub">
          <span>平均超时 25分钟</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">恶意占用次数</span>
          <el-icon class="metric-icon" color="#f56c6c"><Lock /></el-icon>
        </div>
        <div class="metric-value">8</div>
        <div class="metric-sub">
          <span>15分钟未签到</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">涉密异常会议数</span>
          <el-icon class="metric-icon" color="#909399"><Key /></el-icon>
        </div>
        <div class="metric-value">0</div>
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
            <span>异常会议类型分布</span>
          </div>
        </template>
        <div ref="exceptionTypeRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>取消会议原因分析</span>
          </div>
        </template>
        <div ref="cancelReasonRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>恶意占用 TOP5</span>
          </div>
        </template>
        <el-table :data="statsData.maliciousOccupancy" style="width: 100%" height="300">
          <el-table-column prop="name" label="姓名/部门" width="150" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === '个人' ? 'warning' : 'danger'">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="count" label="占用次数" width="120">
            <template #default="{ row }">
              <el-tag type="danger">{{ row.count }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalHours" label="累计时长(小时)" width="140" />
          <el-table-column prop="lastOccurrence" label="最近发生时间" width="160" />
          <el-table-column label="操作" width="100">
            <template #default>
              <el-button link type="primary" size="small">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>异常会议趋势（近30天）</span>
          </div>
        </template>
        <div ref="exceptionTrendRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Warning, CircleClose, Timer, Lock, Key } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const exceptionTypeRef = ref(null)
const cancelReasonRef = ref(null)
const exceptionTrendRef = ref(null)

let exceptionTypeChart = null
let cancelReasonChart = null
let exceptionTrendChart = null

const initExceptionType = () => {
  if (!exceptionTypeRef.value) return

  if (!exceptionTypeChart) {
    exceptionTypeChart = echarts.init(exceptionTypeRef.value)
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
        name: '异常类型',
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
          { value: 18, name: '取消会议', itemStyle: { color: '#e6a23c' } },
          { value: 15, name: '超时会议', itemStyle: { color: '#f56c6c' } },
          { value: 8, name: '无纪要', itemStyle: { color: '#909399' } },
          { value: 4, name: '恶意占用', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }

  exceptionTypeChart.setOption(option)
}

const initCancelReason = () => {
  if (!cancelReasonRef.value) return

  if (!cancelReasonChart) {
    cancelReasonChart = echarts.init(cancelReasonRef.value)
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
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['其他', '资源冲突', '业务调整', '个人原因'].reverse()
    },
    series: [
      {
        name: '取消次数',
        type: 'bar',
        data: [3, 5, 8, 12].reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#e6a23c' },
            { offset: 1, color: '#f0ad4e' }
          ])
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  }

  cancelReasonChart.setOption(option)
}

const initExceptionTrend = () => {
  if (!exceptionTrendRef.value) return

  if (!exceptionTrendChart) {
    exceptionTrendChart = echarts.init(exceptionTrendRef.value)
  }

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return `${d.getMonth() + 1}-${d.getDate()}`
  })

  const counts = Array.from({ length: 30 }, () => Math.floor(Math.random() * 5) + 1)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '异常数量'
    },
    series: [
      {
        name: '异常会议数',
        type: 'line',
        smooth: true,
        data: counts,
        itemStyle: {
          color: '#f56c6c'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        }
      }
    ]
  }

  exceptionTrendChart.setOption(option)
}

const initAllCharts = () => {
  initExceptionType()
  initCancelReason()
  initExceptionTrend()
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
    exceptionTypeChart?.resize()
    cancelReasonChart?.resize()
    exceptionTrendChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.exception-analysis {
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
