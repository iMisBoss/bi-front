<template>
  <div class="ai-summary-page">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="input-card">
          <template #header>
            <div class="card-header">
              <span>原文输入</span>
              <el-button type="primary" @click="handleSummarize" :loading="loading">
                <el-icon><Document /></el-icon>
                生成摘要
              </el-button>
            </div>
          </template>

          <el-input
              v-model="originalText"
              type="textarea"
              :rows="15"
              placeholder="请输入需要摘要的文档内容..."
          />

          <div class="file-upload">
            <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleFileChange"
                :limit="1"
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon>
                上传文档
              </el-button>
            </el-upload>
            <span class="tip">支持 Word、PDF、TXT 格式</span>
          </div>

          <div class="word-count">
            字数：{{ originalText.length }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="output-card">
          <template #header>
            <div class="card-header">
              <span>摘要结果</span>
              <div class="header-actions">
                <el-select v-model="summaryLength" placeholder="摘要长度" style="width: 100px">
                  <el-option label="简短" value="short" />
                  <el-option label="标准" value="normal" />
                  <el-option label="详细" value="long" />
                </el-select>
                <el-button @click="copySummary" :disabled="!summary">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="summary" class="summary-content">
            <el-alert
                title="摘要要点"
                type="success"
                :closable="false"
                show-icon
                style="margin-bottom: 15px"
            >
              <div v-for="(point, index) in keyPoints" :key="index" class="key-point">
                {{ index + 1 }}. {{ point }}
              </div>
            </el-alert>

            <div class="summary-text">{{ summary }}</div>

            <el-divider />

            <div class="summary-meta">
              <el-tag size="small" type="info">
                压缩率：{{ compressionRate }}
              </el-tag>
              <el-tag size="small" type="primary" style="margin-left: 10px">
                生成时间：{{ generateTime }}
              </el-tag>
            </div>
          </div>

          <el-empty v-else description="请输入文档内容后点击生成摘要" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, DocumentCopy, Upload } from '@element-plus/icons-vue'

const originalText = ref('')
const summary = ref('')
const loading = ref(false)
const summaryLength = ref('normal')
const keyPoints = ref([])
const generateTime = ref('')

const compressionRate = computed(() => {
  if (!originalText.value || !summary.value) return '0%'
  const rate = ((1 - summary.value.length / originalText.value.length) * 100).toFixed(1)
  return `${rate}%`
})

const handleSummarize = async () => {
  if (!originalText.value.trim()) {
    ElMessage.warning('请输入需要摘要的内容')
    return
  }

  if (originalText.value.length < 50) {
    ElMessage.warning('内容太短，无需摘要')
    return
  }

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟摘要生成
    const sentences = originalText.value.split(/[.!?。！？]/).filter(s => s.trim())
    const summarySentences = sentences.slice(0, Math.ceil(sentences.length * 0.3))

    summary.value = summarySentences.join('. ') + '.'
    keyPoints.value = extractKeyPoints(summary.value)
    generateTime.value = new Date().toLocaleTimeString()

    ElMessage.success('摘要生成成功')
  } catch (error) {
    ElMessage.error('生成摘要失败')
  } finally {
    loading.value = false
  }
}

const extractKeyPoints = (text) => {
  const sentences = text.split(/[.!?。！？]/).filter(s => s.trim())
  return sentences.slice(0, 3).map(s => s.trim())
}

const copySummary = () => {
  if (!summary.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(summary.value)
  ElMessage.success('复制成功')
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    originalText.value = e.target.result
    ElMessage.success('文件读取成功')
  }
  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }
  reader.readAsText(file.raw)
}
</script>

<style lang="scss" scoped>
.ai-summary-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }

  .input-card {
    .file-upload {
      margin-top: 15px;
      display: flex;
      align-items: center;
      gap: 10px;

      .tip {
        font-size: 12px;
        color: #999;
      }
    }

    .word-count {
      margin-top: 10px;
      text-align: right;
      color: #999;
      font-size: 12px;
    }
  }

  .output-card {
    .summary-content {
      .key-point {
        padding: 5px 0;
        font-size: 14px;
        line-height: 1.6;
      }

      .summary-text {
        line-height: 1.8;
        color: #333;
        white-space: pre-wrap;
      }

      .summary-meta {
        margin-top: 15px;
      }
    }
  }
}
</style>
