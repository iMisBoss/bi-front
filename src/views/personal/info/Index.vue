<template>
  <div class="personal-info-page">
    <el-card shadow="never">
      <template #header>
        <div class="page-header">
          <h2>个人信息</h2>
          <el-tag type="info" size="small">维护您的个人资料</el-tag>
        </div>
      </template>

      <div class="info-content">
        <div class="avatar-section">
          <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="beforeAvatarUpload"
              :http-request="handleAvatarUpload"
          >
            <el-avatar :size="120" :src="userInfo.avatar">
              <span class="avatar-text">{{ avatarText }}</span>
            </el-avatar>
            <div class="avatar-overlay">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </el-upload>
          <el-text type="info" size="small">支持JPG/PNG格式，不超过2MB</el-text>
        </div>

        <el-form :model="userInfo" :rules="rules" ref="formRef" label-width="100px" class="info-form">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="姓名">
                <el-input v-model="userInfo.name" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="工号">
                <el-input v-model="userInfo.employeeNo" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="所属部门">
                <el-input v-model="userInfo.department" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="职位">
                <el-input v-model="userInfo.position" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="手机号码" prop="phone">
                <el-input v-model="userInfo.phone" placeholder="请输入手机号码" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="企业邮箱">
                <el-input v-model="userInfo.email" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="办公座机">
                <el-input v-model="userInfo.officePhone" placeholder="请输入办公座机" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="办公工位">
                <el-input v-model="userInfo.workstation" placeholder="如：A座5层-508" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="个人签名">
            <el-input
                v-model="userInfo.signature"
                type="textarea"
                :rows="3"
                placeholder="请输入个人签名"
                maxlength="100"
                show-word-limit
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Camera } from '@element-plus/icons-vue'

const formRef = ref(null)
const saving = ref(false)

const userInfo = reactive({
  avatar: '',
  name: '张三',
  employeeNo: 'EMP001',
  department: '技术研发部',
  position: '高级工程师',
  phone: '13800138000',
  email: 'zhangsan@company.com',
  officePhone: '010-88888888',
  workstation: 'A座5层-508',
  signature: '专注OA系统开发'
})

// 计算头像显示文字（取姓名第一个字）
const avatarText = computed(() => {
  return userInfo.name ? userInfo.name.charAt(0) : '用'
})

const rules = {
  phone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur' }
  ]
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleAvatarUpload = (options) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    userInfo.avatar = e.target.result
    ElMessage.success('头像上传成功')
  }
  reader.readAsDataURL(options.file)
}

const handleSave = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        ElMessage.success('保存成功')
      }, 1000)
    }
  })
}

const handleReset = () => {
  formRef.value.resetFields()
  ElMessage.success('已重置')
}

onMounted(() => {
  console.log('个人信息页面加载')
})
</script>

<style scoped lang="scss">
.personal-info-page {
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

  .info-content {
    display: flex;
    gap: 40px;

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      .avatar-uploader {
        position: relative;
        cursor: pointer;

        &:hover .avatar-overlay {
          opacity: 1;
        }

        .avatar-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 120px;
          height: 120px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          opacity: 0;
          transition: opacity 0.3s;

          .el-icon {
            font-size: 24px;
            margin-bottom: 4px;
          }

          span {
            font-size: 12px;
          }
        }
      }

      .avatar-text {
        font-size: 48px;
        font-weight: 500;
        color: #409eff;
      }
    }

    .info-form {
      flex: 1;
      max-width: 700px;
    }
  }
}
</style>
