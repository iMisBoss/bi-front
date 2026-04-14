<template>
  <div class="approval-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>基本信息</span>
        </div>
      </template>
      <el-form :model="formData" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请人">
              <el-input v-model="formData.applicant" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请部门">
              <el-input v-model="formData.department" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="申请时间">
              <el-input v-model="formData.applyTime" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="紧急程度">
              <el-tag :type="getPriorityType(formData.priority)">
                {{ getPriorityText(formData.priority) }}
              </el-tag>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="审批标题">
          <el-input v-model="formData.title" :rows="2" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="申请内容">
          <el-input v-model="formData.content" :rows="6" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="附件">
          <div class="attachment-list">
            <div v-for="(file, index) in fileList" :key="index" class="attachment-item">
              <el-icon class="attachment-icon"><Document /></el-icon>
              <span class="attachment-name">{{ file.name }}</span>
              <div class="attachment-actions">
                <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handlePreview(file)"
                    :disabled="!canPreview(file)"
                >
                  <el-icon><View /></el-icon>
                  预览
                </el-button>
                <el-button
                    type="primary"
                    link
                    size="small"
                    @click="handleDownload(file)"
                >
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </div>
            </div>
            <div v-if="fileList.length === 0" class="no-attachment">
              <el-empty description="暂无附件" :image-size="80" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="formData.remark" :rows="2" type="textarea" disabled />
        </el-form-item>
      </el-form>
    </el-card>

    <el-card style="margin-top: 20px">
      <template #header>
        <div class="card-header">
          <span>审批意见</span>
        </div>
      </template>
      <el-form>
        <el-form-item label="审批意见">
          <el-input
              v-model="approvalOpinion"
              :rows="4"
              type="textarea"
              placeholder="请输入审批意见"
          />
        </el-form-item>
        <el-form-item label="附件上传">
          <el-upload
              action="#"
              :limit="5"
              multiple
          >
            <el-button type="primary">上传附件</el-button>
            <template #tip>
              <div class="el-upload__tip">最多上传 5 个文件</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 预览对话框 -->
    <el-dialog
        v-model="previewVisible"
        title="文件预览"
        width="80%"
        :close-on-click-modal="false"
    >
      <div class="preview-content">
        <iframe
            v-if="previewUrl"
            :src="previewUrl"
            width="100%"
            height="600px"
            frameborder="0"
        ></iframe>
        <div v-else class="preview-not-supported">
          <el-result icon="warning" title="该格式不支持预览">
            <template #sub-title>
              请下载后查看
            </template>
          </el-result>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleDownload(currentPreviewFile)">下载</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Document, View, Download } from '@element-plus/icons-vue'

const formData = reactive({
  applicant: '张三',
  department: '信息技术部',
  applyTime: '2026-01-15 09:30:00',
  priority: 'medium',
  title: '关于购买办公用品的申请',
  content: '因部门工作需要，现申请购买一批办公用品，包括：笔记本、签字笔、文件夹等，预计费用 500 元。',
  remark: '无'
})

const approvalOpinion = ref('')
const fileList = ref([
  { name: '附件 1.pdf', url: 'https://example.com/file1.pdf', type: 'pdf' },
  { name: '附件 2.docx', url: 'https://example.com/file2.docx', type: 'docx' },
  { name: '附件 3.xlsx', url: 'https://example.com/file3.xlsx', type: 'xlsx' },
  { name: '附件 4.jpg', url: 'https://example.com/file4.jpg', type: 'image' }
])

// 支持预览的文件类型
const previewableTypes = ['pdf', 'image', 'jpg', 'jpeg', 'png', 'gif']

const previewVisible = ref(false)
const previewUrl = ref('')
const currentPreviewFile = ref(null)

const getPriorityType = (priority) => {
  const map = {
    'low': 'info',
    'medium': 'warning',
    'high': 'danger'
  }
  return map[priority] || 'info'
}

const getPriorityText = (priority) => {
  const map = {
    'low': '普通',
    'medium': '紧急',
    'high': '特急'
  }
  return map[priority] || '普通'
}

// 判断是否可以预览
const canPreview = (file) => {
  if (!file.type) return false
  const fileType = file.type.toLowerCase()
  return previewableTypes.some(type => fileType.includes(type))
}

// 处理预览
const handlePreview = (file) => {
  currentPreviewFile.value = file
  previewUrl.value = file.url
  previewVisible.value = true
}

// 处理下载
const handleDownload = (file) => {
  // 创建临时链接触发下载
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // 或者使用新的方式（如果后端支持）
  // window.open(file.url, '_blank')
}
</script>

<style scoped lang="scss">
.approval-form {
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

  .attachment-list {
    width: 100%;

    .attachment-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin-bottom: 8px;
      background-color: #f5f7fa;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
      }

      .attachment-icon {
        font-size: 20px;
        color: #409EFF;
        margin-right: 12px;
      }

      .attachment-name {
        flex: 1;
        font-size: 14px;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .attachment-actions {
        display: flex;
        gap: 12px;

        .el-button {
          display: flex;
          align-items: center;
          gap: 4px;

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
      }
    }

    .no-attachment {
      display: flex;
      justify-content: center;
      padding: 20px 0;
    }
  }

  .preview-content {
    width: 100%;
    min-height: 600px;
    background-color: #f5f5f5;
    border-radius: 4px;

    iframe {
      border-radius: 4px;
    }

    .preview-not-supported {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 600px;
    }
  }
}
</style>
