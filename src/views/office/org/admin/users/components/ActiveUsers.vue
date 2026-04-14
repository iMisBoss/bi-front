<template>
  <div class="active-users-table">
    <el-table
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="头像姓名" width="150">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" class="user-avatar">{{ row.name?.charAt(0) }}</el-avatar>
            <span class="user-name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="employeeNo" label="工号" width="100" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column prop="position" label="岗位" width="150" />
      <el-table-column prop="level" label="职级" width="100">
        <template #default="{ row }">
          <el-tag size="small">{{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="status" label="人员状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="joinDate" label="入职日期" width="120" />
      <el-table-column prop="reportTo" label="直属领导" width="100" />
      <el-table-column label="操作" fixed="right" width="280" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
          <el-button link type="warning" size="small" @click="$emit('disable', row)">禁用</el-button>
          <el-button link type="danger" size="small" :disabled="row.isAdmin" @click="$emit('resign', row)">离职</el-button>
          <el-button link type="primary" size="small" @click="$emit('reset-password', row)">重置密码</el-button>
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
  }
})

const emit = defineEmits(['selection-change', 'edit', 'view', 'disable', 'resign', 'reset-password'])

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const getStatusType = (status) => {
  const types = { active: 'success', disabled: 'warning', resigned: 'info' }
  return types[status] || ''
}

const getStatusLabel = (status) => {
  const labels = { active: '在职', disabled: '禁用', resigned: '离职' }
  return labels[status] || status
}
</script>

<style lang="scss" scoped>
.active-users-table {
  flex: 1;
  overflow: auto;

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-avatar {
      background: #409eff;
      color: #fff;
      font-weight: 600;
    }

    .user-name {
      font-weight: 500;
    }
  }
}
</style>
