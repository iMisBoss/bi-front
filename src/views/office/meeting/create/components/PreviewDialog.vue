<template>
  <el-dialog
      v-model="visible"
      title="会议预览"
      width="800px"
      top="5vh"
  >
    <div class="preview-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="会议标题" :span="2">{{ form.title }}</el-descriptions-item>
        <el-descriptions-item label="会议类型">{{ getTypeName(form.type) }}</el-descriptions-item>
        <el-descriptions-item label="会议形式">{{ getFormatName(form.meetingFormat) }}</el-descriptions-item>
        <el-descriptions-item label="会议时间" :span="2">
          {{ formatTimeRange(form.timeRange) }}
        </el-descriptions-item>
        <el-descriptions-item label="会议室" v-if="form.roomName">{{ form.roomName }}</el-descriptions-item>
        <el-descriptions-item label="会议链接" v-if="form.onlineUrl">{{ form.onlineUrl }}</el-descriptions-item>
        <el-descriptions-item label="参会人数" :span="2">{{ form.attendees.length }} 人</el-descriptions-item>
        <el-descriptions-item label="会议描述" :span="2">
          <div style="white-space: pre-wrap">{{ form.description }}</div>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px">
        <h4>参会人列表</h4>
        <el-tag
            v-for="attendee in form.attendees"
            :key="attendee.id"
            :type="attendee.isRequired ? 'danger' : ''"
            style="margin: 4px"
        >
          {{ attendee.name }} - {{ attendee.department }}
          <span v-if="attendee.isRequired" style="margin-left: 4px">*</span>
        </el-tag>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
      <el-button type="primary" @click="$emit('submit')">提交会议</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  form: Object
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getTypeName = (type) => {
  const names = {
    department: '部门例会',
    project: '项目评审会',
    customer: '客户会议',
    training: '培训会议',
    executive: '高管会议',
    secret: '涉密会议',
    other: '其他'
  }
  return names[type] || type
}

const getFormatName = (format) => {
  const names = {
    offline: '线下会议',
    online: '线上会议',
    hybrid: '混合会议'
  }
  return names[format] || format
}

const formatTimeRange = (timeRange) => {
  if (!timeRange || timeRange.length !== 2) return ''
  return `${timeRange[0].toLocaleString()} 至 ${timeRange[1].toLocaleString()}`
}
</script>

<style lang="scss" scoped>
.preview-content {
  h4 {
    margin-bottom: 12px;
    color: #303133;
  }
}
</style>
