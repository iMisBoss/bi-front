<template>
  <el-collapse-transition>
    <div v-show="showAdvanced" class="advanced-filter">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="时间范围">
          <el-select v-model="filterForm.timeRange" placeholder="请选择" clearable style="width: 150px">
            <el-option label="今日" value="today" />
            <el-option label="本周" value="week" />
            <el-option label="本月" value="month" />
            <el-option label="近3月" value="3months" />
            <el-option label="近1年" value="year" />
            <el-option label="自定义" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="filterForm.timeRange === 'custom'" label="时间">
          <el-date-picker
              v-model="filterForm.customTime"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="会议类型">
          <el-select v-model="filterForm.meetingType" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="部门例会" value="department" />
            <el-option label="项目会议" value="project" />
            <el-option label="全员大会" value="company" />
            <el-option label="线上会议" value="online" />
            <el-option label="涉密会议" value="secret" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="currentView === 'pending'" label="参会状态">
          <el-select v-model="filterForm.attendStatus" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="已请假" value="leave" />
          </el-select>
        </el-form-item>
        <el-form-item label="会议地点">
          <el-select v-model="filterForm.location" placeholder="全部地点" clearable style="width: 150px">
            <el-option label="线上会议" value="online" />
            <el-option label="1号会议室" value="room1" />
            <el-option label="2号会议室" value="room2" />
            <el-option label="3号会议室" value="room3" />
            <el-option label="大会议室" value="big_room" />
          </el-select>
        </el-form-item>
        <el-form-item label="发起人" v-if="canFilterByInitiator">
          <el-select v-model="filterForm.initiator" placeholder="选择发起人" clearable filterable style="width: 150px">
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="$emit('filter')">查询</el-button>
          <el-button @click="$emit('reset')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-collapse-transition>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  showAdvanced: Boolean,
  filterForm: Object,
  currentView: String,
  canFilterByInitiator: Boolean
})

defineEmits(['update:showAdvanced', 'filter', 'reset'])
</script>

<style lang="scss" scoped>
.advanced-filter {
  padding: 16px;
  background: #f9fafc;
  border-radius: 4px;
  margin-bottom: 16px;

  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
