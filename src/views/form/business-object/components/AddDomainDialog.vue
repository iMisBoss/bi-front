<template>
  <el-dialog
      v-model="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
      destroy-on-close
      @close="handleClose"
      class="add-domain-dialog"
  >
    <div class="dialog-header">
      <el-icon class="header-icon"><Folder /></el-icon>
      <div class="header-text">
        <div class="header-title">{{ dialogTitle }}</div>
        <div class="header-subtitle">{{ dialogSubtitle }}</div>
      </div>
    </div>

    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="domain-form"
    >
      <el-form-item label="业务域名称" prop="domainName">
        <el-input
            v-model="form.domainName"
            placeholder="请输入业务域名称"
            :prefix-icon="Folder"
        />
      </el-form-item>

      <el-form-item label="上级业务域" prop="parentDomain">
        <el-tree-select
            v-model="form.parentDomain"
            :data="domainTreeData"
            placeholder="选择上级业务域"
            check-strictly
            :render-after-expand="false"
            value-key="id"            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="备注" prop="description">
        <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
            type="primary"
            @click="handleConfirm"
            :loading="loading"
            icon="Check"
        >
          {{ isEditMode ? '保存修改' : '确定' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Folder, Check } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  domainTreeData: Array,
  editData: Object
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const formRef = ref(null)
const loading = ref(false)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 判断是否为编辑模式
const isEditMode = computed(() => {
  return !!props.editData
})

// 弹窗标题
const dialogTitle = computed(() => {
  return isEditMode.value ? '修改业务域' : '新建业务域'
})

// 弹窗副标题
const dialogSubtitle = computed(() => {
  return isEditMode.value ? '修改业务域信息，调整层级关系' : '创建新的业务分类目录，支持多级目录'
})

// 表单数据
const form = reactive({
  domainName: '',
  parentDomain: '',
  description: ''
})

// 表单验证规则
const rules = {
  domainName: [
    { required: true, message: '请输入业务域名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 监听弹窗打开，初始化表单
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    initForm()
  } else {
    formRef.value?.resetFields()
  }
})

// 初始化表单
const initForm = () => {
  if (props.editData) {
    form.domainName = props.editData.label || ''
    form.parentDomain = props.editData.parentId || 'all'
    form.description = props.editData.description || ''
    console.log('编辑模式初始化:', props.editData)
  } else {
    form.domainName = ''
    form.parentDomain = 'all'
    form.description = ''
    console.log('新建模式初始化')
  }
}

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    setTimeout(() => {
      loading.value = false

      const action = isEditMode.value ? '修改' : '新增'
      ElMessage.success(`${action}业务域成功`)

      emit('confirm', {
        action: isEditMode.value ? 'edit' : 'add',
        id: props.editData?.id,
        ...form
      })

      handleClose()
    }, 1000)
  } catch (error) {
    console.error('验证失败:', error)
  }
}
</script>

<style scoped lang="scss">
.add-domain-dialog {
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
      font-size: 32px;
      color: #fff;
      flex-shrink: 0;
    }

    .header-text {
      flex: 1;

      .header-title {
        font-size: 18px;
        font-weight: 600;
        color: #fff;
        margin-bottom: 4px;
      }

      .header-subtitle {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .domain-form {
    padding: 20px;

    .el-form-item {
      margin-bottom: 24px;
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
