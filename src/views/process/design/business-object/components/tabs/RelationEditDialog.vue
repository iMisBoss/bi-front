<template>
  <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑关联' : '新增关联'"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
    >
      <!-- 第一步：关联类型 -->
      <el-form-item label="关联类型" prop="relationType">
        <el-select v-model="formData.relationType" style="width: 100%" @change="handleRelationTypeChange">
          <el-option label="多对一" value="many-to-one">
            <span>多对一</span>
            <span style="color: #909399; font-size: 12px; margin-left: 8px">（如：申请人→员工信息）</span>
          </el-option>
          <el-option label="一对多" value="one-to-many">
            <span>一对多</span>
            <span style="color: #909399; font-size: 12px; margin-left: 8px">（如：报销单→费用明细）</span>
          </el-option>
          <el-option label="一对一" value="one-to-one">
            <span>一对一</span>
            <span style="color: #909399; font-size: 12px; margin-left: 8px">（如：员工信息→银行卡）</span>
          </el-option>
          <el-option label="多对多" value="many-to-many">
            <span>多对多</span>
            <span style="color: #909399; font-size: 12px; margin-left: 8px">（如：会议申请→参会人）</span>
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 第二步：关联业务对象 -->
      <el-form-item label="关联业务对象" prop="targetObject">
        <el-select
            v-model="formData.targetObject"
            filterable
            style="width: 100%"
            @change="handleTargetObjectChange"
        >
          <el-option
              v-for="obj in availableObjects"
              :key="obj.id"
              :label="obj.name"
              :value="obj.name"
          >
            <div style="display: flex; justify-content: space-between; align-items: center">
              <span>{{ obj.name }}</span>
              <span style="color: #909399; font-size: 12px">
                {{ obj.domain === 'hr' ? '人事类' : obj.domain === 'finance' ? '财务类' : '其他' }}
              </span>
            </div>
          </el-option>
        </el-select>
        <el-alert
            v-if="crossDomainWarning"
            type="warning"
            :closable="false"
            style="margin-top: 8px"
        >
          <template #title>
            <span>跨业务域关联可能存在数据权限问题，请谨慎选择</span>
          </template>
        </el-alert>
      </el-form-item>

      <!-- 第三步：外键列名 -->
      <el-form-item label="外键列名" prop="foreignKey">
        <el-select
            v-model="formData.foreignKey"
            filterable
            style="width: 100%"
            placeholder="选择当前业务对象的字段"
        >
          <el-option
              v-for="field in availableFields"
              :key="field.id"
              :label="`${field.fieldName} (${field.fieldCode})`"
              :value="field.fieldCode"
          />
        </el-select>
        <div v-if="fieldTypeMismatch" class="field-type-warning">
          <el-icon style="color: #f56c6c"><WarningFilled /></el-icon>
          <span>字段类型不匹配！外键字段类型为 {{ getFieldType(formData.foreignKey) }}，主表关联字段类型为 BIGINT</span>
        </div>
      </el-form-item>

      <!-- 主表关联列 -->
      <el-form-item label="主表关联列" prop="targetKey">
        <el-select
            v-model="formData.targetKey"
            style="width: 100%"
            placeholder="选择目标业务对象的关联字段"
        >
          <el-option
              v-for="key in targetKeys"
              :key="key.value"
              :label="key.label"
              :value="key.value"
          />
        </el-select>
      </el-form-item>

      <!-- 关联名称 -->
      <el-form-item label="关联名称" prop="relationName">
        <el-input
            v-model="formData.relationName"
            placeholder="如：申请人信息"
            maxlength="50"
            show-word-limit
        />
      </el-form-item>

      <!-- 级联删除 -->
      <el-form-item label="级联删除">
        <el-switch v-model="formData.cascadeDelete" />
        <span class="form-tip">默认关闭，开启后删除主表数据将同步删除关联数据</span>
      </el-form-item>

      <!-- 关联状态 -->
      <el-form-item label="关联状态">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 关联说明 -->
      <el-form-item label="关联说明">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请填写关联的业务用途，方便后续维护、审计"
            maxlength="200"
            show-word-limit
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  relationData: Object,
  fieldList: {
    type: Array,
    default: () => []
  },
  availableObjects: {
    type: Array,
    default: () => []
  },
  businessDomain: {
    type: String,
    default: 'hr'
  },
  isVersionEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref(null)
