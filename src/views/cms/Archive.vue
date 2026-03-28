<template>
  <div class="archive-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>文档库</span>
          <div class="header-actions">
            <el-input
                v-model="searchText"
                placeholder="搜索文档"
                clearable
                style="width: 200px"
            />
            <el-button type="primary" @click="handleUpload">
              <el-icon><Upload /></el-icon>
              上传文档
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="name" label="文档名称" min-width="300">
          <template #default="{ row }">
            <el-icon :size="18" :color="getFileIcon(row.type).color">
              <component :is="getFileIcon(row.type).icon" />
            </el-icon>
            <span style="margin-left: 8px">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="size" label="大小" width="100" />
        <el-table-column prop="uploader" label="上传人" width="100" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" />
        <el-table-column prop="downloads" label="下载量" width="100" />
        <el-table-column label="操作" fixed="right" width="220">
          <template #default="{ row }">
            <el-button link type="primary" @click="handlePreview(row)">预览</el-button>
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

    <el-dialog v-model="previewVisible" title="文档预览" width="800px">
      <div class="preview-content">
        <el-empty v-if="!previewUrl" description="该格式不支持预览" />
        <iframe v-else :src="previewUrl" width="100%" height="500px" frameborder="0" />
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownload(previewData)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document, Folder, Picture, Video, File } from '@element-plus/icons-vue'

const loading = ref(false)
const searchText = ref('')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const previewVisible = ref(false)
const previewData = ref(null)
const previewUrl = ref('')

const fileIcons = {
  pdf: { icon: Document, color: '#f56c6c' },
  doc: { icon: Document, color: '#409eff' },
  docx: { icon: Document, color: '#409eff' },
  xls: { icon: Document, color: '#67c23a' },
  xlsx: { icon: Document, color: '#67c23a' },
  ppt: { icon: Document, color: '#e6a23c' },
  pptx: { icon: Document, color: '#e6a23c' },
  jpg: { icon: Picture, color: '#909399' },
  png: { icon: Picture, color: '#909399' },
  mp4: { icon: Video, color: '#909399' }
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '公司管理制度.pdf', category: '管理制度', size: '2.5MB', uploader: '办公室', uploadTime: '2026-01-15 10:00', downloads: 120, type: 'pdf' },
      { id: 2, name: '技术架构设计.docx', category: '技术文档', size: '1.8MB', uploader: '技术部', uploadTime: '2026-01-14 09:00', downloads: 85, type: 'docx' },
      { id: 3, name: '财务报表.xlsx', category: '财务', size: '3.2MB', uploader: '财务部', uploadTime: '2026-01-13 14:30', downloads: 50, type: 'xlsx' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const getFileIcon = (type) => {
  return fileIcons[type.toLowerCase()] || { icon: File, color: '#909399' }
}

const handleUpload = () => {
  ElMessage.info('上传文档功能开发中')
}

const handlePreview = (row) => {
  previewData.value = row
  previewUrl.value = row.type === 'pdf' ? 'about:blank' : ''
  previewVisible.value = true
}

const handleDownload = (row) => {
  ElMessage.success(`下载：${row.name}`)
}

const handleDelete = (row) => {
  ElMessage.success('删除成功')
  loadData()
}
</script>

<style lang="scss" scoped>
.archive-page {
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

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .preview-content {
    iframe {
      border-radius: 4px;
    }
  }
}
</style>
