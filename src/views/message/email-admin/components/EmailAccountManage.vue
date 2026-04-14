<template>
  <div class="email-account-manage">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
              type="success"
              @click="handleBatchEnable"
              :disabled="selectedRows.length === 0"
          >
            批量启用
          </el-button>
          <el-button
              type="warning"
              @click="handleBatchDisable"
              :disabled="selectedRows.length === 0"
          >
            批量禁用
          </el-button>
          <el-button @click="handleExport" icon="Download">
            导出
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索姓名、工号、邮箱账号"
            prefix-icon="Search"
            clearable
            style="width: 280px"
            @input="handleSearch"
        />
        <el-select
            v-model="statusFilter"
            placeholder="账号状态"
            style="width: 120px"
            clearable
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-select
            v-model="deptFilter"
            placeholder="所属部门"
            style="width: 150px"
            clearable
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="技术部" value="技术部" />
          <el-option label="产品部" value="产品部" />
          <el-option label="财务部" value="财务部" />
        </el-select>
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 账号列表表格 -->
    <el-table
        :data="filteredAccounts"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="employeeNo" label="工号" width="100" />
      <el-table-column prop="email" label="邮箱账号" min-width="180" />
      <el-table-column prop="department" label="所属部门" width="120" />
      <el-table-column prop="usedCapacity" label="已用容量" width="100" />
      <el-table-column prop="totalCapacity" label="总容量" width="100" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button
              link
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
          >
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 账号配置抽屉 -->
    <EmailAccountDrawer
        v-model="showAccountDrawer"
        :data="currentAccount"
        @confirm="handleConfirmSave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmailAccountDrawer from './EmailAccountDrawer.vue'

const selectedRows = ref([])
const currentAccount = ref(null)
const showAccountDrawer = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const statusFilter = ref('')
const deptFilter = ref('')

const accountData = ref([])

const filteredAccounts = computed(() => {
  let data = [...accountData.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.name?.includes(searchKeyword.value) ||
        item.employeeNo?.includes(searchKeyword.value) ||
        item.email?.includes(searchKeyword.value)
    )
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  if (deptFilter.value) {
    data = data.filter(item => item.department === deptFilter.value)
  }

  total.value = data.length
  return data
})

onMounted(() => {
  loadAccountData()
})

const loadAccountData = () => {
  accountData.value = [
    { id: 1, name: '张三', employeeNo: 'E001', email: 'zhangsan@oa.com', department: '技术部', usedCapacity: '10MB', totalCapacity: '100MB', status: 'enabled' },
    { id: 2, name: '李四', employeeNo: 'E002', email: 'lisi@oa.com', department: '技术部', usedCapacity: '50MB', totalCapacity: '100MB', status: 'enabled' },
    { id: 3, name: '王五', employeeNo: 'E003', email: 'wangwu@oa.com', department: '产品部', usedCapacity: '25MB', totalCapacity: '100MB', status: 'enabled' },
    { id: 4, name: '赵六', employeeNo: 'E004', email: 'zhaoliu@oa.com', department: '技术部', usedCapacity: '80MB', totalCapacity: '100MB', status: 'enabled' },
    { id: 5, name: '孙七', employeeNo: 'E005', email: 'sunqi@oa.com', department: '产品部', usedCapacity: '15MB', totalCapacity: '100MB', status: 'disabled' },
    { id: 6, name: '周八', employeeNo: 'E006', email: 'zhouba@oa.com', department: '财务部', usedCapacity: '30MB', totalCapacity: '100MB', status: 'enabled' },
    { id: 7, name: '吴九', employeeNo: 'E007', email: 'wujiu@oa.com', department: '技术部', usedCapacity: '5MB', totalCapacity: '100MB', status: 'enabled' },
    { id: 8, name: '郑十', employeeNo: 'E008', email: 'zhengshi@oa.com', department: '技术部', usedCapacity: '45MB', totalCapacity: '100MB', status: 'enabled' }
  ]
  total.value = accountData.value.length
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleEdit = (row) => {
  currentAccount.value = { ...row }
  showAccountDrawer.value = true
}

const handleToggleStatus = (row) => {
  const action = row.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}邮箱账号「${row.email}」吗？`, `${action}账号`, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
      `确定要批量启用 ${selectedRows.value.length} 个邮箱账号吗？`,
      '批量启用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'enabled'
    })
    ElMessage.success('批量启用成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
      `确定要批量禁用 ${selectedRows.value.length} 个邮箱账号吗？`,
      '批量禁用',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'disabled'
    })
    ElMessage.success('批量禁用成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('账号数据导出成功')
}

const handleRefresh = () => {
  loadAccountData()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}
const handleFilter = () => {}

const handleConfirmSave = (formData) => {
  const index = accountData.value.findIndex(item => item.id === formData.id)
  if (index !== -1) {
    accountData.value[index] = { ...accountData.value[index], ...formData }
  }
  ElMessage.success('保存成功')
  showAccountDrawer.value = false
}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
.email-account-manage {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
