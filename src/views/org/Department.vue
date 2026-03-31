<template>
  <div class="department-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>部门管理</span>
          <el-button type="primary" @click="handleAdd">新增部门</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" row-key="id" border>
        <el-table-column prop="name" label="部门名称" width="200" />
        <el-table-column prop="code" label="部门编码" width="150" />
        <el-table-column prop="parentName" label="上级部门" width="150" />
        <el-table-column prop="manager" label="负责人" width="120" />
        <el-table-column prop="order" label="排序" width="80" />
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
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入部门编码" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select v-model="formData.parentId" :data="treeData" placeholder="请选择上级部门" />
        </el-form-item>
        <el-form-item label="负责人" prop="manager">
          <el-input v-model="formData.manager" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="排序" prop="order">
          <el-input-number v-model="formData.order" :min="0" />
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
const treeData = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增部门')
const formRef = ref(null)

const formData = ref({
  id: null,
  name: '',
  code: '',
  parentId: null,
  manager: '',
  order: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '总公司', code: 'HEAD', parentName: '-', manager: '张三', order: 1, status: 1 },
      { id: 2, name: '科技部', code: 'TECH', parentName: '总公司', manager: '李四', order: 1, status: 1 },
      { id: 3, name: '资金部', code: 'HR', parentName: '总公司', manager: '王五', order: 2, status: 1 }
    ]
    treeData.value = [
      { id: 1, label: '总公司', children: [
          { id: 2, label: '科技部' },
          { id: 3, label: '资金部' }
        ]}
    ]
    loading.value = false
  }, 500)
}

const handleAdd = () => {
  dialogTitle.value = '新增部门'
  formData.value = { id: null, name: '', code: '', parentId: null, manager: '', order: 0, status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑部门'
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
.department-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
