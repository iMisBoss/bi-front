<template>
  <el-dialog
      v-model="visible"
      :title="getDialogTitle"
      width="600px"
      :close-on-click-modal="false"
  >
    <el-alert
        title="导出文件将自动添加企业水印、导出人、导出时间、数据指纹，不可篡改"
        type="warning"
        :closable="false"
        show-icon
        style="margin-bottom: 20px"
    />

    <el-form :model="form" label-width="120px">
      <el-form-item label="导出范围">
        <el-radio-group v-model="form.scope">
          <el-radio label="selected">已选 {{ selectedCount }} 条</el-radio>
          <el-radio label="all">全部 {{ totalCount }} 条</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="敏感字段" v-if="hasSensitive">
        <el-radio-group v-model="form.desensitize">
          <el-radio label="yes">脱敏导出</el-radio>
          <el-radio label="no" v-if="isAdmin">明文导出（留痕）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="包含内容">
        <el-checkbox-group v-model="form.includes">
          <el-checkbox label="basic">流程基础信息</el-checkbox>
          <el-checkbox label="approval">审批轨迹</el-checkbox>
          <el-checkbox label="business">业务字段</el-checkbox>
          <el-checkbox label="attachments">附件清单</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item label="水印信息">
        <el-input v-model="form.watermark" disabled />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleExport" :loading="exporting">
        确认导出
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  exportType: String,
  selectedCount: Number,
  totalCount: Number
})

const emit = defineEmits(['update:modelValue', 'export'])

const visible = ref(false)
const exporting = ref(false)
const isAdmin = ref(true)
const hasSensitive = ref(true)

const form = ref({
  scope: 'selected',
  desensitize: 'yes',
  includes: ['basic', 'approval', 'business'],
  watermark: '某某科技有限公司 - 导出人：管理员 - 2026-01-15 10:30:00'
})

const getDialogTitle = computed(() => {
  const map = {
    excel: 'Excel导出（监管标准格式）',
    pdf: 'PDF导出（不可编辑）',
    zip: '监管报送包（Excel+PDF+附件）'
  }
  return map[props.exportType] || '导出'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleExport = () => {
  ElMessageBox.confirm('导出操作将写入审计日志，确认继续？', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    exporting.value = true
    setTimeout(() => {
      exporting.value = false
      visible.value = false
      emit('export', {
        type: props.exportType,
        count: form.value.scope === 'selected' ? props.selectedCount : props.totalCount,
        params: form.value
      })
    }, 2000)
  }).catch(() => {})
}
</script>
