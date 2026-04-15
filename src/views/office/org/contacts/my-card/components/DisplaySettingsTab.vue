<template>
  <div class="display-settings-tab">
    <el-alert
        title="隐私设置说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
    >
      <template #default>
        <p>您可以控制哪些信息对其他同事可见，灰色项为企业强制公开字段</p>
      </template>
    </el-alert>

    <el-form label-width="120px" class="settings-form">
      <el-form-item label="信息可见范围">
        <el-radio-group v-model="settings.visibilityRange" @change="handleChange">
          <el-radio label="all">全部可见（全公司同事）</el-radio>
          <el-radio label="department">仅本部门可见</el-radio>
          <el-radio label="contacts">仅常用联系人可见</el-radio>
          <el-radio label="private">完全私密（仅自己可见）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-divider content-position="left">单项字段隐私开关</el-divider>

      <el-form-item label="手机号码">
        <el-switch
            v-model="settings.showMobile"
            active-text="公开显示"
            inactive-text="隐藏"
            @change="handleChange"
        />
        <el-text size="small" type="info" style="margin-left: 10px">
          关闭后他人查看时显示为 138****1234
        </el-text>
      </el-form-item>

      <el-form-item label="办公工位">
        <el-switch
            v-model="settings.showWorkstation"
            active-text="公开显示"
            inactive-text="隐藏"
            @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="个人签名">
        <el-switch
            v-model="settings.showSignature"
            active-text="公开显示"
            inactive-text="隐藏"
            @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="工作职责">
        <el-switch
            v-model="settings.showResponsibilities"
            active-text="公开显示"
            inactive-text="隐藏"
            @change="handleChange"
        />
      </el-form-item>

      <el-form-item label="汇报对象">
        <el-switch
            v-model="settings.showReportTo"
            active-text="公开显示"
            inactive-text="隐藏"
            @change="handleChange"
        />
      </el-form-item>

      <el-divider />

      <el-alert
          title="强制公开字段（不可隐藏）"
          type="warning"
          :closable="false"
          show-icon
      >
        <template #default>
          <div class="forced-fields">
            <el-tag size="small" type="info">姓名</el-tag>
            <el-tag size="small" type="info">工号</el-tag>
            <el-tag size="small" type="info">部门</el-tag>
            <el-tag size="small" type="info">职位</el-tag>
            <el-tag size="small" type="info">办公座机</el-tag>
            <el-tag size="small" type="info">企业邮箱</el-tag>
          </div>
        </template>
      </el-alert>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  privacySettings: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['change'])

const settings = reactive({
  visibilityRange: 'all',
  showMobile: true,
  showWorkstation: true,
  showSignature: true,
  showResponsibilities: true,
  showReportTo: false
})

watch(() => props.privacySettings, (newVal) => {
  Object.assign(settings, newVal)
}, { immediate: true, deep: true })

const handleChange = () => {
  emit('change')
}
</script>

<style scoped lang="scss">
.display-settings-tab {
  .settings-form {
    .forced-fields {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}
</style>
