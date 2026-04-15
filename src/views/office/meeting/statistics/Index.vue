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
          </div>
        </template>
        <div class="chart-placeholder">
          <el-empty description="会议趋势折线图" />
        </div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议类型分布</span>
          </div>
        </template>
        <div class="chart-placeholder">
          <el-empty description="会议类型饼图" />
        </div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>会议室使用TOP5</span>
          </div>
        </template>
        <div class="chart-placeholder">
          <el-empty description="会议室使用柱状图" />
        </div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>部门会议数量排行</span>
          </div>
        </template>
        <div class="chart-placeholder">
          <el-empty description="部门会议排行图" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { Calendar, OfficeBuilding, Clock, User, DocumentChecked } from '@element-plus/icons-vue'

defineProps({
  statsData: Object
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
        font-size: 14px;
        font-weight: 600;
        color: #303133;
      }

      .chart-placeholder {
        height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
