<template>
  <div class="room-analysis">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">平均利用率</span>
          <el-icon class="metric-icon" color="#409eff"><OfficeBuilding /></el-icon>
        </div>
        <div class="metric-value">{{ statsData.roomUtilization }}%</div>
        <div class="metric-sub">
          <span>较上月 +5%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">资源浪费率</span>
          <el-icon class="metric-icon" color="#f56c6c"><Warning /></el-icon>
        </div>
        <div class="metric-value">8%</div>
        <div class="metric-sub">
          <span>预约未使用占比</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">热门时段</span>
          <el-icon class="metric-icon" color="#e6a23c"><Clock /></el-icon>
        </div>
        <div class="metric-value">9:00-11:00</div>
        <div class="metric-sub">
          <span>14:00-16:00</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">容量匹配度</span>
          <el-icon class="metric-icon" color="#67c23a"><CircleCheck /></el-icon>
        </div>
        <div class="metric-value">76%</div>
        <div class="metric-sub">
          <span>大房小用 15%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">维护影响率</span>
          <el-icon class="metric-icon" color="#909399"><Tools /></el-icon>
        </div>
        <div class="metric-value">3%</div>
        <div class="metric-sub">
          <span>本月维护5次</span>
        </div>
      </el-card>
    </div>

    <!-- 核心图表区 -->
    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>各会议室利用率对比</span>
          </div>
        </template>
        <div ref="roomUtilChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议室使用时段分布</span>
          </div>
        </template>
        <div ref="timeSlotChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>容量匹配度分析</span>
          </div>
        </template>
        <div ref="capacityChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议室维护统计</span>
          </div>
        </template>
        <el-table :data="statsData.maintenanceStats" style="width: 100%" height="300">
          <el-table-column prop="roomName" label="会议室名称" />
          <el-table-column prop="maintenanceCount" label="维护次数" width="120" />
          <el-table-column prop="maintenanceHours" label="维护时长(小时)" width="140" />
          <el-table-column prop="affectedMeetings" label="影响会议数" width="120" />
          <el-table-column prop="lastMaintenance" label="最后维护时间" width="160" />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { OfficeBuilding, Warning, Clock, CircleCheck, Tools } from '@element-plus/icons-vue'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const roomUtilChartRef = ref(null)
const timeSlotChartRef = ref(null)
const capacityChartRef = ref(null)

let roomUtilChart = null
let timeSlotChart = null
let capacityChart = null

const initRoomUtilChart = () => {
  if (!roomUtilChartRef.value) return

  if (!roomUtilChart) {
    roomUtilChart = echarts.init(roomUtilChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['利用率']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1楼A', '1楼B', '2楼A', '2楼B', '3楼大', '4楼培训', '5楼VIP'],
      axisLabel: {
        interval: 0,
        rotate: 30
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '利用率',
        type: 'bar',
        data: [
          { value: 78, itemStyle: { color: '#67c23a' } },
          { value: 65, itemStyle: { color: '#67c23a' } },
          { value: 85, itemStyle: { color: '#409eff' } },
          { value: 72, itemStyle: { color: '#67c23a' } },
          { value: 92, itemStyle: { color: '#409eff' } },
          { value: 68, itemStyle: { color: '#67c23a' } },
          { value: 23, itemStyle: { color: '#f56c6c' } }
        ],
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%'
        },
        markLine: {
          data: [
            { yAxis: 30, label: { formatter: '低效阈值 30%' }, lineStyle: { color: '#f56c6c' } }
          ]
        }
      }
    ]
  }

  roomUtilChart.setOption(option)
}

const initTimeSlotChart = () => {
  if (!timeSlotChartRef.value) return

  if (!timeSlotChart) {
    timeSlotChart = echarts.init(timeSlotChartRef.value)
  }

  const hours = Array.from({ length: 12 }, (_, i) => `${8 + i}:00`)
  const usageData = [5, 12, 18, 15, 8, 6, 10, 16, 20, 14, 7, 3]

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: hours,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      name: '使用频次'
    },
    series: [
      {
        name: '使用频次',
        type: 'line',
        smooth: true,
        data: usageData,
        itemStyle: {
          color: '#409eff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.3)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
          ])
        },
        markArea: {
          data: [
            [
              {
                name: '早高峰',
                xAxis: '9:00'
              },
              {
                xAxis: '11:00'
              }
            ],
            [
              {
                name: '下午高峰',
                xAxis: '14:00'
              },
              {
                xAxis: '16:00'
              }
            ]
          ],
          itemStyle: {
            color: 'rgba(255, 173, 177, 0.2)'
          }
        }
      }
    ]
  }

  timeSlotChart.setOption(option)
}

const initCapacityChart = () => {
  if (!capacityChartRef.value) return

  if (!capacityChart) {
    capacityChart = echarts.init(capacityChartRef.value)
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
        name: '容量匹配',
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
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 76, name: '匹配合理', itemStyle: { color: '#67c23a' } },
          { value: 15, name: '大房小用', itemStyle: { color: '#e6a23c' } },
          { value: 9, name: '小房大用', itemStyle: { color: '#f56c6c' } }
        ]
      }
    ]
  }

  capacityChart.setOption(option)
}

const initAllCharts = () => {
  initRoomUtilChart()
  initTimeSlotChart()
  initCapacityChart()
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
    roomUtilChart?.resize()
    timeSlotChart?.resize()
    capacityChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.room-analysis {
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
