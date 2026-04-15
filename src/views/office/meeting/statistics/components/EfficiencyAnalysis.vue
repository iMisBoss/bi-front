<template>
  <div class="efficiency-analysis">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">按时召开率</span>
          <el-icon class="metric-icon" color="#67c23a"><Clock /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.onTimeRate }}%</div>
        <div class="metric-sub">
          <span>较上月 +3%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">时长合规率</span>
          <el-icon class="metric-icon" color="#409eff"><Timer /></el-icon>
        </div>
        <div class="metric-value">72%</div>
        <div class="metric-sub">
          <span>超时会议占比 28%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">平均会议时长</span>
          <el-icon class="metric-icon" color="#e6a23c"><Stopwatch /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.avgDuration }}分钟</div>
        <div class="metric-sub">
          <span>标准时长 60分钟</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">无效会议占比</span>
          <el-icon class="metric-icon" color="#f56c6c"><Close /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.invalidMeetingRate }}%</div>
        <div class="metric-sub">
          <span>无决议/无待办</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">重复会议占比</span>
          <el-icon class="metric-icon" color="#909399"><RefreshRight /></el-icon>
        </div>
        <div class="metric-value">18%</div>
        <div class="metric-sub">
          <span>固定例会/月度会</span>
        </div>
      </el-card>
    </div>

    <!-- 核心图表区 -->
    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>按时召开率趋势（近30天）</span>
          </div>
        </template>
        <div ref="onTimeTrendRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>各部门会议时长对比</span>
          </div>
        </template>
        <div ref="durationBoxRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>无效会议分析</span>
          </div>
        </template>
        <div ref="invalidChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议效率排行</span>
          </div>
        </template>
        <el-table :data="statsData.efficiencyRanking" style="width: 100%" height="300">
          <el-table-column prop="department" label="部门" width="150" />
          <el-table-column prop="onTimeRate" label="按时召开率" width="140">
            <template #default="{ row }">
              <el-progress :percentage="row.onTimeRate" :color="getProgressColor(row.onTimeRate)" />
            </template>
          </el-table-column>
          <el-table-column prop="durationCompliance" label="时长合规率" width="140">
            <template #default="{ row }">
              <el-progress :percentage="row.durationCompliance" :color="getProgressColor(row.durationCompliance)" />
            </template>
          </el-table-column>
          <el-table-column prop="avgDuration" label="平均时长(分钟)" width="140" />
          <el-table-column prop="score" label="综合评分" width="120">
            <template #default="{ row }">
              <el-tag :type="getScoreType(row.score)">{{ row.score }}</el-tag>
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
import { Clock, Timer, Stopwatch, Close, RefreshRight } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const onTimeTrendRef = ref(null)
const durationBoxRef = ref(null)
const invalidChartRef = ref(null)

let onTimeTrendChart = null
let durationBoxChart = null
let invalidChart = null

const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}

const getScoreType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

const initOnTimeTrend = () => {
  if (!onTimeTrendRef.value) return

  if (!onTimeTrendChart) {
    onTimeTrendChart = echarts.init(onTimeTrendRef.value)
  }

  const dates = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    return `${d.getMonth() + 1}-${d.getDate()}`
  })

  const rates = Array.from({ length: 30 }, () => Math.floor(Math.random() * 20) + 75)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>按时召开率: {c}%'
    },
    xAxis: {
      type: 'category',
      data: dates,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      min: 60,
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '按时召开率',
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
            { yAxis: 85, label: { formatter: '目标值 85%' }, lineStyle: { color: '#67c23a' } }
          ]
        }
      }
    ]
  }

  onTimeTrendChart.setOption(option)
}

const initDurationBox = () => {
  if (!durationBoxRef.value) return

  if (!durationBoxChart) {
    durationBoxChart = echarts.init(durationBoxRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['研发部', '市场部', '销售部', '产品部', '运营部'],
      axisLabel: {
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '时长(分钟)'
    },
    series: [
      {
        name: '平均时长',
        type: 'bar',
        data: [
          { value: 75, itemStyle: { color: '#f56c6c' } },
          { value: 68, itemStyle: { color: '#e6a23c' } },
          { value: 55, itemStyle: { color: '#67c23a' } },
          { value: 62, itemStyle: { color: '#67c23a' } },
          { value: 58, itemStyle: { color: '#67c23a' } }
        ],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}分钟'
        },
        markLine: {
          data: [
            { yAxis: 60, label: { formatter: '标准时长 60分钟' }, lineStyle: { color: '#409eff' } }
          ]
        }
      }
    ]
  }

  durationBoxChart.setOption(option)
}

const initInvalidChart = () => {
  if (!invalidChartRef.value) return

  if (!invalidChart) {
    invalidChart = echarts.init(invalidChartRef.value)
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
        name: '无效会议类型',
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
          { value: 45, name: '无决议', itemStyle: { color: '#f56c6c' } },
          { value: 30, name: '无待办', itemStyle: { color: '#e6a23c' } },
          { value: 25, name: '参会率低', itemStyle: { color: '#909399' } }
        ]
      }
    ]
  }

  invalidChart.setOption(option)
}

const initAllCharts = () => {
  initOnTimeTrend()
  initDurationBox()
  initInvalidChart()
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
    onTimeTrendChart?.resize()
    durationBoxChart?.resize()
    invalidChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.efficiency-analysis {
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
