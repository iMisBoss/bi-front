<template>
  <div class="basic-info-tab">
    <el-form :model="formData" label-width="100px" class="info-form">
      <el-form-item label="员工头像">
        <div class="avatar-upload">
          <el-avatar :size="100" :src="formData.avatar || defaultAvatar" />
          <div class="avatar-actions">
            <el-upload
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :http-request="handleAvatarUpload"
                accept="image/jpeg,image/png"
            >
              <el-button size="small" type="primary">上传头像</el-button>
            </el-upload>
            <el-text size="small" type="info">支持JPG/PNG，自动裁剪为1:1</el-text>
          </div>
        </div>
      </el-form-item>

      <el-divider />

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名">
            <el-input v-model="formData.name" disabled class="readonly-field" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="工号">
            <el-input v-model="formData.employeeNo" disabled class="readonly-field" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="所属部门">
            <el-input v-model="formData.department" disabled class="readonly-field" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="现任职位">
            <el-input v-model="formData.position" disabled class="readonly-field" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="汇报对象">
            <el-input v-model="formData.reportTo" disabled class="readonly-field" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职时间">
            <el-input v-model="formData.joinDate" disabled class="readonly-field" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider />

      <el-form-item label="个人签名">
        <el-input
            v-model="formData.signature"
            type="textarea"
            :rows="2"
            maxlength="100"
            show-word-limit
            placeholder="请输入个人签名，如：专注OA系统开发"
        />
      </el-form-item>

      <el-form-item label="工作职责">
        <el-input
            v-model="formData.responsibilities"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入工作职责描述"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  readonlyFields: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:avatar'])

const defaultAvatar = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UwZTBlMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjQwIiBmaWxsPSIjOTk5IiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7kuIg8L3RleHQ+PC9zdmc+'

const formData = ref({
  avatar: '',
  name: '',
  employeeNo: '',
  department: '',
  position: '',
  reportTo: '',
  joinDate: '',
  signature: '',
  responsibilities: ''
})

watch(() => props.userData, (newVal) => {
  formData.value = { ...newVal }
}, { immediate: true, deep: true })

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

const handleAvatarUpload = async (options) => {
  try {
    const file = options.file
    const reader = new FileReader()

    reader.onload = (e) => {
      formData.value.avatar = e.target.result
      emit('update:avatar', e.target.result)
      ElMessage.success('头像上传成功')
    }

    reader.readAsDataURL(file)
  } catch (error) {
    ElMessage.error('头像上传失败')
  }
}
</script>

<style scoped lang="scss">
.basic-info-tab {
  .info-form {
    .avatar-upload {
      display: flex;
      align-items: center;
      gap: 20px;

      .avatar-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }

    .readonly-field {
      :deep(.el-input__wrapper) {
        background-color: #f5f7fa;
        cursor: not-allowed;
      }
    }
  }
}
</style>
