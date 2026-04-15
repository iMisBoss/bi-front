<template>
  <div class="preferences-page">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h2>系统偏好设置</h2>
          <el-tag type="info" size="small">自定义您的系统体验</el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="界面设置" name="interface">
          <div class="preference-section">
            <h4>主题设置</h4>
            <el-radio-group v-model="preferences.theme">
              <el-radio-button label="light">浅色模式</el-radio-button>
              <el-radio-button label="dark">深色模式</el-radio-button>
              <el-radio-button label="auto">跟随系统</el-radio-button>
            </el-radio-group>
          </div>

          <div class="preference-section">
            <h4>语言设置</h4>
            <el-select v-model="preferences.language" style="width: 200px">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </div>

          <div class="preference-section">
            <h4>字体大小</h4>
            <el-radio-group v-model="preferences.fontSize">
              <el-radio-button label="small">小</el-radio-button>
              <el-radio-button label="medium">中</el-radio-button>
              <el-radio-button label="large">大</el-radio-button>
            </el-radio-group>
          </div>

          <div class="preference-section">
            <h4>侧边栏布局</h4>
            <el-radio-group v-model="preferences.sidebarLayout">
              <el-radio-button label="vertical">垂直</el-radio-button>
              <el-radio-button label="horizontal">水平</el-radio-button>
            </el-radio-group>
          </div>
        </el-tab-pane>

        <el-tab-pane label="通知设置" name="notification">
          <div class="preference-section">
            <h4>站内消息</h4>
            <el-switch v-model="notifications.station" />
          </div>

          <div class="preference-section">
            <h4>邮件通知</h4>
            <el-switch v-model="notifications.email" />
          </div>

          <div class="preference-section">
            <h4>流程审批提醒</h4>
            <el-switch v-model="notifications.approval" />
          </div>

          <div class="preference-section">
            <h4>会议提醒</h4>
            <el-switch v-model="notifications.meeting" />
          </div>

          <div class="preference-section">
            <h4>公告通知</h4>
            <el-switch v-model="notifications.announcement" />
          </div>

          <div class="preference-section">
            <h4>声音提醒</h4>
            <el-switch v-model="notifications.sound" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="快捷操作" name="shortcuts">
          <div class="preference-section">
            <h4>首页快捷入口</h4>
            <el-checkbox-group v-model="shortcuts.homeQuickAccess">
              <el-checkbox label="待办审批">待办审批</el-checkbox>
              <el-checkbox label="发起流程">发起流程</el-checkbox>
              <el-checkbox label="会议预约">会议预约</el-checkbox>
              <el-checkbox label="内部邮件">内部邮件</el-checkbox>
              <el-checkbox label="公文起草">公文起草</el-checkbox>
              <el-checkbox label="通讯录">通讯录</el-checkbox>
            </el-checkbox-group>
          </div>

          <div class="preference-section">
            <h4>默认首页</h4>
            <el-select v-model="shortcuts.defaultPage" style="width: 200px">
              <el-option label="工作台" value="dashboard" />
              <el-option label="待办审批" value="todo" />
              <el-option label="我的邮件" value="email" />
            </el-select>
          </div>
        </el-tab-pane>

        <el-tab-pane label="数据设置" name="data">
          <div class="preference-section">
            <h4>表格默认分页</h4>
            <el-select v-model="dataSettings.pageSize" style="width: 150px">
              <el-option label="10条/页" :value="10" />
              <el-option label="20条/页" :value="20" />
              <el-option label="50条/页" :value="50" />
              <el-option label="100条/页" :value="100" />
            </el-select>
          </div>

          <div class="preference-section">
            <h4>自动保存草稿</h4>
            <el-switch v-model="dataSettings.autoSave" />
          </div>

          <div class="preference-section">
            <h4>草稿保存间隔</h4>
            <el-select v-model="dataSettings.autoSaveInterval" style="width: 150px">
              <el-option label="30秒" :value="30" />
              <el-option label="1分钟" :value="60" />
              <el-option label="3分钟" :value="180" />
              <el-option label="5分钟" :value="300" />
            </el-select>
          </div>

          <div class="preference-section">
            <h4>导出格式</h4>
            <el-radio-group v-model="dataSettings.exportFormat">
              <el-radio-button label="xlsx">Excel</el-radio-button>
              <el-radio-button label="csv">CSV</el-radio-button>
              <el-radio-button label="pdf">PDF</el-radio-button>
            </el-radio-group>
          </div>
        </el-tab-pane>
      </el-tabs>

      <div class="action-bar">
        <el-button type="primary" @click="handleSave" :loading="saving">保存设置</el-button>
        <el-button @click="handleReset">恢复默认</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('interface')
const saving = ref(false)

const preferences = reactive({
  theme: 'light',
  language: 'zh-CN',
  fontSize: 'medium',
  sidebarLayout: 'vertical'
})

const notifications = reactive({
  station: true,
  email: true,
  approval: true,
  meeting: true,
  announcement: true,
  sound: false
})

const shortcuts = reactive({
  homeQuickAccess: ['待办审批', '发起流程', '内部邮件'],
  defaultPage: 'dashboard'
})

const dataSettings = reactive({
  pageSize: 20,
  autoSave: true,
  autoSaveInterval: 60,
  exportFormat: 'xlsx'
})

const handleSave = () => {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    ElMessage.success('设置保存成功')
  }, 1000)
}

const handleReset = () => {
  preferences.theme = 'light'
  preferences.language = 'zh-CN'
  preferences.fontSize = 'medium'
  preferences.sidebarLayout = 'vertical'

  notifications.station = true
  notifications.email = true
  notifications.approval = true
  notifications.meeting = true
  notifications.announcement = true
  notifications.sound = false

  shortcuts.homeQuickAccess = ['待办审批', '发起流程', '内部邮件']
  shortcuts.defaultPage = 'dashboard'

  dataSettings.pageSize = 20
  dataSettings.autoSave = true
  dataSettings.autoSaveInterval = 60
  dataSettings.exportFormat = 'xlsx'

  ElMessage.success('已恢复默认设置')
}
</script>

<style scoped lang="scss">
.preferences-page {
  padding: 20px;

  .page-header {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }
  }

  .preference-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  .action-bar {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e4e7ed;
    display: flex;
    gap: 12px;
  }
}
</style>
