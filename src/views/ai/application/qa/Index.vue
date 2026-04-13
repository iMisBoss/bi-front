<template>
  <div class="ai-qa-page">
    <el-row :gutter="20">
      <el-col :span="16">
        <el-card class="chat-card">
          <template #header>
            <div class="card-header">
              <span>AI 智能问答</span>
              <el-button link type="primary" @click="clearChat">
                <el-icon><Delete /></el-icon>
                清空对话
              </el-button>
            </div>
          </template>

          <div class="chat-container" ref="chatContainer">
            <div v-for="(message, index) in messages" :key="index"
                 :class="['message', message.type]">
              <div class="message-avatar">
                <el-icon v-if="message.type === 'user'"><UserFilled /></el-icon>
                <el-icon v-else><ChatDotRound /></el-icon>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.text }}</div>
                <div class="message-time">{{ message.time }}</div>
              </div>
            </div>

            <div v-if="loading" class="message ai">
              <div class="message-avatar">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <div class="message-content">
                <el-skeleton :rows="2" animated />
              </div>
            </div>
          </div>

          <div class="input-area">
            <el-input
                v-model="inputText"
                type="textarea"
                :rows="3"
                placeholder="请输入您的问题，按 Enter 发送（Shift+Enter 换行）"
                @keydown.enter.exact.prevent="sendMessage"
            />
            <div class="input-actions">
              <el-button type="primary" @click="sendMessage" :loading="loading">
                发送
              </el-button>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="quick-questions-card">
          <template #header>
            <span>常见问题</span>
          </template>
          <el-space direction="vertical" style="width: 100%">
            <el-button
                v-for="(question, index) in quickQuestions"
                :key="index"
                text
                type="primary"
                @click="sendQuickQuestion(question)"
                style="width: 100%; text-align: left; justify-content: flex-start"
            >
              {{ question }}
            </el-button>
          </el-space>
        </el-card>

        <el-card class="ai-info-card" style="margin-top: 20px">
          <template #header>
            <span>AI 助手信息</span>
          </template>
          <el-descriptions :column="1" size="small">
            <el-descriptions-item label="模型">GPT-4</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag type="success">在线</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="响应时间">平均 2 秒</el-descriptions-item>
            <el-descriptions-item label="今日提问">
              {{ todayCount }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, ChatDotRound, Delete } from '@element-plus/icons-vue'

const chatContainer = ref(null)
const inputText = ref('')
const loading = ref(false)
const todayCount = ref(127)

const messages = ref([
  {
    type: 'ai',
    text: '您好！我是 AI 智能助手，很高兴为您服务。请问有什么可以帮助您的？',
    time: new Date().toLocaleTimeString()
  }
])

const quickQuestions = ref([
  '如何申请请假？',
  '会议预定流程是什么？',
  '如何查看工资条？',
  '年假怎么计算？',
  '出差报销标准是多少？'
])

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

const sendMessage = async () => {
  if (!inputText.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }

  const userMessage = {
    type: 'user',
    text: inputText.value,
    time: new Date().toLocaleTimeString()
  }

  messages.value.push(userMessage)
  const question = inputText.value
  inputText.value = ''
  scrollToBottom()

  loading.value = true

  try {
    // 模拟 AI 响应
    await new Promise(resolve => setTimeout(resolve, 1500))

    const aiResponse = {
      type: 'ai',
      text: getAIResponse(question),
      time: new Date().toLocaleTimeString()
    }

    messages.value.push(aiResponse)
    todayCount.value++
  } catch (error) {
    ElMessage.error('获取 AI 响应失败')
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const sendQuickQuestion = (question) => {
  inputText.value = question
  sendMessage()
}

const clearChat = () => {
  messages.value = [
    {
      type: 'ai',
      text: '对话已清空。您好！我是 AI 智能助手，很高兴为您服务。',
      time: new Date().toLocaleTimeString()
    }
  ]
  ElMessage.success('对话已清空')
}

// 简单的 AI 响应逻辑（实际应调用 AI API）
const getAIResponse = (question) => {
  const responses = {
    '请假': '请假流程：1. 登录 OA 系统 2. 进入"日常办公"->"请假休假" 3. 填写请假申请单 4. 提交审批。请假 3 天以内由部门经理审批，3 天以上需要总经理审批。',
    '会议': '会议预定流程：1. 进入"日常办公"->"会议管理" 2. 选择会议室和时间 3. 填写会议信息 4. 发送会议通知给参会人员。',
    '工资': '工资条查看：每月 10 日后可在"个人中心"->"工资条"查看电子工资条。如有疑问请联系财务部。',
    '年假': '年假计算：入职满 1 年享受 5 天年假，满 3 年 10 天，满 5 年 15 天。年假可拆分使用，需提前申请。',
    '出差': '出差报销标准：一线城市住宿标准 500 元/天，餐饮补助 100 元/天；其他城市住宿 350 元/天，餐饮补助 80 元/天。交通费实报实销。'
  }

  for (const [key, response] of Object.entries(responses)) {
    if (question.includes(key)) {
      return response
    }
  }

  return '感谢您的提问！这个问题我还需要学习，建议您咨询相关部门或查看公司规章制度。'
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style lang="scss" scoped>
.ai-qa-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .chat-card {
    height: calc(100vh - 160px);
    display: flex;
    flex-direction: column;

    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f5f7fa;

      .message {
        display: flex;
        margin-bottom: 20px;
        gap: 12px;

        &.user {
          flex-direction: row-reverse;

          .message-content {
            .message-text {
              background: #409eff;
              color: #fff;
            }
          }
        }

        &.ai {
          .message-avatar {
            .el-icon {
              color: #67c23a;
            }
          }

          .message-content {
            .message-text {
              background: #fff;
              color: #333;
            }
          }
        }

        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          .el-icon {
            font-size: 20px;
          }
        }

        .message-content {
          max-width: 600px;

          .message-text {
            padding: 12px 16px;
            border-radius: 8px;
            line-height: 1.6;
            word-wrap: break-word;
          }

          .message-time {
            margin-top: 6px;
            font-size: 12px;
            color: #999;
          }
        }
      }
    }

    .input-area {
      border-top: 1px solid #ebeef5;
      padding: 20px;

      .input-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
      }
    }
  }

  .quick-questions-card,
  .ai-info-card {
    height: auto;
  }
}
</style>
