<template>
  <div class="search-bar">
    <el-input
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        placeholder="搜索会议标题/编号/发起人/参会人/会议室"
        clearable
        prefix-icon="Search"
        style="width: 400px"
        @input="$emit('search')"
    />
    <el-button @click="$emit('update:showAdvanced', !showAdvanced)" icon="Filter">
      {{ showAdvanced ? '收起筛选' : '高级筛选' }}
    </el-button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Search, Filter } from '@element-plus/icons-vue'

defineProps({
  modelValue: String,
  showAdvanced: Boolean
})

defineEmits(['update:modelValue', 'update:showAdvanced', 'search'])
</script>

<style lang="scss" scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
</style>
