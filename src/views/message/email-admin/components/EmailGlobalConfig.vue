NEW_FILE_CODE
<template>
  <div class="email-global-config">
    <el-form
        ref="formRef"
        :model="formData"
        label-width="200px"
        class="config-form"
    >
      <el-divider content-position="left">安全策略配置</el-divider>

      <el-form-item label="内部邮件附件限制">
        <el-select v-model="formData.attachmentLimit" style="width: 200px">
          <el-option label="10MB" value="10" />
          <el-option label="20MB" value="20" />
          <el-option label="50MB" value="50" />
        </el-select>
        <span class="form-tip">单附件最大大小限制</span>
      </el-form-item>

      <el-form-item label="敏感词拦截">
        <el-switch
            v-model="formData.sensitiveWordFilter"
            active-text="启用"
            inactive-text="禁用"
        />
        <span class="form-tip">拦截包含敏感词的邮件</span>
      </el-form-item>

      <el-form-item label="邮件自动归档">
        <el-select v-model="formData.autoArchive" style="width: 200px">
          <el-option label="30天" value="30" />
          <el-option label="90天" value="90" />
          <el-option label="180天" value="180" />
        </el-select>
        <span class="form-tip">超过指定天数自动归档</span>
      </el-form-item>

      <el-form-item label="邮件数据保留时长">
        <el-select v-model="formData.dataRetention" style="width: 200px">
          <el-option label="180天" value="180" />
          <el-option label="365天" value="365" />
          <el-option label="永久" value="permanent" />
        </el-select>
        <span class="form-tip">邮件数据保存期限</span>
      </el-form-item>

      <el-form-item label="外部邮件收发">
        <el-switch
            v-model="formData.externalEmail"
            active-text="启用"
            inactive-text="禁用"
        />
        <span class="form-tip">允许与外部邮箱收发邮件</span>
      </el-form-item>

      <el-form-item label="操作日志留存">
        <el-switch
            v-model="formData.logRetention"
            active-text="启用"
            inactive-text="禁用"
            disabled
        />
        <span class="form-tip">强制开启，满足合规要求</span>
      </el-form-item>

      <el-divider />

      <el-form-item>
        <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  attachmentLimit: '20',
  sensitiveWordFilter: true,
  autoArchive: '90',
  dataRetention: '365',
  externalEmail: false,
  logRetention: true
})

const defaultData = { ...formData }

onMounted(() => {
  loadConfig()
})

const loadConfig = () => {
  // 从后端加载配置
  // formData = await getConfig()
}

const handleSave = async () => {
  if (!formRef.value) return

  await ElMessageBox.confirm(
      '确定要保存邮件全局配置吗？此配置将立即生效。',
      '保存配置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    saving.value = true
    setTimeout(() => {
      saving.value = false
      ElMessage.success('配置保存成功')
    }, 500)
  }).catch(() => {})
}

const handleReset = () => {
  Object.assign(formData, defaultData)
  ElMessage.success('已重置为默认配置')
}
</script>

<style lang="scss" scoped>
.email-global-config {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;

  .config-form {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
  }

  .form-tip {
    margin-left: 12px;
    color: #909399;
    font-size: 12px;
  }
}
</style>
