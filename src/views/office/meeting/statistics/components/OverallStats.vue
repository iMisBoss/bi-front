<template>
  <div class="overall-stats">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">总会议数</span>
          <el-icon class="metric-icon" color="#409eff"><Calendar /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.totalMeetings.month }}</div>
        <div class="metric-sub">
          <span>本月</span>
          <span class="trend-down">↓ 12%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">会议室利用率</span>
          <el-icon class="metric-icon" color="#67c23a"><OfficeBuilding /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.roomUtilization }}%</div>
        <div class="metric-sub">
          <span>最高: {{ statsData.highestUtilizationRoom }}</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">按时召开率</span>
          <el-icon class="metric-icon" color="#e6a23c"><Clock /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.onTimeRate }}%</div>
        <div class="metric-sub">
          <span>平均时长: {{ statsData.avgDuration }}分钟</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">平均参会率</span>
          <el-icon class="metric-icon" color="#f56c6c"><User /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.avgAttendanceRate }}%</div>
        <div class="metric-sub">
          <span>迟到率: {{ statsData.avgLateRate }}%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">审批通过率</span>
          <el-icon class="metric-icon" color="#909399"><DocumentChecked /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.approvalRate }}%</div>
        <div class="metric-sub">
          <span>纪要完成率: {{ statsData.minutesRate }}%</span>
        </div>
      </el-card>
    </div>

    <!-- 核心图表区 -->
    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议趋势图（近30天）</span>
            <el-radio-group v-model="trendChartType" size="small">
              <el-radio-button label="line">折线</el-radio-button>
              <el-radio-button label="bar">柱状</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议类型分布</span>
          </div>
        </template>
        <div ref="typeChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议室使用TOP5</span>
          </div>
        </template>
        <div ref="roomTopChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>部门会议数量排行</span>
          </div>
        </template>
        <div ref="deptRankChartRef" class="chart-container"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Calendar, OfficeBuilding, Clock, User, DocumentChecked } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const trendChartType = ref('line')
const trendChartRef = ref(null)
const typeChartRef = ref(null)
const roomTopChartRef = ref(null)
const deptRankChartRef = ref(null)

let trendChart = null
let typeChart = null
let roomTopChart = null
let deptRankChart = null

const initTrendChart = () => {
  if (!trendChartRef.value) return

  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: props.statsData.meetingTrend.map(item => item.date)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '会议数量',
        type: trendChartType.value,
        data: props.statsData.meetingTrend.map(item => item.count),
        smooth: true,
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: trendChartType.value === 'line' ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        } : undefined
      }
    ]
  }

  trendChart.setOption(option)
}

const initTypeChart = () => {
  if (!typeChartRef.value) return

  if (!typeChart) {
    typeChart = echarts.init(typeChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center'
    },
    series: [
      {
        name: '会议类型',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: props.statsData.typeDistribution
      }
    ]
  }

  typeChart.setOption(option)
}

const initRoomTopChart = () => {
  if (!roomTopChartRef.value) return

  if (!roomTopChart) {
    roomTopChart = echarts.init(roomTopChartRef.value)
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
      data: props.statsData.roomTop5.map(item => item.name).reverse()
    },
    series: [
      {
        name: '使用率',
        type: 'bar',
        data: props.statsData.roomTop5.map(item => item.usage).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#67c23a' },
            { offset: 1, color: '#95d475' }
          ])
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}%'
        }
      }
    ]
  }

  roomTopChart.setOption(option)
}

const initDeptRankChart = () => {
  if (!deptRankChartRef.value) return

  if (!deptRankChart) {
    deptRankChart = echarts.init(deptRankChartRef.value)
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
      data: props.statsData.departmentRanking.map(item => item.name).reverse()
    },
    series: [
      {
        name: '会议数量',
        type: 'bar',
        data: props.statsData.departmentRanking.map(item => item.count).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#79bbff' }
          ])
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  }

  deptRankChart.setOption(option)
}

const initAllCharts = () => {
  initTrendChart()
  initTypeChart()
  initRoomTopChart()
  initDeptRankChart()
}

watch(() => props.statsData, () => {
  nextTick(() => {
    initAllCharts()
  })
}, { deep: true })

watch(trendChartType, () => {
  initTrendChart()
})

onMounted(() => {
  nextTick(() => {
    initAllCharts()
  })

  window.addEventListener('resize', () => {
    trendChart?.resize()
    typeChart?.resize()
    roomTopChart?.resize()
    deptRankChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.overall-stats {
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
        display: flex;
        justify-content: space-between;

        .trend-down {
          color: #67c23a;
        }
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
