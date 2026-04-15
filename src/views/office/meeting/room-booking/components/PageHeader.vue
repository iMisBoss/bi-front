<template>
  <div class="page-header">
    <div class="header-left">
      <el-tabs :model-value="currentView" @update:model-value="$emit('update:currentView', $event)" @tab-change="handleViewChange" class="view-tabs">
        <el-tab-pane name="all">
          <template #label>
            <span class="tab-label">全部会议室</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="my">
          <template #label>
            <span class="tab-label">我的预约</span>
            <el-badge :value="myBookingsCount" :max="99" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane v-if="isAdmin" name="pending">
          <template #label>
            <span class="tab-label">待审批预约</span>
            <el-badge :value="pendingBookingsCount" :max="99" class="tab-badge" type="danger" />
          </template>
        </el-tab-pane>
      </el-tabs>
    </div>
    <div class="header-right">
      <el-input
          :model-value="searchKeyword"
          @update:model-value="$emit('update:searchKeyword', $event)"
          placeholder="搜索会议室/预约人/会议主题"
          prefix-icon="Search"
          clearable
          style="width: 280px"
          @input="$emit('search', searchKeyword)"
      />
      <el-select
          :model-value="floorFilter"
          @update:model-value="$emit('update:floorFilter', $event)"
          placeholder="楼层"
          clearable
          style="width: 120px; margin-left: 12px"
      >
        <el-option label="1楼" value="1F" />
        <el-option label="2楼" value="2F" />
        <el-option label="3楼" value="3F" />
        <el-option label="高管层" value="executive" />
      </el-select>
      <el-select
          :model-value="capacityFilter"
          @update:model-value="$emit('update:capacityFilter', $event)"
          placeholder="容量"
          clearable
          style="width: 120px; margin-left: 8px"
      >
        <el-option label="5人内" value="5" />
        <el-option label="6-10人" value="10" />
        <el-option label="11-20人" value="20" />
        <el-option label="20人以上" value="30" />
      </el-select>
      <el-button type="primary" @click="$emit('book-now')" icon="Plus">我要预约</el-button>
      <el-button @click="$emit('refresh')" icon="Refresh">刷新</el-button>
      <el-button v-if="isAdmin" @click="$emit('room-manage')" icon="Setting">会议室管理</el-button>
      <el-button v-if="isAdmin" @click="$emit('export-report')" icon="Download">导出报表</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  currentView: String,
  myBookingsCount: { type: Number, default: 0 },
  pendingBookingsCount: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false },
  searchKeyword: String,
  floorFilter: String,
  capacityFilter: String
})

const emit = defineEmits(['update:currentView', 'update:searchKeyword', 'update:floorFilter', 'update:capacityFilter', 'view-change', 'search', 'book-now', 'refresh', 'room-manage', 'export-report'])

const handleViewChange = () => {
  emit('view-change')
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  padding: 12px 16px;
  background: #fff;
  border-radius: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  flex-shrink: 0;

  .header-left,
  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header-left {
    flex: 1;
    min-width: 0;

    .view-tabs {
      :deep(.el-tabs__header) {
        margin: 0;
        border-bottom: none;
      }

      :deep(.el-tabs__nav-wrap) {
        &::after {
          display: none;
        }
      }

      :deep(.el-tabs__item) {
        padding: 0 16px;
        height: 36px;
        line-height: 36px;
        font-size: 14px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        margin-right: 8px;
        background: #f5f7fa;
        color: #606266;
        transition: all 0.3s;

        &:hover {
          color: #409eff;
          border-color: #c6e2ff;
          background: #ecf5ff;
        }

        &.is-active {
          color: #fff;
          background: #409eff;
          border-color: #409eff;
        }

        .tab-label {
          margin-right: 6px;
        }

        .tab-badge {
          :deep(.el-badge__content) {
            background-color: #f56c6c;
            font-size: 11px;
            height: 18px;
            line-height: 18px;
            padding: 0 5px;
          }
        }
      }
    }
  }

  .header-right {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
