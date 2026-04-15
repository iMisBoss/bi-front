<template>
  <div class="attendance-analysis">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">平均参会率</span>
          <el-icon class="metric-icon" color="#409eff"><User /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.avgAttendanceRate }}%</div>
        <div class="metric-sub">
          <span>必填参会人 92%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">平均迟到率</span>
          <el-icon class="metric-icon" color="#f56c6c"><AlarmClock /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.avgLateRate }}%</div>
        <div class="metric-sub">
          <span>平均迟到 8分钟</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">缺席率</span>
          <el-icon class="metric-icon" color="#e6a23c"><CircleClose /></el-icon>
        </div>
        <div class="metric-value">6%</div>
        <div class="metric-sub">
          <span>未请假缺席 3%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">回执及时率</span>
          <el-icon class="metric-icon" color="#67c23a"><Checked /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.responseRate }}%</div>
        <div class="metric-sub">
          <span>会前完成回执</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">涉密会议参会率</span>
          <el-icon class="metric-icon" color="#909399"><Lock /></el-icon>
        </div>
        <div class="metric-value">98%</div>
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
            <span>各部门参会率对比</span>
          </div>
        </template>
        <div ref="attendanceDeptRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>迟到率趋势（近30天）</span>
          </div>
        </template>
        <div ref="lateTrendRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>参会人行为排行 TOP10</span>
            <el-tag type="info" size="small">仅管理员可见</el-tag>
          </div>
        </template>
        <el-table :data="statsData.attendeeBehavior" style="width: 100%" height="300">
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="totalMeetings" label="应参会数" width="100" />
          <el-table-column prop="attendedMeetings" label="实际参会" width="100" />
          <el-table-column prop="attendanceRate" label="参会率" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.attendanceRate" :color="getProgressColor(row.attendanceRate)" />
            </template>
          </el-table-column>
          <el-table-column prop="lateCount" label="迟到次数" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.lateCount > 0" type="danger">{{ row.lateCount }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="avgLateMinutes" label="平均迟到(分钟)" width="130" />
        </el-table>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>回执及时率分析</span>
          </div>
        </template>
        <div ref="responseChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { User, AlarmClock, CircleClose, Checked, Lock } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const attendanceDeptRef = ref(null)
const lateTrendRef = ref(null)
const responseChartRef = ref(null)

let attendanceDeptChart = null
let lateTrendChart = null
let responseChart = null

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}

const initAttendanceDept = () => {
  if (!attendanceDeptRef.value) return

  if (!attendanceDeptChart) {
    attendanceDeptChart = echarts.init(attendanceDeptRef.value)
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
        name: '参会率',
        type: 'bar',
        data: [
          { value: 88, itemStyle: { color: '#67c23a' } },
          { value: 85, itemStyle: { color: '#67c23a' } },
          { value: 78, itemStyle: { color: '#e6a23c' } },
          { value: 82, itemStyle: { color: '#67c23a' } },
          { value: 68, itemStyle: { color: '#f56c6c' } }
        ].reverse(),
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        },
        markLine: {
          data: [
            { xAxis: 70, label: { formatter: '预警线 70%' }, lineStyle: { color: '#f56c6c' } }
          ]
        }
      }
    ]
  }

  attendanceDeptChart.setOption(option)
}

const initLateTrend = () => {
  if (!lateTrendRef.value) return

  if (!lateTrendChart) {
    lateTrendChart = echarts.init(lateTrendRef.value)
  }

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return `${d.getMonth() + 1}-${d.getDate()}`
  })

  const rates = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 8)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>迟到率: {c}%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 30,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '迟到率',
        type: 'line',
        smooth: true,
        data: rates,
        itemStyle: {
          color: '#f56c6c'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        },
        markLine: {
          data: [
            { yAxis: 15, label: { formatter: '警戒线 15%' }, lineStyle: { color: '#f56c6c' } }
          ]
        }
      }
    ]
  }

  lateTrendChart.setOption(option)
}

const initResponseChart = () => {
  if (!responseChartRef.value) return

  if (!responseChart) {
    responseChart = echarts.init(responseChartRef.value)
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
        name: '回执情况',
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
          { value: 76, name: '及时回执', itemStyle: { color: '#67c23a' } },
          { value: 18, name: '超时回执', itemStyle: { color: '#e6a23c' } },
          { value: 6, name: '未回执', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }

  responseChart.setOption(option)
}

const initAllCharts = () => {
  initAttendanceDept()
  initLateTrend()
  initResponseChart()
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
    attendanceDeptChart?.resize()
    lateTrendChart?.resize()
    responseChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.attendance-analysis {
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
        display: flex;
        justify-content: space-between;
        align-items: center;
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
