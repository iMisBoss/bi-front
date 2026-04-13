<template>
  <div class="external-contacts">
    <el-table
        :data="contacts"
        border
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        row-key="id"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="头像姓名" width="150">
        <template #default="{ row }">
          <div class="contact-cell">
            <el-avatar :size="32" :src="row.avatar">{{ row.name.charAt(0) }}</el-avatar>
            <span class="contact-name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="company" label="所属公司" width="180" />
      <el-table-column prop="category" label="联系人分类" width="120" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="$emit('edit-contact', row)">编辑</el-button>
          <el-button link type="primary" size="small" @click.stop="$emit('view-contact', row)">查看</el-button>
          <el-button
              v-if="row.status === 'enabled'"
              link
              type="warning"
              size="small"
              @click.stop="$emit('disable-contact', row)"
          >
            禁用
          </el-button>
          <el-button
              v-else
              link
              type="success"
              size="small"
              @click.stop="$emit('enable-contact', row)"
          >
            启用
          </el-button>
          <el-button
              link
              type="danger"
              size="small"
              :disabled="row.linkedProcesses > 0"
              @click.stop="$emit('delete-contact', row)"
          >
            删除
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
  contacts: {
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
  'edit-contact',
  'view-contact',
  'disable-contact',
  'enable-contact',
  'delete-contact',
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
</script>

<style lang="scss" scoped>
.external-contacts {
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

.contact-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .contact-name {
    font-weight: 500;
  }
}
</style>
