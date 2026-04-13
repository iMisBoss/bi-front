<template>
  <div class="group-table">
    <el-table
        :data="groups"
        border
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        row-key="id"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="群组头像" width="80">
        <template #default="{ row }">
          <el-avatar :size="40" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="groupId" label="群ID" width="100" />
      <el-table-column prop="name" label="群组名称" min-width="180" />
      <el-table-column prop="type" label="群组类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="ownerName" label="群主" width="120" />
      <el-table-column prop="memberCount" label="成员数" width="100">
        <template #default="{ row }">
          {{ row.memberCount }}人
        </template>
      </el-table-column>
      <el-table-column prop="status" label="群状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="280">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="$emit('edit-group', row)">编辑</el-button>
          <el-button link type="primary" size="small" @click.stop="$emit('view-group', row)">详情</el-button>
          <el-button
              v-if="row.status === 'enabled'"
              link
              type="warning"
              size="small"
              @click.stop="$emit('disable-group', row)"
          >
            禁用
          </el-button>
          <el-button
              v-else
              link
              type="success"
              size="small"
              @click.stop="$emit('enable-group', row)"
          >
            启用
          </el-button>
          <el-button
              link
              type="danger"
              size="small"
              :disabled="row.linkedProcesses > 0"
              @click.stop="$emit('disband-group', row)"
          >
            解散
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  groups: {
    type: Array,
    default: () => []
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  total: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'selection-change',
  'row-click',
  'edit-group',
  'view-group',
  'disable-group',
  'enable-group',
  'disband-group',
  'update:page',
  'update:pageSize'
])

const currentPage = computed({
  get: () => props.page,
  set: (value) => emit('update:page', value)
})

const pageSize = computed({
  get: () => props.pageSize,
  set: (value) => emit('update:pageSize', value)
})

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleRowClick = (row) => {
  emit('row-click', row)
}

const getTypeTagType = (type) => {
  const types = {
    '部门群': 'primary',
    '项目群': 'success',
    '系统群': 'warning',
    '临时群': 'info'
  }
  return types[type] || ''
}

const getStatusTagType = (status) => {
  const types = {
    'enabled': 'success',
    'disabled': 'info',
    'disbanded': 'danger'
  }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = {
    'enabled': '启用',
    'disabled': '禁用',
    'disbanded': '已解散'
  }
  return labels[status] || status
}
</script>

<style lang="scss" scoped>
.group-table {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-table) {
    flex: 1;
  }
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
