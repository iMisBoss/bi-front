<template>
  <div class="list-view">
    <el-table :data="records" border stripe @row-click="handleRowClick">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.statusColor" size="small">{{ row.statusLabel }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="title" label="纪要标题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="meetingName" label="关联会议" width="180" show-overflow-tooltip />
      <el-table-column label="起草人" width="140">
        <template #default="{ row }">
          {{ row.initiator }} · {{ row.initiatorDept }}
        </template>
      </el-table-column>
      <el-table-column prop="meetingTime" label="会议时间" width="170" />
      <el-table-column label="待办" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small">{{ row.todoCount }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="可见范围" width="110" align="center">
        <template #default="{ row }">
          {{ getVisibilityText(row.visibility) }}
        </template>
      </el-table-column>
      <el-table-column prop="lastEditTime" label="最后编辑" width="170" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="handleClick(row)">
            查看
          </el-button>
          <el-button
              v-if="row.status === 'draft' || row.status === 'rejected'"
              link
              type="warning"
              size="small"
              @click.stop="$emit('edit', row)"
          >
            编辑
          </el-button>
          <el-button
              v-if="row.status === 'draft' || row.status === 'rejected'"
              link
              type="success"
              size="small"
              @click.stop="$emit('submit', row)"
          >
            提交
          </el-button>
          <el-button link type="info" size="small" @click.stop="$emit('export', row)">
            导出
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  records: Array,
  selectedIds: Array
})

const emit = defineEmits(['select', 'click', 'edit', 'submit', 'publish', 'export'])

const handleRowClick = (row) => {
  emit('click', row)
}

const handleClick = (row) => {
  emit('click', row)
}

const getVisibilityText = (visibility) => {
  const texts = {
    personal: '本人仅见',
    meeting: '参会人可见',
    department: '部门可见',
    company: '全公司可见',
    specific: '指定人员'
  }
  return texts[visibility] || '未知'
}
</script>
