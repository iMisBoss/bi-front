<template>
  <div class="department-compare">
    <!-- 核心指标卡片 -->
    <div class="metrics-row">
      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">会议数量最多部门</span>
          <el-icon class="metric-icon" color="#409eff"><Trophy /></el-icon>
        </div>
        <div class="metric-value">{{ topDept.name }}</div>
        <div class="metric-sub">
          <span>{{ topDept.count }} 场会议</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">效率最高部门</span>
          <el-icon class="metric-icon" color="#67c23a"><CircleCheck /></el-icon>
        </div>
        <div class="metric-value">{{ efficientDept.name }}</div>
        <div class="metric-sub">
          <span>综合评分 {{ efficientDept.score }}分</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">合规最佳部门</span>
          <el-icon class="metric-icon" color="#e6a23c"><DocumentChecked /></el-icon>
        </div>
        <div class="metric-value">{{ compliantDept.name }}</div>
        <div class="metric-sub">
          <span>合规率 {{ compliantDept.rate }}%</span>
        </div>
      </el-card>

      <el-card shadow="hover" class="metric-card">
        <div class="metric-header">
          <span class="metric-title">资源使用最多</span>
          <el-icon class="metric-icon" color="#f56c6c"><OfficeBuilding /></el-icon>
        </div>
        <div class="metric-value">{{ resourceDept.name }}</div>
        <div class="metric-sub">
          <span>{{ resourceDept.hours }} 小时</span>
        </div>
      </el-card>
    </div>

    <!-- 核心图表区 -->
    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>各部门会议数量对比</span>
            <el-radio-group v-model="deptCountChartType" size="small">
              <el-radio-button label="bar">柱状</el-radio-button>
              <el-radio-button label="line">折线</el-radio-button>
            </el-radio-group>
          </div>
        </template>
        <div ref="deptCountChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>各部门会议效率雷达图</span>
          </div>
        </template>
        <div ref="efficiencyRadarRef" class="chart-container"></div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>各部门会议室使用对比</span>
          </div>
        </template>
        <div ref="roomUsageChartRef" class="chart-container"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>部门合规评分排行</span>
          </div>
        </template>
        <div ref="complianceScoreRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 详细数据表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="table-header">
          <span>部门详细数据对比</span>
          <el-button type="primary" size="small" :icon="Download" @click="handleExport">
            导出数据
          </el-button>
        </div>
      </template>
      <el-table :data="deptComparisonData" border stripe style="width: 100%">
        <el-table-column prop="name" label="部门名称" width="120" fixed />
        <el-table-column prop="meetingCount" label="会议数量" width="100" sortable align="center" />
        <el-table-column prop="avgDuration" label="平均时长(分钟)" width="120" sortable align="center" />
        <el-table-column prop="onTimeRate" label="按时召开率" width="120" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="row.onTimeRate >= 85 ? 'success' : row.onTimeRate >= 70 ? 'warning' : 'danger'">
              {{ row.onTimeRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="attendanceRate" label="参会率" width="100" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="row.attendanceRate >= 80 ? 'success' : row.attendanceRate >= 60 ? 'warning' : 'danger'">
              {{ row.attendanceRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lateRate" label="迟到率" width="100" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="row.lateRate <= 10 ? 'success' : row.lateRate <= 20 ? 'warning' : 'danger'">
              {{ row.lateRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="minutesRate" label="纪要完成率" width="120" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="row.minutesRate >= 90 ? 'success' : row.minutesRate >= 75 ? 'warning' : 'danger'">
              {{ row.minutesRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="todoCompletionRate" label="待办执行率" width="120" sortable align="center">
          <template #default="{ row }">
            <el-tag :type="row.todoCompletionRate >= 80 ? 'success' : row.todoCompletionRate >= 60 ? 'warning' : 'danger'">
              {{ row.todoCompletionRate }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roomHours" label="会议室使用(小时)" width="140" sortable align="center" />
        <el-table-column prop="complianceScore" label="合规评分" width="100" sortable align="center">
          <template #default="{ row }">
            <el-progress
                :percentage="row.complianceScore"
                :color="getScoreColor(row.complianceScore)"
                :stroke-width="8"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Trophy, CircleCheck, DocumentChecked, OfficeBuilding, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  statsData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['drill-down'])

const deptCountChartType = ref('bar')
const deptCountChartRef = ref(null)
const efficiencyRadarRef = ref(null)
const roomUsageChartRef = ref(null)
const complianceScoreRef = ref(null)

let deptCountChart = null
let efficiencyRadar = null
let roomUsageChart = null
let complianceScoreChart = null

// 计算属性
const topDept = computed(() => {
  const data = props.statsData.deptMeetingCount || []
  return data.length > 0 ? data[0] : { name: '-', count: 0 }
})

const efficientDept = computed(() => {
  const data = props.statsData.deptEfficiencyRadar || []
  return data.length > 0 ? data[0] : { name: '-', score: 0 }
})

const compliantDept = computed(() => {
  const data = props.statsData.deptComplianceScore || []
  return data.length > 0 ? data[0] : { name: '-', rate: 0 }
})

const resourceDept = computed(() => {
  const data = props.statsData.deptRoomUsage || []
  return data.length > 0 ? data[0] : { name: '-', hours: 0 }
})

// 部门对比数据
const deptComparisonData = ref([
  {
    name: '研发部',
    meetingCount: 85,
    avgDuration: 72,
    onTimeRate: 88,
    attendanceRate: 85,
    lateRate: 10,
    minutesRate: 92,
    todoCompletionRate: 78,
    roomHours: 156,
    complianceScore: 92
  },
  {
    name: '市场部',
    meetingCount: 72,
    avgDuration: 65,
    onTimeRate: 82,
    attendanceRate: 78,
    lateRate: 15,
    minutesRate: 85,
    todoCompletionRate: 72,
    roomHours: 132,
    complianceScore: 85
  },
  {
    name: '销售部',
    meetingCount: 65,
    avgDuration: 58,
    onTimeRate: 75,
    attendanceRate: 72,
    lateRate: 18,
    minutesRate: 78,
    todoCompletionRate: 65,
    roomHours: 118,
    complianceScore: 78
  },
  {
    name: '产品部',
    meetingCount: 58,
    avgDuration: 68,
    onTimeRate: 90,
    attendanceRate: 88,
    lateRate: 8,
    minutesRate: 95,
    todoCompletionRate: 82,
    roomHours: 105,
    complianceScore: 95
  },
  {
    name: '运营部',
    meetingCount: 40,
    avgDuration: 55,
    onTimeRate: 85,
    attendanceRate: 82,
    lateRate: 12,
    minutesRate: 88,
    todoCompletionRate: 75,
    roomHours: 72,
    complianceScore: 88
  }
])

const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 75) return '#e6a23c'
  return '#f56c6c'
}

const initDeptCountChart = () => {
  if (!deptCountChartRef.value) return

  if (!deptCountChart) {
    deptCountChart = echarts.init(deptCountChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['部门例会', '项目评审', '培训会议', '其他']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['研发部', '市场部', '销售部', '产品部', '运营部', '财务部', '人事部']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '部门例会',
        type: deptCountChartType.value,
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [30, 25, 20, 18, 15, 12, 10],
        itemStyle: { color: '#409eff' }
      },
      {
        name: '项目评审',
        type: deptCountChartType.value,
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [25, 20, 18, 15, 10, 8, 5],
        itemStyle: { color: '#67c23a' }
      },
      {
        name: '培训会议',
        type: deptCountChartType.value,
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [15, 12, 10, 12, 8, 6, 8],
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '其他',
        type: deptCountChartType.value,
        stack: 'total',
        emphasis: { focus: 'series' },
        data: [15, 15, 17, 13, 7, 5, 4],
        itemStyle: { color: '#909399' }
      }
    ]
  }

  deptCountChart.setOption(option)
}

const initEfficiencyRadar = () => {
  if (!efficiencyRadarRef.value) return

  if (!efficiencyRadar) {
    efficiencyRadar = echarts.init(efficiencyRadarRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['研发部', '市场部', '产品部'],
      bottom: 0
    },
    radar: {
      indicator: [
        { name: '按时召开率', max: 100 },
        { name: '参会率', max: 100 },
        { name: '纪要完成率', max: 100 },
        { name: '待办执行率', max: 100 },
        { name: '时长合规率', max: 100 }
      ],
      radius: '65%'
    },
    series: [
      {
        name: '部门效率对比',
        type: 'radar',
        data: [
          {
            value: [88, 85, 92, 78, 85],
            name: '研发部',
            itemStyle: { color: '#409eff' },
            areaStyle: { opacity: 0.3 }
          },
          {
            value: [82, 78, 85, 72, 78],
            name: '市场部',
            itemStyle: { color: '#67c23a' },
            areaStyle: { opacity: 0.3 }
          },
          {
            value: [90, 88, 95, 82, 88],
            name: '产品部',
            itemStyle: { color: '#e6a23c' },
            areaStyle: { opacity: 0.3 }
          }
        ]
      }
    ]
  }

  efficiencyRadar.setOption(option)
}

const initRoomUsageChart = () => {
  if (!roomUsageChartRef.value) return

  if (!roomUsageChart) {
    roomUsageChart = echarts.init(roomUsageChartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['使用时长(小时)', '使用次数']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['研发部', '市场部', '销售部', '产品部', '运营部']
    },
    yAxis: [
      {
        type: 'value',
        name: '使用时长(小时)',
        position: 'left'
      },
      {
        type: 'value',
        name: '使用次数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '使用时长(小时)',
        type: 'bar',
        data: [156, 132, 118, 105, 72],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#409eff' },
            { offset: 1, color: '#79bbff' }
          ])
        }
      },
      {
        name: '使用次数',
        type: 'line',
        yAxisIndex: 1,
        data: [85, 72, 65, 58, 40],
        itemStyle: { color: '#e6a23c' },
        lineStyle: { width: 3 }
      }
    ]
  }

  roomUsageChart.setOption(option)
}

const initComplianceScore = () => {
  if (!complianceScoreRef.value) return

  if (!complianceScoreChart) {
    complianceScoreChart = echarts.init(complianceScoreRef.value)
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
        formatter: '{value}分'
      }
    },
    yAxis: {
      type: 'category',
      data: ['人事部', '财务部', '运营部', '销售部', '市场部', '研发部', '产品部'].reverse()
    },
    series: [
      {
        name: '合规评分',
        type: 'bar',
        data: [96, 95, 88, 78, 85, 92, 95].reverse(),
        itemStyle: {
          color: (params) => {
            const value = params.value
            if (value >= 90) return '#67c23a'
            if (value >= 75) return '#e6a23c'
            return '#f56c6c'
          }
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}分'
        }
      }
    ]
  }

  complianceScoreChart.setOption(option)
}

const initAllCharts = () => {
  initDeptCountChart()
  initEfficiencyRadar()
  initRoomUsageChart()
  initComplianceScore()
}

const handleExport = () => {
  ElMessage.success('正在导出部门对比数据...')
  // TODO: 实现导出逻辑
}

const handleViewDetail = (row) => {
  emit('drill-down', { type: 'department', data: row })
}

watch(() => props.statsData, () => {
  nextTick(() => {
    initAllCharts()
  })
}, { deep: true })

watch(deptCountChartType, () => {
  initDeptCountChart()
})

onMounted(() => {
  nextTick(() => {
    initAllCharts()
  })

  window.addEventListener('resize', () => {
    deptCountChart?.resize()
    efficiencyRadar?.resize()
    roomUsageChart?.resize()
    complianceScoreChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.department-compare {
  .metrics-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
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
        height: 350px;
      }
    }
  }

  .table-card {
    :deep(.el-card__header) {
      padding: 12px 16px;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }
}
</style>
