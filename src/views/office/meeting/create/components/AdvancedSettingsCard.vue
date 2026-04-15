<template>
  <el-card shadow="never" class="form-card">
    <template #header>
      <div class="card-header" @click="showAdvanced = !showAdvanced" style="cursor: pointer">
        <el-icon><Setting /></el-icon>
        <span>高级设置</span>
        <el-icon :size="16" style="margin-left: auto">
          <ArrowDown v-if="!showAdvanced" />
          <ArrowUp v-else />
        </el-icon>
      </div>
    </template>

    <div v-show="showAdvanced">
      <el-form-item label="重复会议">
        <el-select v-model="form.repeatType" placeholder="请选择重复方式" style="width: 100%">
          <el-option label="单次会议（默认）" value="none" />
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="重复结束" v-if="form.repeatType !== 'none'">
        <el-radio-group v-model="form.repeatEndType">
          <el-radio label="count">重复N次</el-radio>
          <el-radio label="date">至指定日期</el-radio>
        </el-radio-group>
        <el-input-number
            v-if="form.repeatEndType === 'count'"
            v-model="form.repeatCount"
            :min="1"
            :max="100"
            style="margin-left: 12px; width: 120px"
        />
        <el-date-picker
            v-if="form.repeatEndType === 'date'"
            v-model="form.repeatEndDate"
            type="date"
            placeholder="选择结束日期"
            style="margin-left: 12px; width: 200px"
        />
        <el-checkbox v-model="form.skipHolidays" style="margin-left: 12px">
          跳过节假日
        </el-checkbox>
      </el-form-item>

      <el-form-item label="会议优先级">
        <el-select v-model="form.priority" placeholder="请选择优先级" style="width: 100%">
          <el-option label="高" value="high" />
          <el-option label="中（默认）" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </el-form-item>

      <el-form-item label="签到设置">
        <el-switch v-model="form.requireCheckin" />
        <span style="margin-left: 12px; color: #909399; font-size: 12px">
          开启后参会人需在线签到
        </span>
      </el-form-item>

      <el-form-item label="签到时间" v-if="form.requireCheckin">
        <el-time-picker
            v-model="form.checkinStartTime"
            placeholder="签到开始时间"
            style="width: 150px"
        />
        <span style="margin: 0 8px">至</span>
        <el-time-picker
            v-model="form.checkinEndTime"
            placeholder="签到结束时间"
            style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="纪要负责人">
        <el-select
            v-model="form.minutesOwner"
            placeholder="默认发起者"
            style="width: 100%"
            clearable
        >
          <el-option
              v-for="attendee in form.attendees"
              :key="attendee.id"
              :label="attendee.name + ' - ' + attendee.department"
              :value="attendee.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="纪要提交时限">
        <el-input-number
            v-model="form.minutesDeadline"
            :min="1"
            :max="7"
            style="width: 120px"
        />
        <span style="margin-left: 8px">天内提交</span>
      </el-form-item>

      <el-form-item label="纪要可见范围">
        <el-select v-model="form.minutesVisibility" placeholder="请选择" style="width: 100%">
          <el-option label="仅参会人可见（默认）" value="attendees" />
          <el-option label="部门可见" value="department" />
          <el-option label="全公司可见" value="company" />
          <el-option label="指定人员可见" value="custom" />
        </el-select>
      </el-form-item>

      <el-form-item label="跨天设置">
        <el-checkbox v-model="form.allowCrossDay">
          允许跨天（默认禁止）
        </el-checkbox>
      </el-form-item>

      <el-form-item label="涉密设置" v-if="isAdmin || isExecutive">
        <el-switch v-model="form.isSecret" />
        <span style="margin-left: 12px; color: #f56c6c; font-size: 12px">
          涉密会议仅指定参会人可见，信息加密存储
        </span>
      </el-form-item>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import { Setting, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

defineProps({
  form: Object,
  isAdmin: Boolean,
  isExecutive: Boolean
})

const showAdvanced = ref(false)
</script>

<style lang="scss" scoped>
.form-card {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    padding: 12px 20px;
    background: #fafafa;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
