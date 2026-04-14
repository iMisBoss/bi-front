<template>
  <div class="position-management">
    <el-table
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="sort" label="职务排序" width="100" align="center" />
      <el-table-column prop="name" label="职务名称" min-width="150" />
      <el-table-column prop="code" label="职务编码" width="120" />
      <el-table-column prop="levelName" label="关联职级" width="100" align="center">
        <template #default="{ row }">
          <el-tag type="primary" size="small">{{ row.levelName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sequence" label="所属序列" width="120" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column prop="memberCount" label="绑定人数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="240" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
          <el-button
              link
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              size="small"
              @click="$emit('toggle-status', row)"
          >
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
          <el-button
              link
              type="danger"
              size="small"
              :disabled="row.memberCount > 0"
              @click="$emit('delete', row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  tableData: {
    type: Array,
    default: () => []
  },
  levelOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selection-change', 'edit', 'view', 'delete', 'toggle-status'])

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}
</script>

<style lang="scss" scoped>
.position-management {
  flex: 1;
  overflow: auto;
}
</style>
