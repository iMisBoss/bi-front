<template>
  <div class="resigned-users-table">
    <el-alert
        title="历史用户：已离职人员归档库，数据只读不可编辑，工号永久占用"
        type="info"
        :closable="false"
        style="margin-bottom: 12px"
    />

    <el-table
        :data="tableData"
        border
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column label="头像姓名" width="150">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" class="user-avatar">{{ row.name?.charAt(0) }}</el-avatar>
            <span class="user-name">{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="employeeNo" label="工号" width="100" />
      <el-table-column prop="department" label="原部门" width="120" />
      <el-table-column prop="position" label="原岗位" width="150" />
      <el-table-column prop="joinDate" label="入职日期" width="120" />
      <el-table-column prop="resignDate" label="离职日期" width="120" />
      <el-table-column prop="resignReason" label="离职原因" min-width="150" />
      <el-table-column label="操作" fixed="right" width="120" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('view', row)">查看</el-button>
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

const emit = defineEmits(['view'])
</script>

<style lang="scss" scoped>
.resigned-users-table {
  flex: 1;
  overflow: auto;

  .user-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .user-avatar {
      background: #dcdfe6;
      color: #606266;
      font-weight: 600;
    }

    .user-name {
      font-weight: 500;
      color: #909399;
    }
  }
}
</style>
