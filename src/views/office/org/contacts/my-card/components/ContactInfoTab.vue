<template>
  <div class="contact-info-tab">
    <el-alert
        v-if="approvalEnabled"
        title="当前开启了修改审批，关键信息修改需部门负责人审批后生效"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
    />

    <el-form :model="formData" label-width="100px" class="contact-form">
      <el-divider content-position="left">办公信息（公开）</el-divider>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="办公座机" required>
            <el-input
                v-model="formData.officePhone"
                placeholder="请输入办公座机号码"
                @change="handleChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="企业邮箱">
            <el-input
                v-model="formData.email"
                :disabled="true"
                class="readonly-field"
            />
            <el-text size="small" type="info">企业邮箱由管理员统一维护</el-text>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="手机号码">
            <el-input
                v-model="formData.mobile"
                placeholder="请输入手机号码"
                @change="handleChange"
            />
            <el-text size="small" type="warning">对外展示时将脱敏处理</el-text>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="办公工位">
            <el-input
                v-model="formData.workstation"
                placeholder="如：A座5层-508-12号"
                @change="handleChange"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-divider content-position="left">私人信息（仅本人可见）</el-divider>

      <el-form-item label="紧急联系人">
        <el-input
            v-model="formData.emergencyContact"
            placeholder="如：张父 13900139000"
            @change="handleChange"
        />
        <el-text size="small" type="info">此信息完全私密，仅本人可见</el-text>
      </el-form-item>

      <el-form-item label="备用邮箱">
        <el-input
            v-model="formData.backupEmail"
            placeholder="用于密码找回等场景"
            @change="handleChange"
        />
        <el-text size="small" type="info">此信息仅本人可见</el-text>
      </el-form-item>

      <el-divider />

      <el-form-item label="审批状态" v-if="approvalEnabled && pendingApproval">
        <el-tag type="warning">待部门负责人审批</el-tag>
        <el-text size="small" type="info" style="margin-left: 10px">
          提交时间：{{ submitTime }}
        </el-text>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  userData: {
    type: Object,
    required: true
  },
  approvalEnabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const formData = ref({
  officePhone: '',
  email: '',
  mobile: '',
  workstation: '',
  emergencyContact: '',
  backupEmail: ''
})

const pendingApproval = ref(false)
const submitTime = ref('')

watch(() => props.userData, (newVal) => {
  formData.value = { ...newVal }
}, { immediate: true, deep: true })

const handleChange = () => {
  emit('change')
}
</script>

<style scoped lang="scss">
.contact-info-tab {
  .contact-form {
    .readonly-field {
      :deep(.el-input__wrapper) {
        background-color: #f5f7fa;
        cursor: not-allowed;
      }
    }
  }
}
</style>
