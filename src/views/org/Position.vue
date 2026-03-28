<template>
  <div class="position-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>岗位管理</span>
          <el-button type="primary" @click="handleAdd">新增岗位</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="name" label="岗位名称" width="200" />
        <el-table-column prop="code" label="岗位编码" width="150" />
        <el-table-column prop="department" label="所属部门" width="150" />
        <el-table-column prop="level" label="职级" width="120" />
        <el-table-column prop="headcount" label="编制人数" width="100" />
        <el-table-column prop="currentCount" label="现有人数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="岗位名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入岗位编码" />
        </el-form-item>
        <el-form-item label="所属部门" prop="department">
          <el-select v-model="formData.department" placeholder="请选择部门">
            <el-option label="技术部" value="技术部" />
            <el-option label="人事部" value="人事部" />
          </el-select>
        </el-form-item>
        <el-form-item label="职级" prop="level">
          <el-select v-model="formData.level" placeholder="请选择职级">
            <el-option label="P1" value="P1" />
            <el-option label="P2" value="P2" />
            <el-option label="P3" value="P3" />
          </el-select>
        </el-form-item>
        <el-form-item label="编制人数" prop="headcount">
          <el-input-number v-model="formData.headcount" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增岗位')
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  code: '',
  department: '',
  level: '',
  headcount: 0,
  currentCount: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '前端工程师', code: 'FE001', department: '技术部', level: 'P2', headcount: 10, currentCount: 8, status: 1 },
      { id: 2, name: '后端工程师', code: 'BE001', department: '技术部', level: 'P2', headcount: 15, currentCount: 12, status: 1 }
    ]
    loading.value = false
  }, 500)
}

const handleAdd = () => {
  dialogTitle.value = '新增岗位'
  formData.value = { id: null, name: '', code: '', department: '', level: '', headcount: 0, currentCount: 0, status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑岗位'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessage.success('删除成功')
  loadData()
}

const handleSubmit = () => {
  ElMessage.success('保存成功')
  dialogVisible.value = false
  loadData()
}
</script>

<style lang="scss" scoped>
.position-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
