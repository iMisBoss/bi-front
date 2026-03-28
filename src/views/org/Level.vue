<template>
  <div class="level-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>职级体系</span>
          <el-button type="primary" @click="handleAdd">新增职级</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="level" label="职级" width="120" />
        <el-table-column prop="name" label="职级名称" width="200" />
        <el-table-column prop="minSalary" label="最低薪资" width="120" />
        <el-table-column prop="maxSalary" label="最高薪资" width="120" />
        <el-table-column prop="description" label="描述" width="300" />
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
        <el-form-item label="职级" prop="level">
          <el-input v-model="formData.level" placeholder="请输入职级" />
        </el-form-item>
        <el-form-item label="职级名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入职级名称" />
        </el-form-item>
        <el-form-item label="最低薪资" prop="minSalary">
          <el-input-number v-model="formData.minSalary" :min="0" />
        </el-form-item>
        <el-form-item label="最高薪资" prop="maxSalary">
          <el-input-number v-model="formData.maxSalary" :min="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入描述" />
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
const dialogTitle = ref('新增职级')
const formRef = ref(null)

const formData = ref({
  id: null,
  level: '',
  name: '',
  minSalary: 0,
  maxSalary: 0,
  description: ''
})

const rules = {
  level: [{ required: true, message: '请输入职级', trigger: 'blur' }],
  name: [{ required: true, message: '请输入职级名称', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, level: 'P1', name: '初级工程师', minSalary: 8000, maxSalary: 12000, description: '初级技术岗位' },
      { id: 2, level: 'P2', name: '中级工程师', minSalary: 12000, maxSalary: 20000, description: '中级技术岗位' },
      { id: 3, level: 'P3', name: '高级工程师', minSalary: 20000, maxSalary: 35000, description: '高级技术岗位' }
    ]
    loading.value = false
  }, 500)
}

const handleAdd = () => {
  dialogTitle.value = '新增职级'
  formData.value = { id: null, level: '', name: '', minSalary: 0, maxSalary: 0, description: '' }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑职级'
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
.level-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