const loading = ref(false)

const isEdit = computed(() => !!props.relationData?.id)

const formData = ref({
  id: null,
  relationName: '',
  relationType: 'many-to-one',
  targetObject: '',
  foreignKey: '',
  targetKey: '',
  cascadeDelete: false,
  status: 'enabled',
  description: ''
})

// 可用字段（当前业务对象的字段）
const availableFields = computed(() => {
  return props.fieldList.filter(f => !f.system)
})

// 目标表主键列表
const targetKeys = ref([
  { label: '主键ID (id)', value: 'id' },
  { label: '员工编号 (employee_no)', value: 'employee_no' }
])

// 跨域警告
const crossDomainWarning = computed(() => {
  if (!formData.value.targetObject) return false
  const targetObj = props.availableObjects.find(o => o.name === formData.value.targetObject)
  return targetObj && targetObj.domain !== props.businessDomain
})

// 字段类型不匹配警告
const fieldTypeMismatch = computed(() => {
  if (!formData.value.foreignKey) return false
  // 模拟类型校验逻辑
  return false
})

const formRules = {
  relationType: [
    { required: true, message: '请选择关联类型', trigger: 'change' }
  ],
  targetObject: [
    { required: true, message: '请选择关联业务对象', trigger: 'change' }
  ],
  foreignKey: [
    { required: true, message: '请选择外键列名', trigger: 'change' }
  ],
  targetKey: [
    { required: true, message: '请选择主表关联列', trigger: 'change' }
  ],
  relationName: [
    { required: true, message: '请输入关联名称', trigger: 'blur' },
    { max: 50, message: '关联名称不能超过50个字符', trigger: 'blur' }
  ]
}

// 监听弹窗打开
watch(dialogVisible, (val) => {
  if (val) {
    initForm()
  }
})

// 初始化表单
const initForm = () => {
  if (props.relationData) {
    formData.value = { ...props.relationData }
  } else {
    formData.value = {
      id: null,
      relationName: '',
      relationType: 'many-to-one',
      targetObject: '',
      foreignKey: '',
      targetKey: '',
      cascadeDelete: false,
      status: 'enabled',
      description: ''
    }
  }
}

// 关联类型变更
const handleRelationTypeChange = (type) => {
  // 根据关联类型自动填充关联名称
  if (!formData.value.relationName) {
    const nameMap = {
      'many-to-one': '关联信息',
      'one-to-many': '明细信息',
      'one-to-one': '关联信息',
      'many-to-many': '关联信息'
    }
    formData.value.relationName = nameMap[type] || '关联信息'
  }
}

// 目标业务对象变更
const handleTargetObjectChange = (target) => {
  const targetObj = props.availableObjects.find(o => o.name === target)
  if (targetObj) {
    // 根据目标对象加载主表关联列
    targetKeys.value = [
      { label: '主键ID (id)', value: 'id' },
      { label: `${targetObj.name}编号`, value: `${targetObj.domain}_no` }
    ]
  }
}

// 获取字段类型
const getFieldType = (fieldCode) => {
  const field = props.fieldList.find(f => f.fieldCode === fieldCode)
  return field?.dataType || '未知'
}

// 确认
const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 检查字段类型匹配
    if (fieldTypeMismatch.value) {
      ElMessage.error('外键字段类型与主表关联字段类型不匹配，请修改')
      loading.value = false
      return
    }

    setTimeout(() => {
      loading.value = false
      emit('confirm', { ...formData.value })
      handleClose()
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
  }
}

// 关闭
const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped lang="scss">
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.field-type-warning {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
}
</style>
