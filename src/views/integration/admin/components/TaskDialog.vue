<template>
  <el-dialog
      v-model="visible"
      :title="dialogTitle"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
    >
      <el-form-item label="任务编码" prop="code">
        <el-input v-model="formData.code" placeholder="例：TASK_DATA_SYNC" :disabled="!!formData.id" />
      </el-form-item>

      <el-form-item label="任务名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入任务名称" />
      </el-form-item>

      <el-form-item label="任务类名" prop="className">
        <el-input v-model="formData.className" placeholder="com.oa.task.XxxTask" />
      </el-form-item>

      <el-form-item label="任务分组" prop="group">
        <el-select v-model="formData.group" placeholder="请选择任务分组" style="width: 100%">
          <el-option label="系统任务" value="system" />
          <el-option label="业务任务" value="business" />
          <el-option label="集成任务" value="integration" />
        </el-select>
      </el-form-item>

      <el-form-item label="Cron表达式" prop="cron">
        <el-input v-model="formData.cron" placeholder="0 0 2 * * ?">
          <template #append>
            <el-button @click="showCronBuilder = true">可视化配置</el-button>
          </template>
        </el-input>
        <div class="form-tip">示例：每日凌晨2点执行：0 0 2 * * ?</div>
      </el-form-item>

      <el-form-item label="执行参数">
        <el-input
            v-model="formData.params"
            type="textarea"
            :rows="3"
            placeholder='JSON格式，例：{"timeout": 30}'
        />
      </el-form-item>

      <el-form-item label="失败重试次数">
        <el-input-number v-model="formData.retryCount" :min="0" :max="5" />
        <span style="margin-left: 10px">次（0表示不重试）</span>
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

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </div>
    </template>

    <!-- Cron可视化选择器 -->
    <CronBuilder
        v-if="showCronBuilder"
        v-model="showCronBuilder"
        :cron="formData.cron"
        @confirm="handleCronConfirm"
    />
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import CronBuilder from './CronBuilder.vue'

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
const showCronBuilder = ref(false)

const formData = reactive({
  id: null,
  code: '',
  name: '',
  className: '',
  group: 'system',
  cron: '',
  params: '{}',
  retryCount: 3,
  remark: ''
})

const rules = {
  code: [{ required: true, message: '请输入任务编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入任务名称', trigger: 'blur' }],
  className: [{ required: true, message: '请输入任务类名', trigger: 'blur' }],
  group: [{ required: true, message: '请选择任务分组', trigger: 'change' }],
  cron: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑定时任务' : '新增定时任务'
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
    code: '',
    name: '',
    className: '',
    group: 'system',
    cron: '',
    params: '{}',
    retryCount: 3,
    remark: ''
  })
}

const handleCronConfirm = (cron) => {
  formData.cron = cron
  showCronBuilder.value = false
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
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
