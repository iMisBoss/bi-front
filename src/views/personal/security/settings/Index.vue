<template>
  <div class="security-settings-page">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h2>账号安全设置</h2>
          <el-tag type="warning" size="small">增强账号安全性</el-tag>
        </div>
      </template>

      <div class="settings-list">
        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Lock /></el-icon>
            </div>
            <div class="setting-content">
              <h4>登录密码</h4>
              <p>定期修改密码可提高账号安全性</p>
            </div>
          </div>
          <el-button @click="goToPassword">修改</el-button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Iphone /></el-icon>
            </div>
            <div class="setting-content">
              <h4>手机号绑定</h4>
              <p>已绑定：{{ userInfo.phone }}</p>
            </div>
          </div>
          <el-button @click="showPhoneDialog = true">更换</el-button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Message /></el-icon>
            </div>
            <div class="setting-content">
              <h4>邮箱绑定</h4>
              <p>已绑定：{{ userInfo.email }}</p>
            </div>
          </div>
          <el-button @click="showEmailDialog = true">更换</el-button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Key /></el-icon>
            </div>
            <div class="setting-content">
              <h4>密保问题</h4>
              <p>设置密保问题可用于找回密码</p>
            </div>
          </div>
          <el-button @click="showSecurityDialog = true">设置</el-button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Monitor /></el-icon>
            </div>
            <div class="setting-content">
              <h4>登录设备管理</h4>
              <p>当前登录设备：{{ deviceCount }} 台</p>
            </div>
          </div>
          <el-button @click="showDeviceDialog = true">管理</el-button>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Bell /></el-icon>
            </div>
            <div class="setting-content">
              <h4>登录提醒</h4>
              <p>异地登录时发送提醒通知</p>
            </div>
          </div>
          <el-switch v-model="settings.loginAlert" />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <div class="setting-icon">
              <el-icon :size="24"><Timer /></el-icon>
            </div>
            <div class="setting-content">
              <h4>会话超时</h4>
              <p>无操作 {{ settings.sessionTimeout }} 分钟后自动退出</p>
            </div>
          </div>
          <el-select v-model="settings.sessionTimeout" style="width: 120px">
            <el-option label="15分钟" :value="15" />
            <el-option label="30分钟" :value="30" />
            <el-option label="60分钟" :value="60" />
            <el-option label="120分钟" :value="120" />
          </el-select>
        </div>
      </div>
    </el-card>

    <el-dialog v-model="showPhoneDialog" title="更换手机号" width="500px">
      <el-form label-width="100px">
        <el-form-item label="当前手机号">
          <el-input v-model="userInfo.phone" disabled />
        </el-form-item>
        <el-form-item label="新手机号">
          <el-input v-model="newPhone" placeholder="请输入新手机号" />
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="verifyCode" placeholder="请输入验证码" style="width: 200px">
            <template #append>
              <el-button @click="sendVerifyCode" :disabled="countdown > 0">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPhoneDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePhone">确认更换</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showEmailDialog" title="更换邮箱" width="500px">
      <el-form label-width="100px">
        <el-form-item label="当前邮箱">
          <el-input v-model="userInfo.email" disabled />
        </el-form-item>
        <el-form-item label="新邮箱">
          <el-input v-model="newEmail" placeholder="请输入新邮箱" />
        </el-form-item>
        <el-form-item label="验证码">
          <el-input v-model="emailVerifyCode" placeholder="请输入验证码" style="width: 200px">
            <template #append>
              <el-button @click="sendEmailVerifyCode" :disabled="emailCountdown > 0">
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEmailDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateEmail">确认更换</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showSecurityDialog" title="设置密保问题" width="600px">
      <el-form label-width="120px">
        <el-form-item label="问题1">
          <el-select v-model="securityQuestions.q1" placeholder="请选择密保问题" style="width: 100%">
            <el-option label="您的小学名字是？" value="q1" />
            <el-option label="您的第一只宠物名字？" value="q2" />
            <el-option label="您的出生地是？" value="q3" />
          </el-select>
        </el-form-item>
        <el-form-item label="答案1">
          <el-input v-model="securityAnswers.a1" placeholder="请输入答案" />
        </el-form-item>
        <el-form-item label="问题2">
          <el-select v-model="securityQuestions.q2" placeholder="请选择密保问题" style="width: 100%">
            <el-option label="您的父亲名字是？" value="q4" />
            <el-option label="您的母亲名字是？" value="q5" />
            <el-option label="您最喜欢的颜色？" value="q6" />
          </el-select>
        </el-form-item>
        <el-form-item label="答案2">
          <el-input v-model="securityAnswers.a2" placeholder="请输入答案" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSecurityDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSaveSecurity">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDeviceDialog" title="登录设备管理" width="700px">
      <el-table :data="devices" size="small">
        <el-table-column prop="device" label="设备" width="200" />
        <el-table-column prop="location" label="登录地点" width="120" />
        <el-table-column prop="lastLogin" label="最后登录" width="180" />
        <el-table-column prop="current" label="当前设备" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.current" type="success" size="small">当前</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row }">
            <el-button
                v-if="!row.current"
                link
                type="danger"
                size="small"
                @click="handleRemoveDevice(row)"
            >
              移除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Iphone, Message, Key, Monitor, Bell, Timer } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const userInfo = reactive({
  phone: '138****1234',
  email: 'zhangsan@company.com'
})

