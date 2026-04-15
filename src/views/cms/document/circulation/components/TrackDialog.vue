<template>
  <el-dialog
      v-model="visible"
      title="流程跟踪"
      width="800px"
      :close-on-click-modal="false"
  >
    <div class="track-info">
      <h4>公文信息</h4>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="公文标题">{{ document.title }}</el-descriptions-item>
        <el-descriptions-item label="文号">{{ document.docNumber }}</el-descriptions-item>
        <el-descriptions-item label="承办人">{{ document.handler }}</el-descriptions-item>
        <el-descriptions-item label="办理期限">{{ document.deadline }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="track-timeline">
      <h4>流转轨迹</h4>
      <el-timeline>
        <el-timeline-item
            v-for="(activity, index) in activities"
            :key="index"
            :timestamp="activity.timestamp"
            :type="activity.type"
            :color="activity.color"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  document: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(false)

const activities = ref([
  { content: '发起督办', timestamp: '2026-01-15 09:00', type: 'primary', color: '#409EFF' },
  { content: '推送至承办人', timestamp: '2026-01-15 09:05', type: 'success', color: '#67C23A' },
  { content: '承办人已接收', timestamp: '2026-01-15 10:30', type: 'success', color: '#67C23A' },
  { content: '催办通知已发送', timestamp: '2026-01-18 14:00', type: 'warning', color: '#E6A23C' }
])

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})
</script>

<style scoped lang="scss">
.track-info {
  margin-bottom: 24px;

  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }
}

.track-timeline {
  h4 {
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 600;
  }
}
</style>
