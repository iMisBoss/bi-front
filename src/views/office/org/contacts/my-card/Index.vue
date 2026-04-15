<template>
  <div class="my-card-container">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <div class="header-left">
            <h2>个人名片维护</h2>
            <el-tag type="info" size="small">仅可维护个人公开信息</el-tag>
          </div>
          <div class="header-actions">
            <el-button @click="handleReset">重置</el-button>
            <el-button
                v-if="approvalEnabled && hasChanges"
                type="warning"
                @click="handleSubmitApproval"
            >
              提交审核
            </el-button>
            <el-button
                type="primary"
                :loading="saving"
                @click="handleSave"
            >
              {{ approvalEnabled ? '保存草稿' : '保存' }}
            </el-button>
            <el-button link type="primary" @click="scrollToPreview">
              <el-icon><View /></el-icon>
              预览名片
            </el-button>
            <el-button link type="primary" @click="showHistory = true">
              <el-icon><Clock /></el-icon>
              修改记录
            </el-button>
          </div>
        </div>
      </template>

      <div class="card-content">
        <div class="left-tabs">
          <el-tabs v-model="activeTab" tab-position="left" class="tab-panel">
            <el-tab-pane label="基础信息" name="basic">
              <BasicInfoTab
                  ref="basicInfoRef"
                  :user-data="userData"
                  :readonly-fields="readonlyFields"
                  @update:avatar="handleAvatarUpdate"
              />
            </el-tab-pane>
            <el-tab-pane label="联系信息" name="contact">
              <ContactInfoTab
                  ref="contactInfoRef"
                  :user-data="userData"
                  :approval-enabled="approvalEnabled"
                  @change="hasChanges = true"
              />
            </el-tab-pane>
            <el-tab-pane label="展示设置" name="display">
              <DisplaySettingsTab
                  ref="displaySettingsRef"
                  :privacy-settings="privacySettings"
                  @change="hasChanges = true"
              />
            </el-tab-pane>
            <el-tab-pane label="电子名片" name="card">
              <ElectronicCardTab
                  ref="electronicCardRef"
                  :user-data="userData"
                  :privacy-settings="privacySettings"
              />
            </el-tab-pane>
          </el-tabs>
        </div>

        <div class="right-preview" id="previewSection">
          <div class="preview-header">
            <h3>名片实时预览</h3>
            <el-tag type="success" size="small">所见即所得</el-tag>
          </div>
          <CardPreview
              :user-data="userData"
              :privacy-settings="privacySettings"
          />
          <div class="preview-tips">
            <el-alert
                title="隐私提示"
                type="info"
                :closable="false"
                show-icon
            >
              <p>• 带 * 号字段为脱敏显示</p>
              <p>• 实际展示效果以通讯录为准</p>
            </el-alert>
          </div>
        </div>
      </div>

      <div class="footer-info">
        <el-divider />
        <div class="footer-content">
          <span class="last-update">最后更新：{{ lastUpdateTime }}</span>
          <el-link type="primary" @click="showHistory = true">查看完整修改记录</el-link>
        </div>
      </div>
    </el-card>

    <ModificationHistory v-model="showHistory" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Clock } from '@element-plus/icons-vue'
import BasicInfoTab from './components/BasicInfoTab.vue'
import ContactInfoTab from './components/ContactInfoTab.vue'
import DisplaySettingsTab from './components/DisplaySettingsTab.vue'
import ElectronicCardTab from './components/ElectronicCardTab.vue'
import CardPreview from './components/CardPreview.vue'
import ModificationHistory from './components/ModificationHistory.vue'

const activeTab = ref('basic')
const saving = ref(false)
const hasChanges = ref(false)
const showHistory = ref(false)
const lastUpdateTime = ref('2024-01-15 10:30:00')
const approvalEnabled = ref(true)

const basicInfoRef = ref(null)
const contactInfoRef = ref(null)
const displaySettingsRef = ref(null)
const electronicCardRef = ref(null)

const userData = reactive({
  avatar: '',
  name: '张三',
  employeeNo: 'EMP001',
  department: '技术研发部',
  position: '高级开发工程师',
  reportTo: '李四（技术总监）',
  joinDate: '2020-03-15',
  signature: '专注OA系统开发',
  responsibilities: '负责OA系统前端架构设计与开发',
  officePhone: '010-88888888',
  email: 'zhangsan@company.com',
  mobile: '13800138000',
  workstation: 'A座5层-508-12号',
  emergencyContact: '张父 13900139000',
  backupEmail: 'zhangsan@gmail.com'
})

const readonlyFields = [
  'name',
  'employeeNo',
  'department',
  'position',
  'reportTo',
  'joinDate',
  'email'
]

const privacySettings = reactive({
  visibilityRange: 'all',
  showMobile: true,
  showWorkstation: true,
  showSignature: true,
  showResponsibilities: true,
  showReportTo: false
})

const handleAvatarUpdate = (avatarUrl) => {
  userData.avatar = avatarUrl
  hasChanges.value = true
}

const handleSave = async () => {
  try {
    saving.value = true

    const formData = {
      ...userData,
      privacySettings: { ...privacySettings }
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    if (approvalEnabled.value) {
      ElMessage.success('草稿已保存')
    } else {
      ElMessage.success('保存成功，已同步至通讯录')
      hasChanges.value = false
      lastUpdateTime.value = new Date().toLocaleString('zh-CN')
    }
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  } finally {
    saving.value = false
  }
}

const handleSubmitApproval = async () => {
  try {
    await ElMessageBox.confirm(
        '提交后将由部门负责人审批，审批通过后生效。确认提交？',
        '提交审核',
        {
          confirmButtonText: '确认提交',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('已提交审核，请等待审批')
    hasChanges.value = false
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败：' + error.message)
    }
  }
}

const handleReset = () => {
  ElMessageBox.confirm(
      '确定要重置所有未保存的修改吗？',
      '重置确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    location.reload()
  }).catch(() => {})
}

const scrollToPreview = () => {
  document.getElementById('previewSection')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
}

onMounted(() => {
  loadUserData()
})

const loadUserData = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500))
  } catch (error) {
    ElMessage.error('加载数据失败')
  }
}
</script>

<style scoped lang="scss">
.my-card-container {
  padding: 20px;
  height: calc(100vh - 60px);
  overflow-y: auto;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      h2 {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
      }
    }

    .header-actions {
      display: flex;
      gap: 12px;
      align-items: center;
    }
  }

  .card-content {
    display: flex;
    gap: 20px;
    min-height: 600px;

    .left-tabs {
      flex: 1;

      .tab-panel {
        :deep(.el-tabs__content) {
          padding: 20px;
          min-height: 500px;
        }
      }
    }

    .right-preview {
      width: 380px;
      flex-shrink: 0;
      position: sticky;
      top: 20px;
      height: fit-content;

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
      }

      .preview-tips {
        margin-top: 16px;

        :deep(.el-alert__content) {
          p {
            margin: 4px 0;
            font-size: 12px;
            line-height: 1.5;
          }
        }
      }
    }
  }

  .footer-info {
    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: #909399;

      .last-update {
        color: #606266;
      }
    }
  }
}

@media (max-width: 1200px) {
  .my-card-container {
    .card-content {
      flex-direction: column;

      .right-preview {
        width: 100%;
        position: static;
      }
    }
  }
}
</style>
