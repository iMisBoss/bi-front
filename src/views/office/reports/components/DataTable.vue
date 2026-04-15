<template>
  <div class="data-table">
    <el-table
        :data="tableData"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        style="width: 100%"
    >
      <el-table-column type="selection" width="50" align="center" fixed="left" />

      <el-table-column prop="processNo" label="流程编号" width="150" fixed="left" sortable />
      <el-table-column prop="processName" label="流程名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="template" label="流程模板" width="120" />

      <el-table-column prop="initiator" label="发起人" width="100" />
      <el-table-column prop="initiatorNo" label="工号" width="100" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column prop="position" label="职位" width="120" />
      <el-table-column prop="phone" label="联系方式" width="120">
        <template #default="{ row }">
          <span v-if="row.isSensitive">
            <el-icon><Lock /></el-icon>
            {{ row.phone }}
          </span>
          <span v-else>{{ row.phone }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="startTime" label="发起时间" width="170" sortable />
      <el-table-column prop="endTime" label="完成时间" width="170" sortable />
      <el-table-column prop="duration" label="耗时" width="100" />

      <el-table-column prop="currentApprover" label="当前审批人" width="120" />
      <el-table-column prop="nodeCount" label="审批节点数" width="110" align="center" />
      <el-table-column prop="approvedNodes" label="已审批节点" width="110" align="center" />
      <el-table-column prop="rejectCount" label="驳回次数" width="100" align="center">
        <template #default="{ row }">
          <span :style="{ color: row.rejectCount > 0 ? '#F56C6C' : '' }">{{ row.rejectCount }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="isTimeout" label="是否超时" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isTimeout" type="danger" size="small">超时</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column prop="reason" label="申请事由" min-width="150" show-overflow-tooltip />
      <el-table-column prop="attachmentCount" label="附件数量" width="100" align="center" />

      <el-table-column prop="archiveTime" label="归档时间" width="120" />
      <el-table-column prop="archiver" label="归档人" width="100" />

      <el-table-column prop="isConfidential" label="密级" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.isConfidential" type="danger" size="small">涉密</el-tag>
          <span v-else>普通</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="100" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="handleView(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <span class="total">共 {{ tableData.length }} 条</span>
      <el-select v-model="pageSize" size="small" style="width: 100px; margin: 0 10px">
        <el-option label="50条/页" :value="50" />
        <el-option label="100条/页" :value="100" />
        <el-option label="200条/页" :value="200" />
        <el-option label="500条/页" :value="500" />
      </el-select>
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="tableData.length"
          layout="prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Lock } from '@element-plus/icons-vue'

const props = defineProps({
  tableData: Array,
  loading: Boolean,
  activeTab: String
})

const emit = defineEmits(['view-detail', 'selection-change'])

const currentPage = ref(1)
const pageSize = ref(100)

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleRowClick = (row) => {
  emit('view-detail', row)
}

const handleView = (row) => {
  emit('view-detail', row)
}

const getStatusType = (status) => {
  const map = {
    '草稿': 'info',
    '审批中': 'warning',
    '已通过': 'success',
    '已驳回': 'danger',
    '已撤销': 'info',
    '已归档': 'info'
  }
  return map[status] || 'info'
}
</script>

<style scoped lang="scss">
.data-table {
  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .total {
      font-size: 14px;
      color: #606266;
    }
  }
}
</style>
