<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
      size="600px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
    >
      <!-- 职级表单 -->
      <template v-if="type === 'level'">
        <el-form-item label="职级名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入职级名称" />
        </el-form-item>

        <el-form-item label="职级编码" prop="code">
          <el-input
              v-model="formData.code"
              placeholder="自动生成或手动输入"
              :disabled="!!formData.id"
          />
        </el-form-item>

        <el-form-item label="职级层级" prop="level">
          <el-select v-model="formData.level" placeholder="请选择职级层级" style="width: 100%">
            <el-option label="基层" value="基层" />
            <el-option label="中层" value="中层" />
            <el-option label="高层" value="高层" />
            <el-option label="高管" value="高管" />
          </el-select>
        </el-form-item>

        <el-form-item label="薪酬等级" prop="salaryGrade">
          <el-input v-model="formData.salaryGrade" placeholder="如：P1、M1、E1" />
        </el-form-item>

        <el-form-item label="审批权限上限" prop="approvalLimit">
          <el-input-number
              v-model="formData.approvalLimit"
              :min="0"
              :step="1000"
              style="width: 100%"
              placeholder="请输入金额"
          >
            <template #prefix>¥</template>
          </el-input-number>
        </el-form-item>

        <el-form-item label="职级排序" prop="sort">
          <el-input-number
              v-model="formData.sort"
              :min="1"
              :max="999"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="职级描述">
          <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入职级描述"
          />
        </el-form-item>
      </template>

      <!-- 职务表单 -->
      <template v-else>
        <el-form-item label="职务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入职务名称" />
        </el-form-item>

        <el-form-item label="职务编码" prop="code">
          <el-input
              v-model="formData.code"
              placeholder="自动生成或手动输入"
              :disabled="!!formData.id"
          />
        </el-form-item>

        <el-form-item label="关联职级" prop="levelId">
          <el-select
              v-model="formData.levelId"
              placeholder="请选择关联职级"
              style="width: 100%"
          >
            <el-option
                v-for="option in levelOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属序列" prop="sequence">
          <el-select v-model="formData.sequence" placeholder="请选择所属序列" style="width: 100%">
            <el-option label="技术序列" value="技术序列" />
            <el-option label="产品序列" value="产品序列" />
            <el-option label="运营序列" value="运营序列" />
            <el-option label="职能序列" value="职能序列" />
            <el-option label="管理序列" value="管理序列" />
          </el-select>
        </el-form-item>

        <el-form-item label="所属部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入所属部门" />
        </el-form-item>

        <el-form-item label="职务排序" prop="sort">
          <el-input-number
              v-model="formData.sort"
              :min="1"
              :max="999"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </template>
    </el-form>

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
    default: 'level' // level 或 position
  },
  data: {
    type: Object,
    default: null
  },
  levelOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const formRef = ref(null)
const saving = ref(false)

const formData = reactive({
  id: null,
  name: '',
  code: '',
  level: '',
  levelId: null,
  levelName: '',
  salaryGrade: '',
  approvalLimit: 0,
  sequence: '',
  department: '',
  sort: 1,
  status: 'enabled',
  description: ''
})

const rules = computed(() => {
  if (props.type === 'level') {
    return {
      name: [{ required: true, message: '请输入职级名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入职级编码', trigger: 'blur' }],
      level: [{ required: true, message: '请选择职级层级', trigger: 'change' }],
      sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
    }
  } else {
    return {
      name: [{ required: true, message: '请输入职务名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入职务编码', trigger: 'blur' }],
      levelId: [{ required: true, message: '请选择关联职级', trigger: 'change' }],
      sequence: [{ required: true, message: '请选择所属序列', trigger: 'change' }],
      sort: [{ required: true, message: '请输入排序号', trigger: 'blur' }]
    }
  }
})

const drawerTitle = computed(() => {
  const typeName = props.type === 'level' ? '职级' : '职务'
  return formData.id ? `编辑${typeName}` : `新增${typeName}`
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
    code: props.type === 'level' ? `LEVEL-${String(Date.now()).slice(-3)}` : `POS-${String(Date.now()).slice(-3)}`,
    level: '',
    levelId: null,
    levelName: '',
    salaryGrade: '',
    approvalLimit: 0,
    sequence: '',
    department: '',
    sort: 1,
    status: 'enabled',
    description: ''
  })
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      // 如果是职务，需要设置levelName
      if (props.type === 'position' && formData.levelId) {
        const levelOption = props.levelOptions.find(opt => opt.value === formData.levelId)
        if (levelOption) {
          formData.levelName = levelOption.label
        }
      }

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
