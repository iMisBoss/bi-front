<template>
  <div class="room-management">
    <el-table
        ref="tableRef"
        :data="tableData"
        style="width: 100%"
        border
        v-loading="loading"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="会议室名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="capacity" label="容纳人数" width="100" align="center">
        <template #default="{ row }">
          {{ row.capacity }}人
        </template>
      </el-table-column>
      <el-table-column prop="floor" label="所在楼层" width="100" />
      <el-table-column prop="equipment" label="设备信息" min-width="180" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="primary" link @click="handleView(row)">查看</el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['selection-change', 'edit', 'view', 'delete'])

const loading = ref(false)
const tableRef = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const tableData = ref([
  {
    id: 1,
    name: '一号会议室',
    capacity: 20,
    floor: '1楼',
    equipment: '投影、白板',
    status: 'enabled'
  },
  {
    id: 2,
    name: '二号会议室',
    capacity: 10,
    floor: '2楼',
    equipment: '视频会议',
    status: 'disabled'
  },
  {
    id: 3,
    name: '三号会议室',
    capacity: 30,
    floor: '3楼',
    equipment: '投影、音响、白板',
    status: 'enabled'
  },
  {
    id: 4,
    name: 'VIP会议室',
    capacity: 15,
    floor: '5楼',
    equipment: '视频会议、投影、音响',
    status: 'enabled'
  }
])

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const handleEdit = (row) => {
  emit('edit', row)
}

const handleView = (row) => {
  emit('view', row)
}

const handleDelete = (row) => {
  emit('delete', row)
}

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    total.value = tableData.value.length
  }, 300)
}

defineExpose({
  loadData
})

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.room-management {
  padding: 20px;

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
