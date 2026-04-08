<template>
  <el-dialog
      v-model="dialogVisible"
      width="700px"
      :close-on-click-modal="false"
      @close="handleClose"
      class="relation-edit-dialog"
      append-to-body
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Connection /></el-icon>
      <div class="header-text">
        <div class="header-title">{{ dialogTitle }}</div>
        <div class="header-subtitle">{{ dialogSubtitle }}</div>
      </div>
    </div>

    <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="edit-form"
    >
      <el-form-item label="关联名称" prop="relationName">
        <el-input
            v-model="formData.relationName"
            placeholder="如：申请人信息、费用明细"
        />
      </el-form-item>

      <el-form-item label="关联类型" prop="relationType">
        <el-select
            v-model="formData.relationType"
            placeholder="请选择关联类型"
            style="width: 100%"
        >
          <el-option label="多对一 (Many-to-One)" value="many_to_one" />
          <el-option label="一对多 (One-to-Many)" value="one_to_many" />
          <el-option label="一对一 (One-to-One)" value="one_to_one" />
          <el-option label="多对多 (Many-to-Many)" value="many_to_many" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联业务对象" prop="targetObject">
        <el-select
            v-model="formData.targetObject"
            placeholder="请选择关联的业务对象"
            style="width: 100%"
        >
          <el-option label="员工信息" value="员工信息" />
          <el-option label="部门信息" value="部门信息" />
          <el-option label="车辆台账" value="车辆台账" />
          <el-option label="驾驶员档案" value="驾驶员档案" />
          <el-option label="用车费用明细" value="用车费用明细" />
          <el-option label="审批流水" value="审批流水" />
          <el-option label="附件管理" value="附件管理" />
        </el-select>
      </el-form-item>

      <el-form-item label="外键列名" prop="foreignKey">
        <el-input
            v-model="formData.foreignKey"
            placeholder="如：applicant_id"
        />
        <div class="tip-text">当前业务对象表中的外键字段名称</div>
      </el-form-item>

      <el-form-item label="主表关联列" prop="primaryKey">
        <el-input
            v-model="formData.primaryKey"
            placeholder="如：id"
        />
        <div class="tip-text">关联业务对象表中的主键字段名称</div>
      </el-form-item>

      <el-form-item label="级联删除">
        <el-switch
            v-model="formData.cascadeDelete"
            active-text="开启"
            inactive-text="关闭"
        />
        <div class="tip-text" :class="{ 'danger-text': formData.cascadeDelete }">
          {{ formData.cascadeDelete ? '⚠️ 删除主表数据将同步删除关联数据，请谨慎操作' : '关闭级联删除，仅解除关联关系' }}
        </div>
      </el-form-item>

      <el-form-item label="状态">
        <el-radio-group v-model="formData.status">
          <el-radio label="enabled">启用</el-radio>
          <el-radio label="disabled">停用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="关联说明">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请描述该关联关系的业务含义"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  relationData: {
    type: Object,
    default: null
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

const dialogTitle = ref('新增关联')
const dialogSubtitle = ref('配置关联关系属性')

const formData = reactive({
  id: null,
  relationName: '',
  relationType: 'many_to_one',
  targetObject: '',
  foreignKey: '',
  primaryKey: 'id',
  cascadeDelete: false,
  status: 'enabled',
  description: '',
  system: false,
  isNewRelation: true,
  changeType: '新增'
})

const formRules = {
  relationName: [
    { required: true, message: '请输入关联名称', trigger: 'blur' },
    { pattern: /^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9_\u4e00-\u9fa5]*$/, message: '关联名称格式不正确', trigger: 'blur' }
  ],
  relationType: [
    { required: true, message: '请选择关联类型', trigger: 'change' }
  ],
  targetObject: [
    { required: true, message: '请选择关联业务对象', trigger: 'change' }
  ],
  foreignKey: [
    { required: true, message: '请输入外键列名', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '只能包含小写字母、数字和下划线', trigger: 'blur' }
  ],
  primaryKey: [
    { required: true, message: '请输入主表关联列', trigger: 'blur' }
  ]
}

// 监听弹窗打开，初始化数据
watch(dialogVisible, (newVal) => {
  if (newVal) {
    if (props.relationData) {
      // 编辑模式：填充数据
      dialogTitle.value = '编辑关联'
      dialogSubtitle.value = '修改关联关系属性'
      Object.assign(formData, { ...props.relationData })
    } else {
      // 新增模式：重置表单
      dialogTitle.value = '新增关联'
      dialogSubtitle.value = '配置关联关系属性'
      resetForm()
    }
  }
})

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.relationName = ''
  formData.relationType = 'many_to_one'
  formData.targetObject = ''
  formData.foreignKey = ''
  formData.primaryKey = 'id'
  formData.cascadeDelete = false
  formData.status = 'enabled'
  formData.description = ''
  formData.system = false
  formData.isNewRelation = true
  formData.changeType = '新增'
  formRef.value?.clearValidate()
}

// 关闭弹窗
const handleClose = () => {
  resetForm()
  emit('update:modelValue', false)
}

// 取消
const handleCancel = () => {
  emit('update:modelValue', false)
}

// 确定
const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟提交
    setTimeout(() => {
      loading.value = false
      emit('confirm', { ...formData })
      emit('update:modelValue', false)
      ElMessage.success(formData.id ? '修改成功' : '新增成功')
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
  }
}
</script>

<style scoped lang="scss">
.relation-edit-dialog {
  .el-dialog__header {
    padding: 0;
    border-bottom: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px 24px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 8px 8px 0 0;
    margin: -24px -24px 20px;

    .header-icon {
      font-size: 28px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 16px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .edit-form {
    padding: 10px 20px;

    .el-form-item {
      margin-bottom: 18px;
    }

    .tip-text {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.4;

      &.danger-text {
        color: #f56c6c;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px 0;
    border-top: 1px solid #ebeef5;
  }
}
</style>
