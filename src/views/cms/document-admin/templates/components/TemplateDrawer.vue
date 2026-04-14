<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
      size="800px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-tabs v-model="activeTab">
      <!-- Tab1: 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            label-width="100px"
        >
          <el-form-item label="模板名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入模板名称" />
          </el-form-item>

          <el-form-item label="模板类型" prop="type">
            <el-select v-model="formData.type" placeholder="选择模板类型" style="width: 100%">
              <el-option label="发文" value="send" />
              <el-option label="收文" value="receive" />
              <el-option label="通知" value="notice" />
            </el-select>
          </el-form-item>

          <el-form-item label="适用部门">
            <el-input v-model="formData.department" placeholder="全公司" />
          </el-form-item>

          <el-form-item label="模板状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio label="enabled" value="enabled">启用</el-radio>
              <el-radio label="disabled" value="disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="备注">
            <el-input
                v-model="formData.remark"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                placeholder="请输入备注"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab2: 模板内容 -->
      <el-tab-pane label="模板内容" name="content">
        <el-form-item label="模板内容">
          <el-input
              v-model="formData.content"
              type="textarea"
              :rows="15"
              placeholder="请输入模板内容（支持HTML格式）"
          />
        </el-form-item>
        <el-alert
            title="提示：可上传红头文件图片作为模板封面"
            type="info"
            :closable="false"
            style="margin-top: 12px"
        />
      </el-tab-pane>

      <!-- Tab3: 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <el-timeline>
          <el-timeline-item
              v-for="(log, index) in formData.logs || []"
              :key="index"
              :timestamp="log.time"
              placement="top"
          >
            {{ log.operator }} {{ log.action }}
          </el-timeline-item>
          <el-timeline-item v-if="!formData.logs || formData.logs.length === 0" timestamp="">
            暂无操作日志
          </el-timeline-item>
        </el-timeline>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <div class="drawer-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'add'
  },
  data: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)
const activeTab = ref('basic')

const formData = reactive({
  id: null,
  name: '',
  type: 'send',
  department: '全公司',
  status: 'enabled',
  remark: '',
  content: '',
  logs: []
})

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择模板类型', trigger: 'change' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑模板' : '新增模板'
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.data) {
    Object.assign(formData, props.data)
  } else if (val) {
    resetForm()
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',
    type: 'send',
    department: '全公司',
    status: 'enabled',
    remark: '',
    content: '',
    logs: []
  })
  activeTab.value = 'basic'
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        emit('confirm', { ...formData })
      }, 500)
    }
  })
}

const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
