<template>
  <div class="meeting-statistics">
    <!-- 顶部筛选 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="时间范围">
          <el-select v-model="filters.timeRange" style="width: 140px">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="近30天" value="last30days" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="filters.department" placeholder="全部" clearable style="width: 150px">
            <el-option label="研发部" value="rd" />
            <el-option label="市场部" value="marketing" />
            <el-option label="销售部" value="sales" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 左侧导航 -->
      <el-menu :default-active="currentTab" class="nav-menu" @select="handleTabChange">
        <el-menu-item index="overall">整体概况</el-menu-item>
        <el-menu-item index="room">会议室分析</el-menu-item>
        <el-menu-item index="efficiency">效率分析</el-menu-item>
        <el-menu-item index="attendance">参会行为</el-menu-item>
        <el-menu-item index="compliance">流程合规</el-menu-item>
        <el-menu-item index="exception">异常分析</el-menu-item>
        <el-menu-item index="department">部门对比</el-menu-item>
      </el-menu>

      <!-- 中间内容 -->
      <div class="content-area">
        <!-- 整体概况 -->
        <div v-show="currentTab === 'overall'">
          <div class="metrics-grid">
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">总会议数</div>
              <div class="metric-value">{{ stats.totalMeetings }}</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">会议室利用率</div>
              <div class="metric-value">{{ stats.roomUtilization }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">按时召开率</div>
              <div class="metric-value">{{ stats.onTimeRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">平均参会率</div>
              <div class="metric-value">{{ stats.attendanceRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">纪要完成率</div>
              <div class="metric-value">{{ stats.minutesRate }}%</div>
            </el-card>
          </div>

          <el-row :gutter="16" style="margin-top: 16px">
            <el-col :span="12">
              <el-card>
                <template #header>会议趋势（近7天）</template>
                <div ref="trendChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card>
                <template #header>会议类型分布</template>
                <div ref="typeChartRef" style="height: 300px"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 会议室分析 -->
        <div v-show="currentTab === 'room'">
          <div class="metrics-grid">
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">平均利用率</div>
              <div class="metric-value">{{ stats.roomUtilization }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">资源浪费率</div>
              <div class="metric-value">8%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">热门时段</div>
              <div class="metric-value" style="font-size: 20px">9:00-11:00</div>
            </el-card>
          </div>
          <el-card style="margin-top: 16px">
            <template #header>会议室使用排行</template>
            <el-table :data="roomList" border stripe>
              <el-table-column prop="name" label="会议室名称" />
              <el-table-column prop="usage" label="使用率" width="150">
                <template #default="{ row }">
                  <el-progress :percentage="row.usage" :color="getColor(row.usage)" />
                </template>
              </el-table-column>
              <el-table-column prop="count" label="使用次数" width="100" align="center" />
            </el-table>
          </el-card>
        </div>

        <!-- 效率分析 -->
        <div v-show="currentTab === 'efficiency'">
          <div class="metrics-grid">
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">按时召开率</div>
              <div class="metric-value">{{ stats.onTimeRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">平均时长</div>
              <div class="metric-value">{{ stats.avgDuration }}分钟</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">无效会议占比</div>
              <div class="metric-value">{{ stats.invalidRate }}%</div>
            </el-card>
          </div>
          <el-card style="margin-top: 16px">
            <template #header>各部门效率</template>
            <el-table :data="efficiencyList" border stripe>
              <el-table-column prop="dept" label="部门" />
              <el-table-column prop="onTimeRate" label="按时率" width="120">
                <template #default="{ row }">{{ row.onTimeRate }}%</template>
              </el-table-column>
              <el-table-column prop="avgDuration" label="平均时长(分)" width="120" align="center" />
              <el-table-column prop="invalidRate" label="无效会议率" width="120" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.invalidRate <= 5 ? 'success' : 'warning'">{{ row.invalidRate }}%</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>

        <!-- 参会行为 -->
        <div v-show="currentTab === 'attendance'">
          <div class="metrics-grid">
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">平均参会率</div>
              <div class="metric-value">{{ stats.attendanceRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">平均迟到率</div>
              <div class="metric-value">{{ stats.lateRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">回执及时率</div>
              <div class="metric-value">{{ stats.responseRate }}%</div>
            </el-card>
          </div>
          <el-card style="margin-top: 16px">
            <template #header>各部门参会情况</template>
            <el-table :data="attendanceList" border stripe>
              <el-table-column prop="dept" label="部门" />
              <el-table-column prop="attendanceRate" label="参会率" width="150">
                <template #default="{ row }">
                  <el-progress :percentage="row.attendanceRate" :color="getColor(row.attendanceRate)" />
                </template>
              </el-table-column>
              <el-table-column prop="lateRate" label="迟到率" width="100" align="center" />
            </el-table>
          </el-card>
        </div>

        <!-- 流程合规 -->
        <div v-show="currentTab === 'compliance'">
          <div class="metrics-grid">
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">审批通过率</div>
              <div class="metric-value">{{ stats.approvalRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">纪要完成率</div>
              <div class="metric-value">{{ stats.minutesRate }}%</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">待办执行率</div>
              <div class="metric-value">{{ stats.todoRate }}%</div>
            </el-card>
          </div>
        </div>

        <!-- 异常分析 -->
        <div v-show="currentTab === 'exception'">
          <div class="metrics-grid">
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">异常会议总数</div>
              <div class="metric-value">{{ stats.exceptionCount }}</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">取消会议</div>
              <div class="metric-value">{{ stats.cancelledCount }}</div>
            </el-card>
            <el-card shadow="hover" class="metric-item">
              <div class="metric-label">超时会议</div>
              <div class="metric-value">{{ stats.overtimeCount }}</div>
            </el-card>
          </div>
          <el-card style="margin-top: 16px">
            <template #header>异常会议列表</template>
            <el-table :data="exceptionList" border stripe>
              <el-table-column prop="name" label="会议名称" />
              <el-table-column prop="type" label="类型" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.type === '取消' ? 'danger' : 'warning'">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="reason" label="原因" />
            </el-table>
          </el-card>
        </div>

        <!-- 部门对比 -->
        <div v-show="currentTab === 'department'">
          <el-card>
            <template #header>部门综合对比</template>
            <el-table :data="deptList" border stripe>
              <el-table-column prop="dept" label="部门" width="120" fixed />
              <el-table-column prop="count" label="会议数" width="100" align="center" sortable />
              <el-table-column prop="onTimeRate" label="按时率" width="100" align="center">
                <template #default="{ row }">{{ row.onTimeRate }}%</template>
              </el-table-column>
              <el-table-column prop="attendanceRate" label="参会率" width="100" align="center">
                <template #default="{ row }">{{ row.attendanceRate }}%</template>
              </el-table-column>
              <el-table-column prop="minutesRate" label="纪要完成率" width="110" align="center">
                <template #default="{ row }">{{ row.minutesRate }}%</template>
              </el-table-column>
              <el-table-column prop="score" label="评分" width="80" align="center">
                <template #default="{ row }">
                  <span :style="{ color: getColor(row.score), fontWeight: 'bold' }">{{ row.score }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </div>

      <!-- 右侧预警 -->
      <div class="warning-panel">
        <el-card shadow="never">
          <template #header>异常预警</template>
          <div class="warning-list">
            <div v-for="(w, i) in warnings" :key="i" class="warning-item" :class="w.level">
              <div class="w-title">{{ w.metric }}</div>
              <div class="w-value">{{ w.value }}</div>
              <div class="w-text">{{ w.suggestion }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const currentTab = ref('overall')
const filters = reactive({
  timeRange: 'last30days',
  department: ''
})

const stats = reactive({
  totalMeetings: 320,
  roomUtilization: 68,
  onTimeRate: 87,
  attendanceRate: 82,
  minutesRate: 88,
  avgDuration: 65,
  invalidRate: 8,
  lateRate: 12,
  responseRate: 76,
  approvalRate: 94,
  todoRate: 72,
  exceptionCount: 25,
  cancelledCount: 8,
  overtimeCount: 12
})

const roomList = ref([
  { name: '3楼大会议室', usage: 92, count: 45 },
  { name: '2楼中会议室', usage: 85, count: 38 },
  { name: '1楼小会议室A', usage: 78, count: 32 },
  { name: '4楼培训室', usage: 68, count: 28 }
])

const efficiencyList = ref([
  { dept: '产品部', onTimeRate: 90, avgDuration: 68, invalidRate: 3 },
  { dept: '研发部', onTimeRate: 88, avgDuration: 72, invalidRate: 5 },
  { dept: '运营部', onTimeRate: 85, avgDuration: 55, invalidRate: 6 },
  { dept: '市场部', onTimeRate: 82, avgDuration: 65, invalidRate: 8 }
])

const attendanceList = ref([
  { dept: '产品部', attendanceRate: 88, lateRate: 8 },
  { dept: '研发部', attendanceRate: 85, lateRate: 10 },
  { dept: '运营部', attendanceRate: 82, lateRate: 12 },
  { dept: '市场部', attendanceRate: 78, lateRate: 15 }
])

const exceptionList = ref([
  { name: 'Q2产品规划会', type: '取消', reason: '关键人员出差' },
  { name: '技术评审会', type: '超时', reason: '讨论议题较多' },
  { name: '周例会', type: '无纪要', reason: '未及时提交' }
])

const deptList = ref([
  { dept: '产品部', count: 58, onTimeRate: 90, attendanceRate: 88, minutesRate: 95, score: 92 },
  { dept: '研发部', count: 85, onTimeRate: 88, attendanceRate: 85, minutesRate: 92, score: 88 },
  { dept: '运营部', count: 40, onTimeRate: 85, attendanceRate: 82, minutesRate: 88, score: 85 },
  { dept: '市场部', count: 72, onTimeRate: 82, attendanceRate: 78, minutesRate: 85, score: 80 }
])

const warnings = ref([
  { level: 'red', metric: '销售部迟到率', value: '18%', suggestion: '建议加强提醒' },
  { level: 'orange', metric: 'VIP室利用率', value: '23%', suggestion: '建议优化配置' },
  { level: 'yellow', metric: '纪要完成率', value: '88%', suggestion: '未达目标90%' }
])

let trendChart = null
let typeChart = null

const handleTabChange = (index) => {
  currentTab.value = index
  if (index === 'overall') {
    nextTick(() => initCharts())
  }
}

const loadData = () => {
  ElMessage.success('数据已加载')
}

const handleReset = () => {
  filters.timeRange = 'last30days'
  filters.department = ''
}

const handleExport = () => {
  ElMessage.success('正在导出...')
}

const getColor = (value) => {
  if (value >= 85) return '#67c23a'
  if (value >= 70) return '#e6a23c'
  return '#f56c6c'
}

const initCharts = () => {
  const trendEl = document.querySelector('[ref="trendChartRef"]')
  const typeEl = document.querySelector('[ref="typeChartRef"]')

  if (!trendChart && trendEl) {
    trendChart = echarts.init(trendEl)
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['4-9', '4-10', '4-11', '4-12', '4-13', '4-14', '4-15'] },
      yAxis: { type: 'value' },
      series: [{
        data: [10, 15, 12, 18, 14, 16, 12],
        type: 'line',
        smooth: true,
        itemStyle: { color: '#409eff' },
        areaStyle: { opacity: 0.2 }
      }]
    })
  }

  if (!typeChart && typeEl) {
    typeChart = echarts.init(typeEl)
    typeChart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '60%',
        data: [
          { value: 35, name: '部门例会' },
          { value: 25, name: '项目评审' },
          { value: 20, name: '培训会议' },
          { value: 20, name: '其他' }
        ]
      }]
    })
  }
}

onMounted(() => {
  nextTick(() => initCharts())
  window.addEventListener('resize', () => {
    trendChart?.resize()
    typeChart?.resize()
  })
})
</script>

<style lang="scss" scoped>
.meeting-statistics {
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .filter-card {
    margin: 16px;
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    gap: 16px;
    padding: 0 16px 16px;
    overflow: hidden;

    .nav-menu {
      width: 160px;
      border-right: 1px solid #e4e7ed;
      height: 100%;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding-right: 16px;
    }

    .warning-panel {
      width: 260px;
      flex-shrink: 0;

      .warning-list {
        .warning-item {
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 4px;
          border-left: 3px solid;

          &.red {
            background: #fef0f0;
            border-left-color: #f56c6c;
          }
          &.orange {
            background: #fdf6ec;
            border-left-color: #e6a23c;
          }
          &.yellow {
            background: #f4f4f5;
            border-left-color: #909399;
          }

          .w-title {
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 6px;
          }
          .w-value {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          .w-text {
            font-size: 12px;
            color: #606266;
          }
        }
      }
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;

    .metric-item {
      text-align: center;
      padding: 16px;

      .metric-label {
        font-size: 13px;
        color: #909399;
        margin-bottom: 8px;
      }
      .metric-value {
        font-size: 28px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
}
</style>
