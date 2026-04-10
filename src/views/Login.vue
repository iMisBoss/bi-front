<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-box">
        <div class="login-header">
          <div class="logo-placeholder">
            <el-icon :size="60" color="#1890ff"><OfficeBuilding /></el-icon>
          </div>
          <h2>建信消金 OA 系统</h2>
        </div>

        <el-form
            ref="formRef"
            :model="loginForm"
            :rules="rules"
            class="login-form"
            @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
                v-model="loginForm.username"
                placeholder="请输入用户名"
                size="large"
                prefix-icon="User"
                clearable
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                size="large"
                prefix-icon="Lock"
                show-password
            />
          </el-form-item>

          <el-form-item prop="role">
            <el-select
                v-model="loginForm.role"
                placeholder="选择登录角色"
                size="large"
                style="width: 100%"
            >
              <el-option label="普通用户（前台菜单）" value="normal" />
              <el-option label="系统管理员（后台菜单）" value="admin" />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-btn"
                @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>

          <el-alert
              v-if="showDefaultAccount"
              title="测试账户"
              type="info"
              :closable="false"
              class="default-account-tip"
          >
            <p><strong>普通用户：</strong>用户名 user / 密码 123456 / 角色：普通用户</p>
            <p><strong>系统管理员：</strong>用户名 admin / 密码 123456 / 角色：系统管理员</p>
          </el-alert>
        </el-form>

        <div class="login-footer">
          <span>© 2026 建信消费金融有限责任公司</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { OfficeBuilding } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const showDefaultAccount = ref(true)

const loginForm = ref({
  username: '',
  password: '',
  role: 'normal',
  remember: false
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择登录角色', trigger: 'change' }
  ]
}

// 默认账户
const DEFAULT_ACCOUNTS = {
  normal: { username: 'user', password: '123456' },
  admin: { username: 'admin', password: '123456' }
}

// 检查是否有记住的用户名
onMounted(() => {
  const rememberedUsername = localStorage.getItem('remembered_username')
  if (rememberedUsername) {
    loginForm.value.username = rememberedUsername
    loginForm.value.remember = true
  }
})

const handleLogin = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const accountType = loginForm.value.role
        const defaultAccount = DEFAULT_ACCOUNTS[accountType]

        // 验证账户
        if (loginForm.value.username === defaultAccount.username &&
            loginForm.value.password === defaultAccount.password) {

          // 模拟登录 API 调用
          await new Promise(resolve => setTimeout(resolve, 800))

          // 设置 token
          const mockToken = `o2_token_${accountType}_${Date.now()}`
          await userStore.setToken(mockToken)

          // 设置角色
          userStore.setUserRole(accountType)

          // 保存用户信息
          if (accountType === 'admin') {
            userStore.currentUser = {
              name: '系统管理员',
              username: 'admin',
              department: '科技部',
              role: 'admin'
            }
          } else {
            userStore.currentUser = {
              name: '张三',
              username: 'zhangsan',
              department: '人事部',
              role: 'user'
            }
          }
          userStore.isLoggedIn = true

          // 记住用户名
          if (loginForm.value.remember) {
            localStorage.setItem('remembered_username', loginForm.value.username)
          } else {
            localStorage.removeItem('remembered_username')
          }

          ElMessage.success(`登录成功，欢迎 ${userStore.currentUser.name}`)

          // 跳转到首页（管理员跳转后台首页，普通用户跳转普通首页）
          setTimeout(() => {
            if (accountType === 'admin') {
              router.push('/admin/home')
            } else {
              router.push('/')
            }
          }, 500)

        } else {
          // 非默认账户，提示错误
          ElMessage.error(`用户名或密码错误，请使用测试账户登录`)
        }
      } catch (error) {
        console.error('登录失败:', error)
        ElMessage.error('登录失败，请检查网络连接')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    animation: backgroundMove 20s linear infinite;
  }

  .login-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 420px;
    padding: 20px;
  }

  .login-box {
    background: #fff;
    border-radius: 12px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      .logo-placeholder {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        margin-bottom: 15px;
      }

      h2 {
        font-size: 24px;
        color: #333;
        font-weight: 600;
      }
    }

    .login-form {
      .el-form-item {
        margin-bottom: 20px;
      }

      .login-btn {
        width: 100%;
        margin-top: 10px;
      }

      .default-account-tip {
        margin-top: 15px;
        margin-bottom: 0;

        p {
          margin: 5px 0;
          font-size: 13px;
        }
      }
    }

    .login-footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
  }
}

@keyframes backgroundMove {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}
</style>
