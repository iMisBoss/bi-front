<template>
  <el-dialog
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      title="通知设置"
      width="600px"
  >
    <el-form :model="settingsForm" label-width="120px">
      <el-divider content-position="left">提醒设置</el-divider>
      <el-form-item label="提醒时间">
        <el-checkbox-group v-model="settingsForm.remindTimes">
          <el-checkbox value="5">提前5分钟</el-checkbox>
          <el-checkbox value="10">提前10分钟</el-checkbox>
          <el-checkbox value="30">提前30分钟</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="弹窗开关">
        <el-switch v-model="settingsForm.enablePopup" />
        <span style="margin-left: 8px; font-size: 12px; color: #909399">
          重要会议强制弹窗提醒
        </span>
      </el-form-item>

      <el-divider content-position="left">免打扰设置</el-divider>
      <el-form-item label="免打扰时段">
        <el-switch v-model="settingsForm.enableDND" />
        <div v-if="settingsForm.enableDND" style="margin-top: 12px">
          <el-time-picker
              v-model="settingsForm.dndStart"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="开始时间"
              style="width: 140px; margin-right: 8px"
          />
          <span>至</span>
          <el-time-picker
              v-model="settingsForm.dndEnd"
              format="HH:mm"
              value-format="HH:mm"
              placeholder="结束时间"
              style="width: 140px; margin-left: 8px"
          />
        </div>
      </el-form-item>

      <el-divider content-position="left">回执设置</el-divider>
      <el-form-item label="回执默认选项">
        <el-radio-group v-model="settingsForm.defaultReply">
          <el-radio value="manual">手动确认所有会议</el-radio>
          <el-radio value="auto-small">自动确认小型会议</el-radio>
          <el-radio value="auto-all">自动确认所有会议</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-divider content-position="left">消息范围</el-divider>
      <el-form-item label="接收范围">
        <el-checkbox-group v-model="settingsForm.receiveScope">
          <el-checkbox value="direct">直接参会通知</el-checkbox>
          <el-checkbox value="cc">抄送通知</el-checkbox>
          <el-checkbox value="reminder">会议提醒</el-checkbox>
          <el-checkbox value="change">会议变更</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" @click="handleSave">保存设置</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, reactive } from 'vue'

const props = defineProps({
  visible: Boolean
})

const emit = defineEmits(['update:visible', 'save'])

const settingsForm = reactive({
  remindTimes: ['5', '10', '30'],
  enablePopup: true,
  enableDND: false,
  dndStart: '12:00',
  dndEnd: '13:00',
  defaultReply: 'manual',
  receiveScope: ['direct', 'cc', 'reminder', 'change']
})

const handleSave = () => {
  emit('save', settingsForm)
}
</script>

<style lang="scss" scoped>
// 继承父级样式
</style>
