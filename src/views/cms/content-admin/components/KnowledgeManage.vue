<template>
  <div class="knowledge-manage">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button type="primary" @click="handleUpload" icon="Upload">上传文档</el-button>
          <el-button @click="handleBatchDownload" :disabled="selectedRows.length === 0">批量下载</el-button>
          <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">批量删除</el-button>
        </el-button-group>
      </div>
      <div class="toolbar-right">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索文档名称/标签"
            prefix-icon="Search"
            clearable
            style="width: 240px"
            @input="handleSearch"
        />
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 文件夹树 + 文档列表 -->
    <div class="content-wrapper">
      <!-- 左侧：文件夹树 -->
      <div class="folder-tree">
        <el-tree
            :data="folderData"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            @node-click="handleFolderClick"
        >
          <template #default="{ node, data }">
            <div class="folder-node">
              <el-icon class="folder-icon"><Folder /></el-icon>
              <span class="folder-name">{{ node.label }}</span>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 右侧：文档列表 -->
      <div class="document-list">
        <el-table
            :data="filteredDocuments"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
            :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="文档名称" min-width="250">
            <template #default="{ row }">
              <el-icon class="file-icon"><Document /></el-icon>
              <span>{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="format" label="格式" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small">{{ row.format }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="100" />
          <el-table-column prop="version" label="版本" width="80" align="center" />
          <el-table-column prop="downloadCount" label="下载量" width="100" align="center" />
          <el-table-column prop="tags" label="标签" width="150">
            <template #default="{ row }">
              <el-tag v-for="tag in row.tags" :key="tag" size="small" style="margin-right: 4px">{{ tag }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handlePreview(row)">预览</el-button>
              <el-button link type="primary" size="small" @click="handleDownload(row)">下载</el-button>
              <el-button link type="primary" size="small" @click="handleVersion(row)">版本</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-wrapper">
          <el-pagination
              :total="documentData.length"
              :page-size="10"
              layout="total, prev, pager, next"
          />
        </div>
      </div>
    </div>

    <!-- 上传对话框 -->
    <UploadDialog v-model="showUploadDialog" @confirm="handleConfirmUpload" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Folder, Document } from '@element-plus/icons-vue'
import UploadDialog from './UploadDialog.vue'

const props = defineProps({
  orgData: {
    type: Object,
    default: null
  }
})

const selectedRows = ref([])
const showUploadDialog = ref(false)
const searchKeyword = ref('')
const selectedFolder = ref(null)

const folderData = ref([
  { id: 1, name: '技术文档', children: [
      { id: 2, name: '前端开发', children: [] },
      { id: 3, name: '后端开发', children: [] }
    ]
  },
  { id: 4, name: '产品文档', children: [] },
  { id: 5, name: '财务文档', children: [] }
])

const documentData = ref([
  { id: 1, folderId: 1, name: '前端开发规范V3.0.pdf', format: 'PDF', size: '2.5MB', version: 'V3.0', tags: ['规范', '前端'], downloadCount: 156 },
  { id: 2, folderId: 1, name: 'API接口文档.docx', format: 'Word', size: '1.8MB', version: 'V2.1', tags: ['接口', 'API'], downloadCount: 234 },
  { id: 3, folderId: 2, name: 'Vue3实战指南.pdf', format: 'PDF', size: '5.2MB', version: 'V1.0', tags: ['Vue', '实战'], downloadCount: 89 },
  { id: 4, folderId: 4, name: '产品需求文档PRD.docx', format: 'Word', size: '3.1MB', version: 'V1.5', tags: ['PRD', '需求'], downloadCount: 67 },
  { id: 5, folderId: 5, name: '财务报表模板.xlsx', format: 'Excel', size: '800KB', version: 'V2.0', tags: ['财务', '模板'], downloadCount: 123 }
])

const filteredDocuments = computed(() => {
  let data = [...documentData.value]

  if (selectedFolder.value) {
    data = data.filter(doc => doc.folderId === selectedFolder.value.id)
  }

  if (searchKeyword.value) {
    data = data.filter(doc =>
        doc.name?.includes(searchKeyword.value) ||
        doc.tags?.some(tag => tag.includes(searchKeyword.value))
    )
  }

  return data
})

const handleFolderClick = (data) => {
  selectedFolder.value = data
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleUpload = () => {
  showUploadDialog.value = true
}

const handlePreview = (row) => {
  ElMessage.info(`预览文档：${row.name}`)
}

const handleDownload = (row) => {
  ElMessage.success(`下载文档：${row.name}`)
}

const handleVersion = (row) => {
  ElMessage.info(`查看版本：${row.name}`)
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除文档「${row.name}」吗？`, '删除文档', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    documentData.value = documentData.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchDownload = () => {
  ElMessage.success('批量下载成功')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm(`确定要删除 ${selectedRows.value.length} 个文档吗？`, '批量删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    documentData.value = documentData.value.filter(item => !ids.includes(item.id))
    ElMessage.success('批量删除成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleConfirmUpload = (formData) => {
  const newDoc = {
    id: Date.now(),
    folderId: selectedFolder.value?.id || 1,
    name: formData.fileName,
    format: formData.format,
    size: formData.size,
    version: 'V1.0',
    tags: formData.tags || [],
    downloadCount: 0
  }
  documentData.value.push(newDoc)
  ElMessage.success('上传成功')
  showUploadDialog.value = false
}

const handleRefresh = () => {
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}
</script>

<style lang="scss" scoped>
.knowledge-manage {
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

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .content-wrapper {
    display: flex;
    gap: 16px;
    flex: 1;
    overflow: hidden;

    .folder-tree {
      width: 240px;
      border-right: 1px solid #ebeef5;
      overflow-y: auto;
      padding-right: 16px;

      .folder-node {
        display: flex;
        align-items: center;
        gap: 8px;

        .folder-icon {
          color: #409eff;
        }
      }
    }

    .document-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;

      .file-icon {
        margin-right: 8px;
        color: #409eff;
      }
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
