<template>
  <div class="password-page">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h2>登录密码修改</h2>
          <el-tag type="warning" size="small">定期修改密码保障账号安全</el-tag>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="password-form">
        <el-form-item label="当前密码" prop="oldPassword">
          <el-input
              v-model="form.oldPassword"
              type="password"
              placeholder="请输入当前密码"
              show-password
              autocomplete="off"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="form.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password
              autocomplete="off"
          />
          <div class="password-tips">
            <el-alert type="info" :closable="false" show-icon>
              <template #default>
                <p>• 密码长度8-20位</p>
                <p>• 必须包含大小写字母、数字和特殊字符</p>
                <p>• 不能与最近3次密码相同</p>
              </template>
            </el-alert>
          </div>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password
              autocomplete="off"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确认修改</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="password-history">
        <h4>密码修改记录</h4>
        <el-table :data="historyList" size="small">
          <el-table-column prop="modifyTime" label="修改时间" width="180" />
          <el-table-column prop="ip" label="IP地址" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateNewPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入新密码'))
  } else if (value.length < 8 || value.length > 20) {
    callback(new Error('密码长度8-20位'))
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
    callback(new Error('必须包含大小写字母、数字和特殊字符'))
  } else if (value === form.oldPassword) {
    callback(new Error('新密码不能与当前密码相同'))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请再次输入新密码'))
  } else if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [{ required: true, validator: validateNewPassword, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirmPassword, trigger: 'blur' }]
}

const historyList = ref([
  { modifyTime: '2026-01-10 14:30:00', ip: '192.168.1.100', status: '成功' },
  { modifyTime: '2025-10-15 09:20:00', ip: '192.168.1.100', status: '成功' },
  { modifyTime: '2025-07-20 16:45:00', ip: '192.168.1.101', status: '失败' }
])

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      submitting.value = true
      setTimeout(() => {
        submitting.value = false
        ElMessage.success('密码修改成功，请重新登录')
        formRef.value.resetFields()
      }, 1000)
    }
  })
}

const handleReset = () => {
  formRef.value.resetFields()
}
</script>

<style scoped lang="scss">
.password-page {
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

  .password-form {
    max-width: 600px;

    .password-tips {
      margin-top: 8px;

      :deep(.el-alert__content) {
        p {
          margin: 4px 0;
          font-size: 12px;
        }
      }
    }
  }

  .password-history {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
