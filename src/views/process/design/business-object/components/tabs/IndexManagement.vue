<template>
  <div class="index-management">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Plus" @click="handleAddIndex">新增索引</el-button>
        <el-button v-if="!isVersionEdit" size="default" icon="Document">推荐索引</el-button>
      </div>
    </div>

    <el-table :data="indexList" border style="width: 100%" max-height="400">
      <el-table-column prop="indexName" label="索引名称" min-width="180" />
      <el-table-column prop="indexType" label="索引类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getIndexTypeTag(row.indexType)">
            {{ row.indexType }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="columns" label="包含字段" min-width="200">
        <template #default="{ row }">
          <div class="index-columns">
            <el-tag v-for="col in row.columns" :key="col" size="small" style="margin-right: 6px">
              {{ col }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="{ row }">
          <el-button
              v-if="!row.system && (!isVersionEdit || row.isNewIndex)"
              size="small"
              type="danger"
              icon="Delete"
              @click="handleDeleteIndex(row)"
          >
            删除
          </el-button>
          <el-button
              v-else
              size="small"
              disabled
              icon="Lock"
          >
            系统索引
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const indexList = ref([
  {
    id: 1,
    indexName: 'idx_bill_no',
    indexType: 'UNIQUE',
    fields: ['bill_no'],
    description: '单据编号唯一索引，保证单据编号全局唯一',
    status: 'enabled',
    system: true,
    isNewIndex: false
  },
  {
    id: 2,
    indexName: 'idx_applicant',
    indexType: 'NORMAL',
    fields: ['applicant_id'],
    description: '申请人查询索引，优化按申请人查询性能',
    status: 'enabled',
    system: true,
    isNewIndex: false
  },
  {
    id: 3,
    indexName: 'idx_apply_date',
    indexType: 'NORMAL',
    fields: ['apply_date'],
    description: '申请日期索引，优化按日期范围查询',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 4,
    indexName: 'idx_license_plate',
    indexType: 'UNIQUE',
    fields: ['license_plate'],
    description: '车牌号唯一索引，防止重复申请',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 5,
    indexName: 'idx_status_date',
    indexType: 'COMPOSITE',
    fields: ['approval_status', 'apply_date'],
    description: '复合索引，优化按状态和日期联合查询',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 6,
    indexName: 'idx_dept_status',
    indexType: 'COMPOSITE',
    fields: ['apply_dept_id', 'approval_status'],
    description: '复合索引，优化部门审批状态查询',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 7,
    indexName: 'idx_vehicle_time',
    indexType: 'COMPOSITE',
    fields: ['vehicle_id', 'start_time', 'end_time'],
    description: '复合索引，优化车辆时间段冲突检测',
    status: 'enabled',
    system: false,
    isNewIndex: false
  }
])

const handleAddIndex = () => {
  const newId = Math.max(...indexList.value.map(i => i.id), 0) + 1
  indexList.value.push({
    id: newId,
    indexName: 'idx_new',
    indexType: 'NORMAL',
    columns: [],
    system: false,
    isNewIndex: props.isVersionEdit
  })
  emit('change', indexList.value)
}

const handleDeleteIndex = (row) => {
  ElMessageBox.confirm(`确定要删除索引"${row.indexName}"吗？`, '删除确认', { type: 'warning' }).then(() => {
    indexList.value = indexList.value.filter(i => i.id !== row.id)
    ElMessage.success('删除成功')
    emit('change', indexList.value)
  }).catch(() => {})
}

const getIndexTypeTag = (type) => {
  const tags = { 'PRIMARY': 'danger', 'UNIQUE': 'warning', 'NORMAL': 'info' }
  return tags[type] || 'info'
}

defineExpose({
  indexList
})
</script>

<style scoped lang="scss">
.index-management {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  .index-columns {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
}
</style>
