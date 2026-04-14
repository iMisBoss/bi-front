<template>
  <div class="group-toolbar">
    <!-- 左侧：批量操作 -->
    <div class="toolbar-left">
      <el-button-group>
        <el-button
            type="warning"
            @click="$emit('batch-disable')"
            :disabled="selectedCount === 0"
            icon="CircleClose"
        >
          批量禁用
        </el-button>
        <el-button
            type="danger"
            @click="$emit('batch-dissolve')"
            :disabled="selectedCount === 0"
            icon="Delete"
        >
          批量解散
        </el-button>
        <el-button @click="$emit('export')" icon="Download">
          导出
        </el-button>
      </el-button-group>
    </div>

    <!-- 中间：基础操作 -->
    <div class="toolbar-center">
      <el-button type="primary" @click="$emit('add')" icon="Plus">新增群组</el-button>
      <el-button @click="$emit('import')" icon="Upload">导入</el-button>
      <el-button @click="$emit('refresh')" icon="Refresh">刷新</el-button>
      <el-button @click="$emit('show-settings')" icon="Setting">显示设置</el-button>
    </div>

    <!-- 右侧：搜索筛选 -->
    <div class="toolbar-right">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索群组名称、群ID、群主"
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="$emit('search')"
      />
      <el-select
          v-model="typeFilter"
          placeholder="群组类型"
          style="width: 120px"
          clearable
          @change="$emit('filter')"
      >
        <el-option label="全部" value="" />
        <el-option label="部门群" value="department" />
        <el-option label="项目群" value="project" />
        <el-option label="系统群" value="system" />
        <el-option label="临时群" value="temporary" />
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
import { Search, Refresh, Plus, Upload, Download, Setting, CircleClose, Delete } from '@element-plus/icons-vue'

defineProps({
  selectedCount: {
    type: Number,
    default: 0
  }
})

defineEmits([
  'batch-disable',
  'batch-dissolve',
  'export',
  'add',
  'import',
  'refresh',
  'show-settings',
  'search',
  'filter'
])

const searchKeyword = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
</script>

<style lang="scss" scoped>
.group-toolbar {
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
