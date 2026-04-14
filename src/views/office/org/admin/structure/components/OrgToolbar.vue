<template>
  <div class="org-toolbar">
    <!-- 左侧：所有操作按钮统一样式 -->
    <div class="toolbar-left">
      <el-button-group>
        <el-button @click="$emit('export')" icon="Download">
          数据导出
        </el-button>
        <el-button @click="$emit('import')" icon="Upload">
          导入
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button type="primary" @click="$emit('add')" icon="Plus">
          新增
        </el-button>
        <el-button @click="$emit('refresh')" icon="Refresh">
          刷新
        </el-button>
        <el-button @click="$emit('show-settings')" icon="Setting">
          显示设置
        </el-button>
      </el-button-group>

      <el-button-group>
        <el-button @click="$emit('expand-all')" icon="SortDown">
          全部展开
        </el-button>
        <el-button @click="$emit('collapse-all')" icon="SortUp">
          全部收起
        </el-button>
      </el-button-group>
    </div>

    <!-- 右侧：搜索筛选 -->
    <div class="toolbar-right">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索部门名称、编码、负责人"
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="$emit('search')"
      />
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
      <el-button @click="$emit('show-advanced-filter')" icon="Filter">高级筛选</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh, Plus, Upload, Download, Setting, SortDown, SortUp, Filter } from '@element-plus/icons-vue'

defineEmits([
  'export',
  'import',
  'add',
  'refresh',
  'expand-all',
  'collapse-all',
  'show-settings',
  'search',
  'filter',
  'show-advanced-filter'
])

const searchKeyword = ref('')
const statusFilter = ref('')
</script>

<style lang="scss" scoped>
.org-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
  flex-wrap: wrap;
  gap: 12px;

  .toolbar-left {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
