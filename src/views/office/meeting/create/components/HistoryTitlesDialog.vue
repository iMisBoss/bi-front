<template>
  <el-dialog
      v-model="visible"
      title="历史会议标题"
      width="600px"
  >
    <div class="history-list">
      <div
          v-for="title in historyTitles"
          :key="title"
          class="history-item"
          @click="$emit('select', title)"
      >
        {{ title }}
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  historyTitles: Array
})

const emit = defineEmits(['update:modelValue', 'select'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<style lang="scss" scoped>
.history-list {
  .history-item {
    padding: 12px;
    margin-bottom: 8px;
    background: #f5f7fa;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      background: #ecf5ff;
      color: #409eff;
    }
  }
}
</style>