const settings = reactive({
  loginAlert: true,
  sessionTimeout: 30
})

const deviceCount = ref(2)

const showPhoneDialog = ref(false)
const showEmailDialog = ref(false)
const showSecurityDialog = ref(false)
const showDeviceDialog = ref(false)

const newPhone = ref('')
const verifyCode = ref('')
const countdown = ref(0)

const newEmail = ref('')
const emailVerifyCode = ref('')
const emailCountdown = ref(0)

const securityQuestions = reactive({ q1: '', q2: '' })
const securityAnswers = reactive({ a1: '', a2: '' })

const devices = ref([
  { device: 'Windows 10 - Chrome', location: '北京市', lastLogin: '2026-01-15 09:30', current: true },
  { device: 'MacOS - Safari', location: '北京市', lastLogin: '2026-01-14 18:20', current: false }
])

const goToPassword = () => {
  router.push('/personal/security/password')
}

const sendVerifyCode = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(timer)
  }, 1000)
  ElMessage.success('验证码已发送')
}

const sendEmailVerifyCode = () => {
  emailCountdown.value = 60
  const timer = setInterval(() => {
    emailCountdown.value--
    if (emailCountdown.value <= 0) clearInterval(timer)
  }, 1000)
  ElMessage.success('验证码已发送')
}

const handleUpdatePhone = () => {
  ElMessage.success('手机号更换成功')
  showPhoneDialog.value = false
}

const handleUpdateEmail = () => {
  ElMessage.success('邮箱更换成功')
  showEmailDialog.value = false
}

const handleSaveSecurity = () => {
  ElMessage.success('密保问题设置成功')
  showSecurityDialog.value = false
}

const handleRemoveDevice = (row) => {
  ElMessage.success('设备已移除')
  devices.value = devices.value.filter(d => d.device !== row.device)
  deviceCount.value--
}
</script>

<style scoped lang="scss">
.security-settings-page {
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

  .settings-list {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #e4e7ed;

      &:last-child {
        border-bottom: none;
      }

      .setting-info {
        display: flex;
        align-items: center;
        gap: 16px;

        .setting-icon {
          width: 48px;
          height: 48px;
          background: #f5f7fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #409EFF;
        }

        .setting-content {
          h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
          }

          p {
            margin: 0;
            font-size: 13px;
            color: #909399;
          }
        }
      }
    }
  }
}
</style>
