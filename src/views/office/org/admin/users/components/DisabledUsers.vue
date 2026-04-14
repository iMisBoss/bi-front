<template>
  <div class="disabled-users-table">
    <el-alert
        title="禁用用户：账号已被冻结，无法登录系统，但未离职，保留组织架构位置"
        type="warning"
        :closable="false"
        style="margin-bottom: 12px"
    />

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
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="disableDate" label="禁用时间" width="120" />
      <el-table-column prop="disableReason" label="禁用原因" min-width="150" />
      <el-table-column label="操作" fixed="right" width="180" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
          <el-button link type="success" size="small" @click="$emit('enable', row)">启用</el-button>
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

const emit = defineEmits(['selection-change', 'view', 'enable'])

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}
</script>

<style lang="scss" scoped>
.disabled-users-table {
  flex: 1;
  overflow: auto;

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-avatar {
      background: #909399;
      color: #fff;
      font-weight: 600;
    }

    .user-name {
      font-weight: 500;
      color: #909399;
    }
  }
}
</style>
