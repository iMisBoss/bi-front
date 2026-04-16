<template>
  <div class="security-control-page">
    <el-card class="main-card" shadow="never">
      <div class="config-container">
        <el-form
            ref="formRef"
            :model="formData"
            label-width="200px"
            class="config-form"
        >
          <el-divider content-position="left">权限配置</el-divider>

          <el-form-item label="发文权限">
            <el-select v-model="formData.sendPermission" style="width: 200px">
              <el-option label="全公司" value="all" />
              <el-option label="指定部门" value="department" />
              <el-option label="指定角色" value="role" />
            </el-select>
            <span class="form-tip">控制哪些人员可以发起公文</span>
          </el-form-item>

          <el-form-item label="收文查看权限">
            <el-select v-model="formData.receiveView" style="width: 200px">
              <el-option label="仅接收部门可见" value="department" />
              <el-option label="全员可见" value="all" />
            </el-select>
            <span class="form-tip">控制收文查看范围</span>
          </el-form-item>

          <el-divider content-position="left">涉密等级管控</el-divider>

          <el-form-item label="默认涉密等级">
            <el-select v-model="formData.defaultLevel" style="width: 200px">
              <el-option label="公开" value="public" />
              <el-option label="内部" value="internal" />
              <el-option label="秘密" value="secret" />
              <el-option label="机密" value="confidential" />
            </el-select>
            <span class="form-tip">新建公文的默认密级</span>
          </el-form-item>

          <el-form-item label="涉密公文管控">
            <el-checkbox v-model="formData.secretNoExport">禁止导出</el-checkbox>
            <el-checkbox v-model="formData.secretNoForward">禁止转发</el-checkbox>
            <el-checkbox v-model="formData.secretWatermark">强制水印</el-checkbox>
          </el-form-item>

          <el-divider content-position="left">安全规则</el-divider>

          <el-form-item label="公文删除权限">
            <el-radio-group v-model="formData.deletePermission">
              <el-radio label="admin" value="admin">仅管理员可删</el-radio>
              <el-radio label="none" value="none">禁止删除</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="内容水印">
            <el-switch
                v-model="formData.contentWatermark"
                active-text="开启"
                inactive-text="关闭"
            />
            <span class="form-tip">显示账号+时间水印</span>
          </el-form-item>

          <el-divider />

          <el-form-item>
            <el-button type="primary" @click="handleSave" :loading="saving">保存配置</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  sendPermission: 'all',
  receiveView: 'department',
  defaultLevel: 'internal',
  secretNoExport: true,
  secretNoForward: true,
  secretWatermark: true,
  deletePermission: 'admin',
  contentWatermark: true
})

const defaultData = { ...formData }

onMounted(() => {
  loadConfig()
})

const loadConfig = () => {
  // 从后端加载配置
}

const handleSave = async () => {
  await ElMessageBox.confirm(
      '确定要保存安全配置吗？此配置将立即生效。',
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
.security-control-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;

  .main-card {
    flex: 1;
    overflow-y: auto;
    border-radius: 8px;
  }

  .config-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px 0;
  }

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
