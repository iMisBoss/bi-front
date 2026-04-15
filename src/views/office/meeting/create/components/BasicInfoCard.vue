<template>
  <el-card shadow="never" class="form-card">
    <template #header>
      <div class="card-header">
        <el-icon><InfoFilled /></el-icon>
        <span>基础信息</span>
        <span class="required-tip">* 为必填项</span>
      </div>
    </template>

    <el-form-item label="会议标题" prop="title">
      <el-input
          v-model="form.title"
          placeholder="请输入会议标题（如：2026年4月研发部周例会）"
          maxlength="50"
          show-word-limit
      >
        <template #append>
          <el-button @click="$emit('show-history')">历史</el-button>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="会议类型" prop="type">
      <el-select v-model="form.type" placeholder="请选择会议类型" style="width: 100%">
        <el-option label="部门例会" value="department" />
        <el-option label="项目评审会" value="project" />
        <el-option label="客户会议" value="customer" />
        <el-option label="培训会议" value="training" />
        <el-option label="高管会议" value="executive" />
        <el-option label="涉密会议" value="secret" />
        <el-option label="其他" value="other" />
      </el-select>
    </el-form-item>

    <el-form-item label="会议形式" prop="meetingFormat">
      <el-radio-group v-model="form.meetingFormat">
        <el-radio label="offline">线下会议</el-radio>
        <el-radio label="online">线上会议</el-radio>
        <el-radio label="hybrid">混合会议</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item
        v-if="form.meetingFormat === 'offline' || form.meetingFormat === 'hybrid'"
        label="会议室"
        prop="roomId"
    >
      <el-button @click="$emit('select-room')">
        <el-icon><OfficeBuilding /></el-icon>
        {{ form.roomName || '选择会议室' }}
      </el-button>
      <span v-if="form.roomName" style="margin-left: 12px; color: #909399; font-size: 12px">
        {{ form.roomCapacity }}人 | {{ form.roomLocation }}
      </span>
    </el-form-item>

    <el-form-item
        v-if="form.meetingFormat === 'online' || form.meetingFormat === 'hybrid'"
        label="会议链接"
        prop="onlineUrl"
    >
      <el-input
          v-model="form.onlineUrl"
          placeholder="请输入内网会议链接（如：企业内网视频会议地址）"
      >
        <template #prepend>
          <span>🎥</span>
        </template>
      </el-input>
    </el-form-item>

    <el-form-item label="会议时间" prop="timeRange">
      <el-date-picker
          v-model="form.timeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="发起部门" prop="department">
      <el-input v-model="form.department" disabled />
    </el-form-item>

    <el-form-item label="会议描述">
      <el-input
          v-model="form.description"
          type="textarea"
          :rows="6"
          placeholder="请输入会议议程、注意事项、会议目标等（支持富文本）"
      />
      <div style="margin-top: 8px">
        <el-button size="small" @click="$emit('apply-template', 'meeting')">
          套用会议描述模板
        </el-button>
      </div>
    </el-form-item>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { InfoFilled, OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({
  form: Object
})

defineEmits(['select-room', 'apply-template', 'show-history'])
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

    .required-tip {
      font-size: 12px;
      color: #909399;
      font-weight: normal;
      margin-left: auto;
    }
  }
}
</style>
