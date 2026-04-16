
<template>
  <div class="category-navigation">
    <div
        v-for="category in categories"
        :key="category.key"
        class="category-item"
        :class="{ active: activeCategory === category.key }"
        @click="$emit('change', category.key)"
    >
      <el-icon class="category-icon">
        <component :is="category.icon" />
      </el-icon>
      <span class="category-label">{{ category.label }}</span>
      <el-badge
          v-if="category.count > 0"
          :value="category.count"
          :max="99"
          class="category-badge"
      />
    </div>
  </div>
</template>

<script setup>import { defineProps, defineEmits } from 'vue'
import { Edit, Bell, View, Document, Folder, List } from '@element-plus/icons-vue'

defineProps({
  categories: Array,
  activeCategory: String
})

defineEmits(['change'])
</script>

<style lang="scss" scoped>
.category-navigation {
  width: 200px;
  min-width: 200px;
  background: #fff;
  border-right: 1px solid #ebeef5;
  padding: 16px 0;
  overflow-y: auto;

  .category-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;

    &:hover {
      background: #f5f7fa;
    }

    &.active {
      background: #ecf5ff;
      color: #409eff;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #409eff;
      }
    }

    .category-icon {
      font-size: 18px;
      margin-right: 12px;
    }

    .category-label {
      flex: 1;
      font-size: 14px;
    }

    .category-badge {
      :deep(.el-badge__content) {
        background-color: #f56c6c;
      }
    }
  }
}
</style>