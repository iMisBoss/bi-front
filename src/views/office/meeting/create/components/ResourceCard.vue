<template>
  <el-card shadow="never" class="form-card">
    <template #header>
      <div class="card-header" @click="showResources = !showResources" style="cursor: pointer">
        <el-icon><Connection /></el-icon>
        <span>关联资源</span>
        <el-icon :size="16" style="margin-left: auto">
          <ArrowDown v-if="!showResources" />
          <ArrowUp v-else />
        </el-icon>
      </div>
    </template>

    <div v-show="showResources">
      <el-form-item label="日程关联">
        <el-switch v-model="form.syncToCalendar" />
        <span style="margin-left: 12px; color: #909399; font-size: 12px">
          开启后自动同步至所有参会人日程
        </span>
      </el-form-item>

      <el-form-item label="附件上传">
        <el-upload
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="fileList"
            multiple
            :limit="5"
        >
          <el-button size="small" type="primary">
            <el-icon><Upload /></el-icon>
            选择文件
          </el-button>
          <template #tip>
            <div style="font-size: 12px; color: #909399">
              支持Word、Excel、PDF、图片等格式，单文件最大20M，最多5个文件
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="设备需求" v-if="form.meetingFormat === 'offline' || form.meetingFormat === 'hybrid'">
        <el-checkbox-group v-model="form.equipments">
          <el-checkbox label="projector">投影仪</el-checkbox>
          <el-checkbox label="mic">无线麦</el-checkbox>
          <el-checkbox label="video">视频会议设备</el-checkbox>
          <el-checkbox label="whiteboard">白板</el-checkbox>
          <el-checkbox label="live">直播设备</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { Connection, ArrowDown, ArrowUp, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  form: Object,
  fileList: Array
})

const emit = defineEmits(['update:fileList', 'file-change', 'file-remove'])

const showResources = ref(false)

const handleFileChange = (file, files) => {
  emit('update:fileList', files)
  emit('file-change', file, files)
}

const handleFileRemove = (file, files) => {
  emit('update:fileList', files)
  emit('file-remove', file, files)
}
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
