<template>
  <div class="config-container">
    <el-tabs v-model="activeTab" type="border-card">
      <el-tab-pane label="基础配置" name="basic">
        <el-form :model="basicConfig" label-width="150px" style="max-width: 600px">
          <el-form-item label="系统名称">
            <el-input v-model="basicConfig.systemName" />
          </el-form-item>
          <el-form-item label="系统 Logo">
            <el-upload
                class="logo-uploader"
                action="/api/upload"
                :show-file-list="false"
                :on-success="handleLogoSuccess"
            >
              <el-image
                  v-if="basicConfig.logo"
                  :src="basicConfig.logo"
                  style="width: 100px; height: 100px"
              />
              <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item label="会话超时时间">
            <el-input-number v-model="basicConfig.sessionTimeout" :min="5" :max="120" />
            <span style="margin-left: 10px">分钟</span>
          </el-form-item>
          <el-form-item label="密码策略">
            <el-select v-model="basicConfig.passwordPolicy">
              <el-option label="简单" value="simple" />
              <el-option label="中等" value="medium" />
              <el-option label="复杂" value="complex" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBasicConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="邮件配置" name="email">
        <el-form :model="emailConfig" label-width="150px" style="max-width: 600px">
          <el-form-item label="SMTP 服务器">
            <el-input v-model="emailConfig.smtpHost" placeholder="smtp.example.com" />
          </el-form-item>
          <el-form-item label="SMTP 端口">
            <el-input-number v-model="emailConfig.smtpPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="发件人邮箱">
            <el-input v-model="emailConfig.senderEmail" placeholder="noreply@example.com" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="emailConfig.username" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="emailConfig.password" type="password" show-password />
          </el-form-item>
          <el-form-item label="启用 SSL">
            <el-switch v-model="emailConfig.useSsl" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="testEmailConfig">测试连接</el-button>
            <el-button type="success" @click="saveEmailConfig" style="margin-left: 10px">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="存储配置" name="storage">
        <el-form :model="storageConfig" label-width="150px" style="max-width: 600px">
          <el-form-item label="存储方式">
            <el-radio-group v-model="storageConfig.type">
              <el-radio label="local">本地存储</el-radio>
              <el-radio label="oss">OSS 存储</el-radio>
              <el-radio label="s3">S3 存储</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="storageConfig.type !== 'local'">
            <el-form-item label="Access Key">
              <el-input v-model="storageConfig.accessKey" />
            </el-form-item>
            <el-form-item label="Secret Key">
              <el-input v-model="storageConfig.secretKey" type="password" show-password />
            </el-form-item>
            <el-form-item label="Bucket">
              <el-input v-model="storageConfig.bucket" />
            </el-form-item>
            <el-form-item label="Endpoint">
              <el-input v-model="storageConfig.endpoint" />
            </el-form-item>
          </template>
          <el-form-item v-else label="存储路径">
            <el-input v-model="storageConfig.localPath" placeholder="/data/uploads" />
          </el-form-item>
          <el-form-item label="文件大小限制">
            <el-input-number v-model="storageConfig.maxSize" :min="1" :max="1024" />
            <span style="margin-left: 10px">MB</span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveStorageConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="安全配置" name="security">
        <el-form :model="securityConfig" label-width="150px" style="max-width: 600px">
          <el-form-item label="启用验证码">
            <el-switch v-model="securityConfig.enableCaptcha" />
          </el-form-item>
          <el-form-item label="登录失败锁定">
            <el-switch v-model="securityConfig.enableLock" />
          </el-form-item>
          <el-form-item label="最大尝试次数" v-if="securityConfig.enableLock">
            <el-input-number v-model="securityConfig.maxAttempts" :min="3" :max="10" />
          </el-form-item>
          <el-form-item label="锁定时长" v-if="securityConfig.enableLock">
            <el-input-number v-model="securityConfig.lockDuration" :min="5" :max="60" />
            <span style="margin-left: 10px">分钟</span>
          </el-form-item>
          <el-form-item label="启用 IP 白名单">
            <el-switch v-model="securityConfig.enableIpWhitelist" />
          </el-form-item>
          <el-form-item label="白名单 IP" v-if="securityConfig.enableIpWhitelist">
            <el-input
                v-model="securityConfig.ipWhitelist"
                type="textarea"
                :rows="4"
                placeholder="每行一个 IP 地址"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSecurityConfig">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const activeTab = ref('basic')

const basicConfig = reactive({
  systemName: '企业管理系统',
  logo: '',
  sessionTimeout: 30,
  passwordPolicy: 'medium'
})

const emailConfig = reactive({
  smtpHost: 'smtp.qq.com',
  smtpPort: 465,
  senderEmail: 'noreply@example.com',
  username: '',
  password: '',
  useSsl: true
})

const storageConfig = reactive({
  type: 'local',
  accessKey: '',
  secretKey: '',
  bucket: '',
  endpoint: '',
  localPath: '/data/uploads',
  maxSize: 50
})

const securityConfig = reactive({
  enableCaptcha: true,
  enableLock: true,
  maxAttempts: 5,
  lockDuration: 15,
  enableIpWhitelist: false,
  ipWhitelist: ''
})

const handleLogoSuccess = (response) => {
  basicConfig.logo = response.url
  ElMessage.success('Logo 上传成功')
}

const saveBasicConfig = () => {
  ElMessage.success('基础配置保存成功')
}

const testEmailConfig = () => {
  ElMessage.info('正在测试邮件连接...')
  setTimeout(() => {
    ElMessage.success('邮件连接测试成功')
  }, 1000)
}

const saveEmailConfig = () => {
  ElMessage.success('邮件配置保存成功')
}

const saveStorageConfig = () => {
  ElMessage.success('存储配置保存成功')
}

const saveSecurityConfig = () => {
  ElMessage.success('安全配置保存成功')
}
</script>

<style scoped lang="scss">
.config-container {
  padding: 20px;

  :deep(.el-tabs) {
    .el-tabs__content {
      padding: 20px;
    }
  }
}
</style>
