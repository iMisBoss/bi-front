<template>
  <div class="meeting-type-management">
    <div class="action-bar">
      <el-alert
          title="配置会议类型及对应的默认规则（时长、审批要求等），不同类型可设置不同的使用策略"
          type="info"
          :closable="false"
          show-icon
          style="flex: 1"
      />
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加类型
      </el-button>
    </div>

    <el-table :data="typeList" border stripe style="margin-top: 16px">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="标识" width="100" align="center">
        <template #default="{ row }">
          <div class="color-indicator">
            <div class="color-block" :style="{ backgroundColor: row.color }"></div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="类型名称" width="150" />
      <el-table-column prop="code" label="类型编码" width="150" />
      <el-table-column prop="defaultDuration" label="默认时长" width="120" align="center">
        <template #default="{ row }">
          {{ row.defaultDuration }} 小时
        </template>
      </el-table-column>
      <el-table-column prop="maxDuration" label="最大时长" width="120" align="center">
        <template #default="{ row }">
          {{ row.maxDuration }} 小时
        </template>
      </el-table-column>
      <el-table-column label="需要审批" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.needApproval ? 'warning' : 'success'">
            {{ row.needApproval ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑类型对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="typeForm"
          :rules="typeRules"
          ref="typeFormRef"
          label-width="120px"
      >
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="typeForm.name" placeholder="如：部门例会" />
        </el-form-item>

        <el-form-item label="类型编码" prop="code">
          <el-input v-model="typeForm.code" placeholder="如：dept_meeting" />
          <div class="form-tip">用于系统识别，建议使用英文+下划线</div>
        </el-form-item>

        <el-form-item label="标识颜色" prop="color">
          <el-color-picker v-model="typeForm.color" show-alpha />
        </el-form-item>

        <el-form-item label="默认时长" prop="defaultDuration">
          <el-input-number
              v-model="typeForm.defaultDuration"
              :min="0.5"
              :max="8"
              :step="0.5"
          />
          <span style="margin-left: 8px">小时</span>
        </el-form-item>

        <el-form-item label="最大预约时长" prop="maxDuration">
          <el-input-number
              v-model="typeForm.maxDuration"
              :min="1"
              :max="24"
              :step="1"
          />
          <span style="margin-left: 8px">小时</span>
        </el-form-item>

        <el-form-item label="需要审批" prop="needApproval">
          <el-switch v-model="typeForm.needApproval" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
              v-model="typeForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入该会议类型的说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const emit = defineEmits(['refresh'])

const typeList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingType = ref(null)
const typeFormRef = ref(null)

const typeForm = reactive({
  name: '',
  code: '',
  color: '#409EFF',
  defaultDuration: 1,
  maxDuration: 2,
  needApproval: false,
  description: ''
})

const typeRules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
  color: [{ required: true, message: '请选择标识颜色', trigger: 'change' }],
  defaultDuration: [{ required: true, message: '请输入默认时长', trigger: 'blur' }],
  maxDuration: [{ required: true, message: '请输入最大预约时长', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  typeList.value = [
    {
      name: '部门例会',
      code: 'dept_meeting',
      color: '#409EFF',
      defaultDuration: 1,
      maxDuration: 2,
      needApproval: false,
      description: '各部门内部例会，无需审批'
    },
    {
      name: '项目评审',
      code: 'project_review',
      color: '#67C23A',
      defaultDuration: 2,
      maxDuration: 4,
      needApproval: true,
      description: '项目评审会议，需部门负责人审批'
    },
    {
      name: '面试',
      code: 'interview',
      color: '#E6A23C',
      defaultDuration: 1,
      maxDuration: 2,
      needApproval: false,
      description: '面试安排，HR可直接预约'
    },
    {
      name: '培训会议',
      code: 'training',
      color: '#909399',
      defaultDuration: 2,
      maxDuration: 4,
      needApproval: true,
      description: '内部培训会议，需行政审批'
    }
  ]
}

const handleAdd = () => {
  editingType.value = null
  dialogTitle.value = '添加会议类型'
  typeForm.name = ''
  typeForm.code = ''
  typeForm.color = '#409EFF'
  typeForm.defaultDuration = 1
  typeForm.maxDuration = 2
  typeForm.needApproval = false
  typeForm.description = ''
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editingType.value = row
  dialogTitle.value = '编辑会议类型'
  Object.assign(typeForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除会议类型"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = typeList.value.findIndex(t => t.code === row.code)
    if (index > -1) {
      typeList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSave = () => {
  typeFormRef.value.validate((valid) => {
    if (valid) {
      if (editingType.value) {
        const index = typeList.value.findIndex(t => t.code === editingType.value.code)
        if (index > -1) {
          typeList.value[index] = { ...typeForm }
        }
        ElMessage.success('修改成功')
      } else {
        typeList.value.push({ ...typeForm })
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

defineExpose({ loadData })
</script>

<style scoped lang="scss">
.meeting-type-management {
  padding: 16px;

  .action-bar {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .color-indicator {
    display: flex;
    justify-content: center;

    .color-block {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
