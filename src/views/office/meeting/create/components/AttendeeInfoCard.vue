<template>
  <el-card shadow="never" class="form-card">
    <template #header>
      <div class="card-header">
        <el-icon><UserFilled /></el-icon>
        <span>参会信息</span>
      </div>
    </template>

    <el-form-item label="参会人" prop="attendees">
      <el-button @click="$emit('select-attendees')">
        <el-icon><User /></el-icon>
        选择参会人
      </el-button>
      <span style="margin-left: 12px; color: #409eff">
        已选择 {{ form.attendees.length }} 人
      </span>

      <div v-if="form.attendees.length > 0" class="selected-list">
        <el-tag
            v-for="attendee in form.attendees"
            :key="attendee.id"
            closable
            :type="attendee.isRequired ? 'danger' : ''"
            @close="$emit('remove-attendee', attendee)"
            style="margin: 4px"
        >
          {{ attendee.name }} - {{ attendee.department }}
          <span v-if="attendee.isRequired" style="margin-left: 4px; color: #f56c6c">*</span>
        </el-tag>
      </div>

      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        <el-icon><InfoFilled /></el-icon>
        标注 * 的参会人为必填参会人，提交后将反复提醒直至确认参会
      </div>
    </el-form-item>

    <el-form-item label="抄送人">
      <el-button @click="$emit('select-cc')">
        <el-icon><Message /></el-icon>
        选择抄送人
      </el-button>
      <span style="margin-left: 12px; color: #409eff">
        已选择 {{ form.ccUsers.length }} 人
      </span>

      <div v-if="form.ccUsers.length > 0" class="selected-list">
        <el-tag
            v-for="user in form.ccUsers"
            :key="user.id"
            closable
            @close="$emit('remove-cc', user)"
            style="margin: 4px"
        >
          {{ user.name }} - {{ user.department }}
        </el-tag>
      </div>

      <div style="margin-top: 8px; font-size: 12px; color: #909399">
        抄送人仅查看会议详情和接收纪要，无需确认参会
      </div>
    </el-form-item>

    <el-form-item label="会议主持人">
      <el-select
          v-model="form.hostId"
          placeholder="请选择主持人（默认当前用户）"
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

    <el-form-item label="参会提醒">
      <el-select v-model="form.remindTime" placeholder="请选择提醒时间" style="width: 100%">
        <el-option label="不提醒" value="none" />
        <el-option label="提前10分钟" value="10min" />
        <el-option label="提前30分钟（默认）" value="30min" />
        <el-option label="提前1小时" value="1hour" />
        <el-option label="提前1天" value="1day" />
      </el-select>
    </el-form-item>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { UserFilled, User, Message, InfoFilled } from '@element-plus/icons-vue'

defineProps({
  form: Object
})

defineEmits(['select-attendees', 'select-cc', 'remove-attendee', 'remove-cc'])
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

  .selected-list {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
  }
}
</style>
