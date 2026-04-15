<template>
  <div class="statistics-filter">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="localFilters" class="filter-form">
        <!-- 时间范围 -->
        <el-form-item label="时间范围">
          <el-select
              v-model="localFilters.timeRange"
              placeholder="选择时间范围"
              style="width: 140px"
              @change="handleTimeRangeChange"
          >
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="本季度" value="quarter" />
            <el-option label="本年" value="year" />
            <el-option label="近30天" value="last30days" />
            <el-option label="自定义" value="custom" />
          </el-select>
          <el-date-picker
              v-if="localFilters.timeRange === 'custom'"
              v-model="localFilters.customTimeRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="margin-left: 8px; width: 240px"
              @change="emitFilterChange"
          />
        </el-form-item>

        <!-- 组织架构筛选 -->
        <el-form-item label="组织架构">
          <el-select
              v-model="localFilters.departments"
              multiple
              placeholder="选择部门"
              collapse-tags
              collapse-tags-tooltip
              style="width: 200px"
              @change="emitFilterChange"
          >
            <el-option label="全公司" value="all" />
            <el-option label="研发部" value="rd" />
            <el-option label="市场部" value="marketing" />
            <el-option label="销售部" value="sales" />
            <el-option label="产品部" value="product" />
            <el-option label="运营部" value="operation" />
          </el-select>
        </el-form-item>

        <!-- 会议类型筛选 -->
        <el-form-item label="会议类型">
          <el-select
              v-model="localFilters.meetingTypes"
              multiple
              placeholder="选择类型"
              collapse-tags
              collapse-tags-tooltip
              style="width: 180px"
              @change="emitFilterChange"
          >
            <el-option label="部门例会" value="dept_meeting" />
            <el-option label="项目评审" value="project_review" />
            <el-option label="培训会议" value="training" />
            <el-option label="高管会议" value="executive" />
            <el-option label="涉密会议" value="classified" />
            <el-option label="外部客户会议" value="external" />
            <el-option label="临时会议" value="temporary" />
          </el-select>
        </el-form-item>

        <!-- 会议形式筛选 -->
        <el-form-item label="会议形式">
          <el-select
              v-model="localFilters.meetingForms"
              multiple
              placeholder="选择形式"
              collapse-tags
              style="width: 140px"
              @change="emitFilterChange"
          >
            <el-option label="线下会议" value="offline" />
            <el-option label="线上会议" value="online" />
            <el-option label="混合会议" value="hybrid" />
          </el-select>
        </el-form-item>

        <!-- 数据范围筛选 -->
        <el-form-item label="数据范围">
          <el-select
              v-model="localFilters.dataScope"
              placeholder="数据范围"
              style="width: 140px"
              @change="emitFilterChange"
          >
            <el-option label="全部数据" value="all" />
            <el-option label="有效会议" value="valid" />
            <el-option label="异常会议" value="exception" />
          </el-select>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" :icon="Refresh" @click="handleRefresh">
            刷新数据
          </el-button>
          <el-button :icon="Download" @click="handleExport('excel')">
            导出Excel
          </el-button>
          <el-button :icon="Document" @click="handleExport('pdf')">
            导出PDF
          </el-button>
          <el-button :icon="Setting" @click="handleWarningSetting">
            预警设置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Refresh, Download, Document, Setting } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['filter-change', 'refresh', 'export'])

const localFilters = ref({ ...props.filters })

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal }
}, { deep: true })

const handleTimeRangeChange = () => {
  if (localFilters.value.timeRange !== 'custom') {
    localFilters.value.customTimeRange = []
  }
  emitFilterChange()
}

const emitFilterChange = () => {
  emit('filter-change', { ...localFilters.value })
}

const handleRefresh = () => {
  emit('refresh')
}

const handleExport = (format) => {
  emit('export', format)
}

const handleWarningSetting = () => {
  ElMessage.info('打开预警设置对话框')
  // TODO: 打开预警设置对话框
}
</script>

<style lang="scss" scoped>
.statistics-filter {
  padding: 16px;
  background: #fff;

  .filter-card {
    :deep(.el-card__body) {
      padding: 16px;
    }

    .filter-form {
      margin-bottom: 0;

      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }
}
</style>
