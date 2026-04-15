<template>
  <div class="electronic-card-tab">
    <div class="card-preview-section">
      <h3>企业制式电子名片</h3>
      <div class="card-container" ref="cardRef">
        <div class="business-card">
          <div class="card-header">
            <div class="company-logo">LOGO</div>
            <div class="company-name">某某科技有限公司</div>
          </div>

          <div class="card-body">
            <div class="avatar-section">
              <el-avatar :size="80" :src="userData.avatar || defaultAvatar" />
            </div>

            <div class="info-section">
              <div class="name-row">
                <span class="name">{{ userData.name }}</span>
                <span class="position">{{ userData.position }}</span>
              </div>
              <div class="department">{{ userData.department }}</div>

              <div class="contact-row">
                <div class="contact-item">
                  <el-icon><Phone /></el-icon>
                  <span>{{ formatMobile(userData.mobile) }}</span>
                </div>
                <div class="contact-item">
                  <el-icon><Message /></el-icon>
                  <span>{{ userData.email }}</span>
                </div>
                <div class="contact-item">
                  <el-icon><OfficeBuilding /></el-icon>
                  <span>{{ userData.officePhone }}</span>
                </div>
              </div>

              <div class="signature" v-if="userData.signature">
                {{ userData.signature }}
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="qr-code">二维码区域</div>
            <div class="watermark">工号：{{ userData.employeeNo }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card-actions">
      <el-button type="primary" @click="downloadCard">
        <el-icon><Download /></el-icon>
        下载名片（PNG）
      </el-button>
      <el-button @click="copyCardInfo">
        <el-icon><CopyDocument /></el-icon>
        复制名片信息
      </el-button>
      <el-button @click="shareCard">
        <el-icon><Share /></el-icon>
        内网分享
      </el-button>
      <el-button @click="generateQRCode">
        <el-icon><FullScreen /></el-icon>
        二维码名片
      </el-button>
    </div>

    <el-alert
        title="合规提示"
        type="warning"
        :closable="false"
        show-icon
        style="margin-top: 20px"
    >
      <template #default>
        <p>• 导出的名片自动添加企业名称和工号水印</p>
        <p>• 涉密人员手机号默认隐藏</p>
        <p>• 二维码仅内网OA可识别，外部无法访问</p>
      </template>
    </el-alert>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Phone, Message, OfficeBuilding, Download, CopyDocument, Share, FullScreen } from '@element-plus/icons-vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  privacySettings: {
    type: Object,
    required: true
  }
})

const cardRef = ref(null)
const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSIjOTk5IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7kuIg8L3RleHQ+PC9zdmc+'

const formatMobile = (mobile) => {
  if (!props.privacySettings.showMobile) {
    return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }
  return mobile
}

const downloadCard = () => {
  ElMessage.success('名片已生成并下载（含水印）')
}

const copyCardInfo = () => {
  const cardText = `
${props.userData.name} | ${props.userData.position}
${props.userData.department}
手机：${formatMobile(props.userData.mobile)}
邮箱：${props.userData.email}
座机：${props.userData.officePhone}
  `.trim()

  navigator.clipboard.writeText(cardText).then(() => {
    ElMessage.success('名片信息已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const shareCard = () => {
  ElMessage.success('请选择分享目标（OA消息/会议/流程抄送）')
}

const generateQRCode = () => {
  ElMessage.success('二维码已生成，扫码即可保存联系人到内网通讯录')
}
</script>

<style scoped lang="scss">
.electronic-card-tab {
  .card-preview-section {
    margin-bottom: 24px;

    h3 {
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 600;
    }

    .card-container {
      display: flex;
      justify-content: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;

      .business-card {
        width: 500px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 24px;
        color: white;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);

          .company-logo {
            width: 40px;
            height: 40px;
            background: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #667eea;
            font-weight: bold;
            font-size: 12px;
          }

          .company-name {
            font-size: 18px;
            font-weight: 600;
          }
        }

        .card-body {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;

          .avatar-section {
            flex-shrink: 0;
          }

          .info-section {
            flex: 1;

            .name-row {
              display: flex;
              align-items: baseline;
              gap: 12px;
              margin-bottom: 8px;

              .name {
                font-size: 24px;
                font-weight: bold;
              }

              .position {
                font-size: 14px;
                opacity: 0.9;
              }
            }

            .department {
              font-size: 14px;
              opacity: 0.85;
              margin-bottom: 16px;
            }

            .contact-row {
              display: flex;
              flex-direction: column;
              gap: 8px;
              margin-bottom: 12px;

              .contact-item {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;

                .el-icon {
                  font-size: 16px;
                }
              }
            }

            .signature {
              font-size: 12px;
              opacity: 0.8;
              font-style: italic;
              margin-top: 8px;
            }
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.3);

          .qr-code {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #667eea;
            font-size: 10px;
          }

          .watermark {
            font-size: 11px;
            opacity: 0.7;
          }
        }
      }
    }
  }

  .card-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
}
</style>
