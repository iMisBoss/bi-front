<template>
  <div class="user-toolbar">
    <!-- 左侧：批量操作 -->
    <div class="toolbar-left">
      <el-button-group>
        <el-button
            type="success"
            @click="$emit('batch-enable')"
            :disabled="selectedCount === 0 || activeTab !== 'disabled'"
            icon="CircleCheck"
        >
          批量启用
        </el-button>
        <el-button
            type="warning"
            @click="$emit('batch-disable')"
            :disabled="selectedCount === 0 || activeTab !== 'active'"
            icon="CircleClose"
        >
          批量禁用
        </el-button>
        <el-button
            @click="$emit('batch-transfer')"
            :disabled="selectedCount === 0 || activeTab !== 'active'"
            icon="Switch"
        >
          批量调岗
        </el-button>
        <el-button
            type="danger"
            @click="$emit('batch-resign')"
            :disabled="selectedCount === 0 || activeTab !== 'active'"
            icon="UserFilled"
        >
          批量离职
        </el-button>
        <el-button @click="$emit('export')" icon="Download">
          导出
        </el-button>
      </el-button-group>
    </div>

    <!-- 中间：基础操作 -->
    <div class="toolbar-center">
      <el-button type="primary" @click="$emit('add')" icon="Plus">新增用户</el-button>
      <el-button @click="$emit('import')" icon="Upload">导入</el-button>
      <el-button @click="$emit('refresh')" icon="Refresh">刷新</el-button>
    </div>

    <!-- 右侧：搜索筛选 -->
    <div class="toolbar-right">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索姓名/工号/手机号"
          prefix-icon="Search"
          clearable
          style="width: 220px"
          @input="$emit('search')"
      />
      <el-select
          v-if="activeTab === 'active'"
          v-model="positionFilter"
          placeholder="岗位"
          style="width: 130px"
          clearable
          @change="$emit('filter')"
      >
        <el-option label="全部" value="" />
        <el-option label="前端开发岗" value="前端开发岗" />
        <el-option label="后端开发岗" value="后端开发岗" />
        <el-option label="技术经理岗" value="技术经理岗" />
        <el-option label="产品岗" value="产品岗" />
        <el-option label="财务岗" value="财务岗" />
      </el-select>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Refresh, Plus, Upload, Download, CircleCheck, CircleClose, Switch, UserFilled } from '@element-plus/icons-vue'

defineProps({
  selectedCount: {
    type: Number,
    default: 0
  },
  activeTab: {
    type: String,
    default: 'active'
  }
})

defineEmits([
  'batch-enable',
  'batch-disable',
  'batch-transfer',
  'batch-resign',
  'export',
  'add',
  'import',
  'refresh',
  'search',
  'filter'
])

const searchKeyword = ref('')
const positionFilter = ref('')
</script>

<style lang="scss" scoped>
.user-toolbar {
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
