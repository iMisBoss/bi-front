<template>
  <div class="job-toolbar">
    <!-- 批量操作区 -->
    <div class="toolbar-left">
      <el-button-group>
        <el-button @click="$emit('batch-enable')" :disabled="selectedCount === 0" icon="CircleCheck">
          批量启用
        </el-button>
        <el-button @click="$emit('batch-disable')" :disabled="selectedCount === 0" icon="CircleClose">
          批量禁用
        </el-button>
        <el-button
            type="danger"
            @click="$emit('batch-delete')"
            :disabled="selectedCount === 0"
            icon="Delete"
        >
          批量删除
        </el-button>
        <el-button @click="$emit('export')" icon="Download">
          导出
        </el-button>
      </el-button-group>
    </div>

    <!-- 基础操作区 -->
    <div class="toolbar-center">
      <el-button type="primary" @click="$emit('add')" icon="Plus">新增</el-button>
      <el-button @click="$emit('import')" icon="Upload">导入</el-button>
      <el-button @click="$emit('refresh')" icon="Refresh">刷新</el-button>
    </div>

    <!-- 搜索筛选区 -->
    <div class="toolbar-right">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索名称、编码"
          prefix-icon="Search"
          clearable
          style="width: 220px"
          @input="$emit('search')"
      />
      <el-select
          v-if="activeTab === 'level'"
          v-model="levelFilter"
          placeholder="职级层级"
          style="width: 120px"
          clearable
          @change="$emit('filter')"
      >
        <el-option label="全部" value="" />
        <el-option label="基层" value="基层" />
        <el-option label="中层" value="中层" />
        <el-option label="高层" value="高层" />
        <el-option label="高管" value="高管" />
      </el-select>
      <el-select
          v-model="statusFilter"
          placeholder="状态"
          style="width: 100px"
          clearable
          @change="$emit('filter')"
      >
        <el-option label="全部" value="" />
        <el-option label="启用" value="enabled" />
        <el-option label="禁用" value="disabled" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh, Plus, Upload, Download, Delete, CircleCheck, CircleClose } from '@element-plus/icons-vue'

defineProps({
  selectedCount: {
    type: Number,
    default: 0
  },
  activeTab: {
    type: String,
    default: 'level'
  }
})

defineEmits([
  'batch-enable',
  'batch-disable',
  'batch-delete',
  'export',
  'add',
  'import',
  'refresh',
  'copy',
  'search',
  'filter'
])

const searchKeyword = ref('')
const levelFilter = ref('')
const statusFilter = ref('')
</script>

<style lang="scss" scoped>
.job-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
  gap: 12px;

  .toolbar-left,
  .toolbar-center,
  .toolbar-right {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
