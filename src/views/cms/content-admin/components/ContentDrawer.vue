<template>
  <el-drawer
      v-model="visible"
      :title="drawerTitle"
      size="800px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>

      <el-form-item label="副标题">
        <el-input v-model="formData.subtitle" placeholder="请输入副标题" />
      </el-form-item>

      <el-form-item label="归属栏目" prop="columnId">
        <el-select v-model="formData.columnId" placeholder="选择栏目" style="width: 100%">
          <el-option label="新闻公告" value="1" />
          <el-option label="公司公告" value="2" />
          <el-option label="部门通知" value="3" />
          <el-option label="规章制度" value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="封面图">
        <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :auto-upload="false"
        >
          <img v-if="formData.cover" :src="formData.cover" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <el-input
            v-model="formData.content"
            type="textarea"
            :rows="8"
            placeholder="请输入内容（支持HTML格式）"
        />
      </el-form-item>

      <el-form-item label="附件">
        <el-upload
            action="#"
            :auto-upload="false"
            multiple
        >
          <el-button type="primary">点击上传</el-button>
          <template #tip>
            <div class="el-upload__tip">
              支持Word/PDF/图片等格式，单文件最大50M
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="可见范围" prop="scope">
        <el-select v-model="formData.scope" placeholder="选择可见范围" style="width: 100%">
          <el-option label="全公司" value="全公司" />
          <el-option label="指定部门" value="指定部门" />
          <el-option label="指定角色" value="指定角色" />
          <el-option label="指定人员" value="指定人员" />
        </el-select>
      </el-form-item>

      <el-form-item label="置顶设置">
        <el-radio-group v-model="formData.top">
          <el-radio :label="false">不置顶</el-radio>
          <el-radio :label="true">置顶</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="生效时间">
        <el-date-picker
            v-model="formData.effectiveTime"
            type="date"
            placeholder="选择生效时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="过期时间">
        <el-date-picker
            v-model="formData.expireTime"
            type="date"
            placeholder="选择过期时间"
            style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="允许评论">
        <el-switch v-model="formData.allowComment" />
      </el-form-item>

      <el-form-item label="允许转发">
        <el-switch v-model="formData.allowForward" />
      </el-form-item>
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
import { Plus } from '@element-plus/icons-vue'

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
  subtitle: '',
  columnId: '',
  cover: '',
  content: '',
  scope: '全公司',
  top: false,
  effectiveTime: '',
  expireTime: '',
  allowComment: true,
  allowForward: true
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  columnId: [{ required: true, message: '请选择归属栏目', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const drawerTitle = computed(() => {
  return formData.id ? '编辑内容' : '新增内容'
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
    subtitle: '',
    columnId: '',
    cover: '',
    content: '',
    scope: '全公司',
    top: false,
    effectiveTime: '',
    expireTime: '',
    allowComment: true,
    allowForward: true
  })
}

const handleSave = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        saving.value = false
        const columnNames = {
          '1': '新闻公告',
          '2': '公司公告',
          '3': '部门通知',
          '4': '规章制度'
        }
        emit('confirm', {
          ...formData,
          column: columnNames[formData.columnId] || '',
          creator: '当前用户',
          status: 'draft'
        })
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

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
    object-fit: cover;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
  }
}
</style>
