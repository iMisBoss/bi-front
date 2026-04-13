<template>
  <div class="ai-writing-page">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="editor-card">
          <template #header>
            <div class="card-header">
              <span>智能写作</span>
              <div class="header-actions">
                <el-select v-model="documentType" placeholder="选择文档类型" style="width: 150px">
                  <el-option label="通知" value="notice" />
                  <el-option label="报告" value="report" />
                  <el-option label="总结" value="summary" />
                  <el-option label="邮件" value="email" />
                </el-select>
                <el-button type="primary" @click="generateContent" :loading="loading">
                  <el-icon><MagicStick /></el-icon>
                  AI 生成
                </el-button>
                <el-button @click="copyContent">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
              </div>
            </div>
          </template>

          <el-input
              v-model="content"
              type="textarea"
              :rows="20"
              placeholder="请输入写作要求或关键词，点击 AI 生成按钮自动生成内容..."
              class="content-editor"
          />

          <div class="word-count">
            字数：{{ wordCount }}
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="templates-card">
          <template #header>
            <span>常用模板</span>
          </template>
          <el-collapse accordion>
            <el-collapse-item title="会议通知" name="1">
              <div class="template-content" @click="useTemplate('meeting')">
                <p>【会议通知】</p>
                <p>时间：{{time}}</p>
                <p>地点：{{location}}</p>
                <p>参会人员：{{attendees}}</p>
                <p>议题：{{agenda}}</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="工作报告" name="2">
              <div class="template-content" @click="useTemplate('report')">
                <p>一、工作完成情况</p>
                <p>二、存在的问题</p>
                <p>三、下一步计划</p>
              </div>
            </el-collapse-item>
            <el-collapse-item title="请假申请" name="3">
              <div class="template-content" @click="useTemplate('leave')">
                <p>尊敬的领导：</p>
                <p>因{{reason}}，需请假{{days}}天。</p>
                <p>时间：{{date}}</p>
                <p>请批准。</p>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>

        <el-card class="ai-tools-card" style="margin-top: 20px">
          <template #header>
            <span>AI 工具</span>
          </template>
          <el-space direction="vertical" style="width: 100%">
            <el-button text type="primary" @click="optimizeText" style="width: 100%">
              <el-icon><Edit /></el-icon>
              优化润色
            </el-button>
            <el-button text type="primary" @click="expandText" style="width: 100%">
              <el-icon><FullScreen /></el-icon>
              内容扩写
            </el-button>
            <el-button text type="primary" @click="summarizeText" style="width: 100%">
              <el-icon><ScaleToOriginal /></el-icon>
              内容摘要
            </el-button>
            <el-button text type="primary" @click="checkGrammar" style="width: 100%">
              <el-icon><Checked /></el-icon>
              语法检查
            </el-button>
          </el-space>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { MagicStick, DocumentCopy, Edit, FullScreen, ScaleToOriginal, Checked } from '@element-plus/icons-vue'

const documentType = ref('notice')
const content = ref('')
const loading = ref(false)

const wordCount = computed(() => {
  return content.value.length
})

const generateContent = async () => {
  if (!content.value.trim()) {
    ElMessage.warning('请输入写作要求或关键词')
    return
  }

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    const templates = {
      notice: `【通知】\n\n各部门：\n\n根据工作安排，${content.value}。\n\n请相关人员做好准备，按时参加。\n\n特此通知。\n\n办公室\n${new Date().toLocaleDateString()}`,
      report: `工作报告\n\n一、工作背景\n${content.value}\n\n二、主要内容\n1. 已完成工作\n2. 进行中工作\n3. 计划工作\n\n三、存在问题\n\n四、下一步计划`,
      summary: `工作总结\n\n${content.value}\n\n主要成绩：\n1. \n2. \n3. \n\n经验教训：\n\n改进措施：`,
      email: `主题：${content.value}\n\n尊敬的同事：\n\n您好！\n\n${content.value}\n\n如有任何问题，请随时联系。\n\n此致\n敬礼`
    }

    content.value = templates[documentType.value] || content.value
    ElMessage.success('内容生成成功')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    loading.value = false
  }
}

const copyContent = () => {
  if (!content.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  navigator.clipboard.writeText(content.value)
  ElMessage.success('复制成功')
}

const useTemplate = (type) => {
  const templates = {
    meeting: `【会议通知】\n\n时间：2026 年 1 月 20 日 14:00\n地点：公司会议室\n参会人员：各部门负责人\n议题：年度工作总结及下年度计划\n\n请准时参加。`,
    report: `一、工作完成情况\n本月已完成以下工作：\n1. \n2. \n\n二、存在的问题\n1. \n\n三、下一步计划\n1. `,
    leave: `尊敬的领导：\n\n因个人原因，需请假 3 天。\n时间：2026 年 1 月 20 日至 1 月 22 日\n\n请批准。\n\n申请人：XXX`
  }

  content.value = templates[type]
  ElMessage.success('模板已插入')
}

const optimizeText = () => {
  if (!content.value) {
    ElMessage.warning('请输入要优化的内容')
    return
  }
  ElMessage.success('文本优化功能开发中')
}

const expandText = () => {
  if (!content.value) {
    ElMessage.warning('请输入要扩写的内容')
    return
  }
  ElMessage.success('内容扩写功能开发中')
}

const summarizeText = () => {
  if (!content.value) {
    ElMessage.warning('请输入要摘要的内容')
    return
  }
  ElMessage.success('内容摘要功能开发中')
}

const checkGrammar = () => {
  if (!content.value) {
    ElMessage.warning('请输入要检查的内容')
    return
  }
  ElMessage.success('语法检查功能开发中')
}
</script>

<style lang="scss" scoped>
.ai-writing-page {
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

  .editor-card {
    .content-editor {
      font-family: 'Microsoft YaHei', sans-serif;
      font-size: 14px;
      line-height: 1.8;
    }

    .word-count {
      margin-top: 10px;
      text-align: right;
      color: #999;
      font-size: 12px;
    }
  }

  .template-content {
    padding: 10px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s;

    &:hover {
      background: #f5f7fa;
    }

    p {
      margin: 5px 0;
      font-size: 13px;
      color: #606266;
    }
  }
}
</style>
