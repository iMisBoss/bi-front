<template>
  <div class="dimension-nav">
    <el-card shadow="never" class="nav-card">
      <el-menu
          :default-active="modelValue"
          class="nav-menu"
          @select="handleSelect"
      >
        <el-menu-item
            v-for="dim in dimensions"
            :key="dim.key"
            :index="dim.key"
        >
          <el-icon><component :is="dim.icon" /></el-icon>
          <span>{{ dim.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-card>
  </div>
</template>

<script setup>
import {
  DataLine,
  OfficeBuilding,
  TrendCharts,
  User,
  DocumentChecked,
  Warning,
  Histogram,
  Search
} from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  dimensions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const handleSelect = (key) => {
  emit('update:modelValue', key)
}
</script>

<style lang="scss" scoped>
.dimension-nav {
  width: 220px;
  flex-shrink: 0;

  .nav-card {
    height: 100%;
    :deep(.el-card__body) {
      padding: 0;
      height: 100%;
    }

    .nav-menu {
      border-right: none;
      height: 100%;

      :deep(.el-menu-item) {
        height: 50px;
        line-height: 50px;

        &.is-active {
          background-color: #ecf5ff;
          color: #409eff;
          border-right: 3px solid #409eff;
        }

        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
}
</style>
