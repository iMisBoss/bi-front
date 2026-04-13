<template>
  <div class="ai-meeting-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>AI 会议纪要</span>
              <el-button type="primary" @click="generateMinutes" :loading="loading">
                <el-icon><VideoCamera /></el-icon>
                生成纪要
              </el-button>
            </div>
          </template>

          <el-form :model="meetingForm" label-width="100px">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="会议主题">
                  <el-input v-model="meetingForm.subject" placeholder="请输入会议主题" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="会议时间">
                  <el-date-picker
                      v-model="meetingForm.time"
                      type="datetime"
                      placeholder="选择日期时间"
                      style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="会议地点">
                  <el-input v-model="meetingForm.location" placeholder="请输入会议地点" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="参会人员">
                  <el-select
                      v-model="meetingForm.attendees"
                      multiple
                      placeholder="请选择参会人员"
                      style="width: 100%"
                  >
                    <el-option label="张三" value="张三" />
                    <el-option label="李四" value="李四" />
                    <el-option label="王五" value="王五" />
                    <el-option label="赵六" value="赵六" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="主持人">
                  <el-input v-model="meetingForm.host" placeholder="请输入主持人" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="会议内容">
              <el-input
                  v-model="meetingForm.content"
                  type="textarea"
                  :rows="8"
                  placeholder="请输入会议讨论内容或上传录音文件..."
              />
            </el-form-item>

            <el-form-item label="附件">
              <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handleFileChange"
                  :limit="3"
              >
                <el-button type="primary">
                  <el-icon><Upload /></el-icon>
                  上传录音/文件
                </el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    支持 mp3、wav、doc、pdf 格式文件
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="24" v-if="generatedMinutes">
        <el-card class="result-card">
          <template #header>
            <div class="card-header">
              <span>生成的会议纪要</span>
              <div class="header-actions">
                <el-button @click="copyMinutes">
                  <el-icon><DocumentCopy /></el-icon>
                  复制
                </el-button>
                <el-button type="success" @click="exportMinutes">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
          </template>

          <div class="minutes-content">
            <h2 class="minutes-title">{{ meetingForm.subject }} - 会议纪要</h2>

            <div class="minutes-meta">
              <p><strong>时间：</strong>{{ formatTime(meetingForm.time) }}</p>
              <p><strong>地点：</strong>{{ meetingForm.location }}</p>
              <p><strong>主持：</strong>{{ meetingForm.host }}</p>
              <p><strong>参会：</strong>{{ meetingForm.attendees.join('、') }}</p>
            </div>

            <el-divider />

            <div class="minutes-body">
              <h3>一、会议主要内容</h3>
              <div class="content-text">{{ generatedMinutes.summary }}</div>

              <h3>二、决议事项</h3>
              <el-table :data="generatedMinutes.decisions" border style="margin-top: 10px">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="item" label="事项" />
                <el-table-column prop="responsible" label="责任人" width="120" />
                <el-table-column prop="deadline" label="截止时间" width="120" />
              </el-table>

              <h3>三、待办任务</h3>
              <el-table :data="generatedMinutes.tasks" border style="margin-top: 10px">
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="task" label="任务" />
                <el-table-column prop="assignee" label="负责人" width="120" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '已完成' ? 'success' : 'warning'" size="small">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="minutes-footer">
              <p>纪要整理：AI 助手</p>
              <p>生成时间：{{ generatedTime }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoCamera, DocumentCopy, Download, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const generatedMinutes = ref(null)
const generatedTime = ref('')

const meetingForm = reactive({
  subject: '',
  time: null,
  location: '',
  host: '',
  attendees: [],
  content: ''
})

const generateMinutes = async () => {
  if (!meetingForm.subject) {
    ElMessage.warning('请输入会议主题')
    return
  }

  if (!meetingForm.content.trim()) {
    ElMessage.warning('请输入会议内容')
    return
  }

  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 模拟生成会议纪要
    generatedMinutes.value = {
      summary: meetingForm.content.substring(0, 200) + '...（会议主要讨论了相关工作安排和部署，明确了各部门职责和任务分工。）',
      decisions: [
        { id: 1, item: '完成年度工作总结', responsible: '各部门负责人', deadline: '2026-01-31' },
        { id: 2, item: '制定下年度工作计划', responsible: '各部门负责人', deadline: '2026-02-15' },
        { id: 3, item: '优化工作流程', responsible: '办公室', deadline: '2026-02-28' }
      ],
      tasks: [
        { id: 1, task: '准备会议材料', assignee: '张三', status: '已完成' },
        { id: 2, task: '整理会议记录', assignee: '李四', status: '进行中' },
        { id: 3, task: '跟进决议事项', assignee: '王五', status: '未开始' }
      ]
    }

    generatedTime.value = new Date().toLocaleString()
    ElMessage.success('会议纪要生成成功')
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const copyMinutes = () => {
  if (!generatedMinutes.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  const text = `
${meetingForm.subject} - 会议纪要

时间：${formatTime(meetingForm.time)}
地点：${meetingForm.location}
主持：${meetingForm.host}
参会：${meetingForm.attendees.join('、')}

一、会议主要内容
${generatedMinutes.value.summary}

二、决议事项
${generatedMinutes.value.decisions.map(d => `${d.item}（责任人：${d.responsible}，截止时间：${d.deadline}）`).join('\n')}

三、待办任务
${generatedMinutes.value.tasks.map(t => `${t.task}（负责人：${t.assignee}，状态：${t.status}）`).join('\n')}

生成时间：${generatedTime.value}
  `.trim()

  navigator.clipboard.writeText(text)
  ElMessage.success('复制成功')
}

const exportMinutes = () => {
  ElMessage.success('导出功能开发中')
}

const handleFileChange = (file) => {
  ElMessage.success(`已选择文件：${file.name}`)
}
</script>

<style lang="scss" scoped>
.ai-meeting-page {
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

  .result-card {
    margin-top: 20px;

    .minutes-content {
      padding: 20px;

      .minutes-title {
        text-align: center;
        font-size: 20px;
        color: #333;
        margin-bottom: 20px;
      }

      .minutes-meta {
        p {
          margin: 8px 0;
          color: #606266;
          line-height: 1.6;
        }
      }

      .minutes-body {
        h3 {
          font-size: 16px;
          color: #333;
          margin: 20px 0 10px;
          padding-left: 10px;
          border-left: 3px solid #409eff;
        }

        .content-text {
          line-height: 1.8;
          color: #606266;
          white-space: pre-wrap;
        }
      }

      .minutes-footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ebeef5;
        text-align: right;
        color: #999;
        font-size: 13px;

        p {
          margin: 5px 0;
        }
      }
    }
  }
}
</style>
