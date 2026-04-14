<template>
  <el-dialog
      v-model="visible"
      title="Cron表达式可视化配置"
      width="600px"
      :close-on-click-modal="false"
  >
    <el-form label-width="100px">
      <el-form-item label="执行频率">
        <el-radio-group v-model="frequency">
          <el-radio label="second" value="second">每秒</el-radio>
          <el-radio label="minute" value="minute">每分钟</el-radio>
          <el-radio label="hour" value="hour">每小时</el-radio>
          <el-radio label="day" value="day">每天</el-radio>
          <el-radio label="week" value="week">每周</el-radio>
          <el-radio label="month" value="month">每月</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="执行时间" v-if="frequency === 'day'">
        <el-time-picker
            v-model="execTime"
            placeholder="选择执行时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="执行星期" v-if="frequency === 'week'">
        <el-checkbox-group v-model="weekDays">
          <el-checkbox label="1" value="1">周一</el-checkbox>
          <el-checkbox label="2" value="2">周二</el-checkbox>
          <el-checkbox label="3" value="3">周三</el-checkbox>
          <el-checkbox label="4" value="4">周四</el-checkbox>
          <el-checkbox label="5" value="5">周五</el-checkbox>
          <el-checkbox label="6" value="6">周六</el-checkbox>
          <el-checkbox label="7" value="7">周日</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="执行日期" v-if="frequency === 'month'">
        <el-input-number v-model="dayOfMonth" :min="1" :max="31" />
        <span style="margin-left: 10px">日</span>
      </el-form-item>

      <el-form-item label="预览结果">
        <el-alert
            :title="cronExpression"
            type="success"
            :closable="false"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  cron: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const frequency = ref('day')
const execTime = ref(new Date(2026, 3, 15, 2, 0, 0))
const weekDays = ref(['1', '2', '3', '4', '5'])
const dayOfMonth = ref(1)

const cronExpression = computed(() => {
  const second = '0'
  const minute = execTime.value?.getMinutes() || 0
  const hour = execTime.value?.getHours() || 2

  switch (frequency.value) {
    case 'second':
      return '* * * * * ?'
    case 'minute':
      return `${second} * * * * ?`
    case 'hour':
      return `${second} ${minute} * * * ?`
    case 'day':
      return `${second} ${minute} ${hour} * * ?`
    case 'week':
      return `${second} ${minute} ${hour} ? * ${weekDays.value.join(',')}`
    case 'month':
      return `${second} ${minute} ${hour} ${dayOfMonth.value} * ?`
    default:
      return '0 0 2 * * ?'
  }
})

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleConfirm = () => {
  emit('confirm', cronExpression.value)
  visible.value = false
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
