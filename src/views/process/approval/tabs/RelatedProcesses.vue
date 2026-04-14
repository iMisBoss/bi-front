<template>
  <div class="related-processes">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>关联流程</span>
          <el-button type="primary" @click="handleAddRelation" icon="Plus">
            添加关联
          </el-button>
        </div>
      </template>

      <!-- 关联列表 -->
      <el-table :data="relatedList" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="processNo" label="流程编号" width="180" />
        <el-table-column prop="processName" label="流程名称" />
        <el-table-column prop="applicant" label="申请人" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="relationType" label="关联类型" width="120" />
        <el-table-column prop="createTime" label="关联时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 添加关联对话框 -->
    <el-dialog
        v-model="dialogVisible"
        title="添加关联流程"
        width="800px"
    >
      <el-form :model="relationForm" label-width="120px">
        <el-form-item label="选择流程">
          <el-select v-model="relationForm.processId" placeholder="请选择流程" style="width: 100%">
            <el-option
                v-for="item in processOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联类型">
          <el-radio-group v-model="relationForm.relationType">
            <el-radio value="前置流程">前置流程</el-radio>
            <el-radio value="后置流程">后置流程</el-radio>
            <el-radio value="并行流程">并行流程</el-radio>
            <el-radio value="其他关联">其他关联</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="关联说明">
          <el-input
              v-model="relationForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入关联说明"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(25)

const relatedList = ref([
  {
    id: 1,
    processNo: 'LC20260115001',
    processName: '采购申请审批',
    applicant: '李四',
    status: '审批中',
    relationType: '前置流程',
    createTime: '2026-01-15 09:00:00'
  },
  {
    id: 2,
    processNo: 'LC20260115002',
    processName: '费用报销申请',
    applicant: '王五',
    status: '已通过',
    relationType: '并行流程',
    createTime: '2026-01-15 10:00:00'
  }
])

const processOptions = ref([
  { id: 1, name: '采购申请审批' },
  { id: 2, name: '费用报销申请' },
  { id: 3, name: '合同审批流程' }
])

const dialogVisible = ref(false)
const relationForm = reactive({
  processId: '',
  relationType: '前置流程',
  description: ''
})

const getStatusType = (status) => {
  const map = {
    '草稿': 'info',
    '审批中': 'warning',
    '已通过': 'success',
    '已驳回': 'danger'
  }
  return map[status] || 'info'
}

const handleAddRelation = () => {
  dialogVisible.value = true
}

const handleConfirmAdd = () => {
  if (!relationForm.processId) {
    ElMessage.warning('请选择流程')
    return
  }
  console.log('添加关联', relationForm)
  ElMessage.success('添加成功')
  dialogVisible.value = false
}

const handleView = (row) => {
  console.log('查看', row)
  window.open(`#/process/approval/detail?id=${row.id}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该关联吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    console.log('删除', row)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped lang="scss">.related-processes {
  height: calc(100vh - 280px);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background-color: #a8a8a8;
    }
  }

  &::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
