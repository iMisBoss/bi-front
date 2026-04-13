<template>
  <div class="knowledge-page">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="category-card">
          <template #header>
            <div class="card-header">
              <span>知识分类</span>
              <el-button link type="primary" @click="handleAddCategory">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>
          <el-tree
              :data="categoryData"
              :props="{ children: 'children', label: 'label' }"
              node-key="id"
              highlight-current
              @node-click="handleCategoryClick"
          />
        </el-card>
      </el-col>

      <el-col :span="18">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>知识列表</span>
              <div class="header-actions">
                <el-input
                    v-model="searchText"
                    placeholder="搜索知识"
                    clearable
                    style="width: 200px"
                />
                <el-button type="primary" @click="handleAdd">
                  <el-icon><Plus /></el-icon>
                  新增知识
                </el-button>
              </div>
            </div>
          </template>

          <el-table :data="tableData" v-loading="loading" border>
            <el-table-column prop="title" label="标题" min-width="250" />
            <el-table-column prop="category" label="分类" width="120" />
            <el-table-column prop="author" label="作者" width="100" />
            <el-table-column prop="createTime" label="创建时间" width="180" />
            <el-table-column prop="views" label="浏览量" width="100" />
            <el-table-column prop="downloads" label="下载量" width="100" />
            <el-table-column label="操作" fixed="right" width="220">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleView(row)">查看</el-button>
                <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
                <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              class="pagination"
          />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="知识标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="知识分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="技术文档" value="tech" />
            <el-option label="管理制度" value="management" />
            <el-option label="培训资料" value="training" />
            <el-option label="项目文档" value="project" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-select v-model="formData.tags" multiple placeholder="请输入标签">
            <el-option label="Java" value="java" />
            <el-option label="Vue" value="vue" />
            <el-option label="管理" value="management" />
          </el-select>
        </el-form-item>
        <el-form-item label="知识摘要" prop="summary">
          <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="请输入摘要" />
        </el-form-item>
        <el-form-item label="知识内容" prop="content">
          <el-input v-model="formData.content" type="textarea" :rows="10" placeholder="请输入详细内容" />
        </el-form-item>
        <el-form-item label="附件">
          <el-upload
              action="#"
              :auto-upload="false"
              :limit="3"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              上传附件
            </el-button>
          </el-upload>
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
import { Plus, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const searchText = ref('')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const categoryData = ref([
  {
    id: 1,
    label: '技术文档',
    children: [
      { id: 11, label: '前端开发' },
      { id: 12, label: '后端开发' },
      { id: 13, label: '数据库' }
    ]
  },
  {
    id: 2,
    label: '管理制度',
    children: [
      { id: 21, label: '人事制度' },
      { id: 22, label: '财务制度' }
    ]
  },
  {
    id: 3,
    label: '培训资料',
    children: [
      { id: 31, label: '入职培训' },
      { id: 32, label: '技能培训' }
    ]
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增知识')
const formRef = ref(null)

const formData = ref({
  id: null,
  title: '',
  category: '',
  tags: [],
  summary: '',
  content: '',
  author: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, title: 'Vue3 开发规范', category: '技术文档', author: '张三', createTime: '2026-01-15', views: 120, downloads: 25 },
      { id: 2, title: '员工考勤管理制度', category: '管理制度', author: '资金部', createTime: '2026-01-10', views: 350, downloads: 80 },
      { id: 3, title: '新员工入职培训', category: '培训资料', author: '李四', createTime: '2026-01-08', views: 200, downloads: 50 }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleCategoryClick = (node) => {
  loadData()
}

const handleAddCategory = () => {
  ElMessage.info('添加分类功能开发中')
}

const handleAdd = () => {
  dialogTitle.value = '新增知识'
  formData.value = { id: null, title: '', category: '', tags: [], summary: '', content: '', author: '' }
  dialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看知识详情')
}

const handleDownload = (row) => {
  ElMessage.success('下载成功')
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
.knowledge-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }

  .category-card {
    height: calc(100vh - 160px);
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }
}
</style>
