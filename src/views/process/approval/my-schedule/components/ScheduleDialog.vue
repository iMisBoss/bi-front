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
        label-width="100px"
    >
      <el-form-item label="日程标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入日程标题" />
      </el-form-item>

      <el-form-item label="时间类型">
        <el-radio-group v-model="formData.timeType">
          <el-radio label="custom" value="custom">自定义时间段</el-radio>
          <el-radio label="allday" value="allday">全天</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="选择结束时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="地点">
        <el-input v-model="formData.location" placeholder="会议室/线上/出差地点" />
      </el-form-item>

      <el-form-item label="参与人">
        <el-select
            v-model="formData.participants"
            multiple
            filterable
            placeholder="选择参与人"
            style="width: 100%"
        >
          <el-option label="张三" value="张三" />
          <el-option label="李四" value="李四" />
          <el-option label="王五" value="王五" />
          <el-option label="赵六" value="赵六" />
        </el-select>
      </el-form-item>

      <el-form-item label="优先级">
        <el-select v-model="formData.priority" style="width: 100%">
          <el-option label="高" value="high" />
          <el-option label="中" value="medium" />
          <el-option label="低" value="low" />
        </el-select>
      </el-form-item>

      <el-form-item label="日程分类">
        <el-select v-model="formData.category" style="width: 100%">
          <el-option label="工作会议" :value="1" />
          <el-option label="出差" :value="2" />
          <el-option label="培训" :value="3" />
          <el-option label="个人事务" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="重复设置">
        <el-select v-model="formData.repeat" style="width: 100%">
          <el-option label="不重复" value="none" />
          <el-option label="每日" value="daily" />
          <el-option label="每周" value="weekly" />
          <el-option label="每月" value="monthly" />
        </el-select>
      </el-form-item>

      <el-form-item label="提醒设置">
        <el-select v-model="formData.reminder" style="width: 100%">
          <el-option label="不提醒" value="none" />
          <el-option label="提前10分钟" value="10min" />
          <el-option label="提前30分钟" value="30min" />
          <el-option label="提前1小时" value="1hour" />
          <el-option label="提前1天" value="1day" />
        </el-select>
      </el-form-item>

      <el-form-item label="共享设置">
        <el-radio-group v-model="formData.shareType">
          <el-radio label="private" value="private">仅自己可见</el-radio>
          <el-radio label="department" value="department">本部门可见</el-radio>
          <el-radio label="specific" value="specific">指定人员可见</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
            v-model="formData.remark"
            type="textarea"
            :rows="3"
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
  </el-dialog>
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

const formData = reactive({
  id: null,
  title: '',
  timeType: 'custom',
  startTime: '',
  endTime: '',
  location: '',
  participants: [],
  priority: 'medium',
  category: 1,
  repeat: 'none',
  reminder: '30min',
  shareType: 'private',
  remark: ''
})

const rules = {
  title: [{ required: true, message: '请输入日程标题', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const dialogTitle = computed(() => {
  return formData.id ? '编辑日程' : '新增日程'
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
    title: '',
    timeType: 'custom',
    startTime: '',
    endTime: '',
    location: '',
    participants: [],
    priority: 'medium',
    category: 1,
    repeat: 'none',
    reminder: '30min',
    shareType: 'private',
    remark: ''
  })
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
</style>
