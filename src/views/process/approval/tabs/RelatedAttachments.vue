<template>
  <div class="related-attachments">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流程附件</span>
          <el-tag type="info">{{ attachmentList.length }} 个文件</el-tag>
        </div>
      </template>

      <div v-if="attachmentList.length > 0" class="attachment-list">
        <div v-for="(file, index) in attachmentList" :key="index" class="attachment-item">
          <div class="attachment-info">
            <el-icon class="attachment-icon"><Document /></el-icon>
            <div class="attachment-details">
              <div class="attachment-name">{{ file.name }}</div>
              <div class="attachment-meta">
                <span class="attachment-size">{{ formatFileSize(file.size) }}</span>
                <span class="attachment-divider">|</span>
                <span class="attachment-uploader">上传人：{{ file.uploader }}</span>
                <span class="attachment-divider">|</span>
                <span class="attachment-time">{{ file.uploadTime }}</span>
              </div>
            </div>
          </div>
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
      </div>

      <div v-else class="no-attachment">
        <el-empty description="暂无流程附件" :image-size="120" />
      </div>
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
import { ref } from 'vue'
import { Document, View, Download } from '@element-plus/icons-vue'

// 支持预览的文件类型
const previewableTypes = ['pdf', 'image', 'jpg', 'jpeg', 'png', 'gif']

const previewVisible = ref(false)
const previewUrl = ref('')
const currentPreviewFile = ref(null)

// 模拟附件列表数据（实际应从 API 获取）
const attachmentList = ref([
  {
    name: '申请材料.pdf',
    url: 'https://example.com/file1.pdf',
    type: 'pdf',
    size: 1024 * 1024 * 2.5, // 2.5MB
    uploader: '张三',
    uploadTime: '2024-01-15 09:30:00'
  },
  {
    name: '证明文件.docx',
    url: 'https://example.com/file2.docx',
    type: 'docx',
    size: 1024 * 512, // 512KB
    uploader: '张三',
    uploadTime: '2024-01-15 09:35:00'
  },
  {
    name: '现场照片.jpg',
    url: 'https://example.com/file3.jpg',
    type: 'image',
    size: 1024 * 1024 * 3.2, // 3.2MB
    uploader: '李四',
    uploadTime: '2024-01-15 14:20:00'
  }
])

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
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
  const link = document.createElement('a')
  link.href = file.url
  link.download = file.name
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<style scoped lang="scss">
.related-attachments {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .attachment-list {
    width: 100%;

    .attachment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      transition: all 0.3s;

      &:hover {
        background-color: #ecf5ff;
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
      }

      .attachment-info {
        display: flex;
        align-items: center;
        flex: 1;
        gap: 12px;

        .attachment-icon {
          font-size: 28px;
          color: #409EFF;
        }

        .attachment-details {
          flex: 1;

          .attachment-name {
            font-size: 15px;
            color: #333;
            font-weight: 500;
            margin-bottom: 6px;
          }

          .attachment-meta {
            font-size: 13px;
            color: #909399;

            .attachment-size {
              margin-right: 8px;
            }

            .attachment-divider {
              margin: 0 8px;
              color: #dcdfe6;
            }

            .attachment-uploader,
            .attachment-time {
              margin-right: 8px;
            }
          }
        }
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
  }

  .no-attachment {
    display: flex;
    justify-content: center;
    padding: 60px 0;
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
