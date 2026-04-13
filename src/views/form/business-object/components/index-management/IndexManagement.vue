<template>
  <div class="index-management">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Plus" @click="handleAddIndex">新增索引</el-button>
      </div>
    </div>

    <el-table :data="indexList" border style="width: 100%" max-height="400">
      <el-table-column prop="indexName" label="索引名称" min-width="180" />
      <el-table-column prop="indexType" label="索引类型" width="120">
        <template #default="{ row }">
          <el-tag size="small" :type="getIndexTypeTag(row.indexType)">
            {{ getIndexTypeText(row.indexType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="fields" label="包含字段" min-width="200">
        <template #default="{ row }">
          <div class="index-fields">
            <el-tag v-for="field in row.fields" :key="field" size="small" type="primary">
              {{ field }}
            </el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="索引描述" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="180" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button
                v-if="!row.system"
                size="small"
                type="primary"
                icon="Edit"
                @click="handleEditIndex(row)"
            >
              编辑
            </el-button>
            <el-button
                v-if="!row.system && (!isVersionEdit || row.isNewIndex)"
                size="small"
                type="danger"
                icon="Delete"
                @click="handleDeleteIndex(row)"
            >
              删除
            </el-button>
            <el-tag v-if="row.system" size="small" type="info" effect="plain">
              <el-icon><Lock /></el-icon>
              系统索引
            </el-tag>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑索引对话框 -->
    <el-dialog
        v-model="indexDialogVisible"
        :title="isEditMode ? '编辑索引' : '新增索引'"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="100px"
      >
        <el-form-item label="索引名称" prop="indexName">
          <el-input
              v-model="formData.indexName"
              placeholder="请输入索引名称，例如：idx_bill_no"
              maxlength="50"
              show-word-limit
          />
        </el-form-item>

        <el-form-item label="索引类型" prop="indexType">
          <el-select v-model="formData.indexType" style="width: 100%" @change="handleIndexTypeChange">
            <el-option label="普通索引" value="NORMAL" />
            <el-option label="唯一索引" value="UNIQUE" />
            <el-option label="复合索引" value="COMPOSITE" />
            <el-option label="全文索引" value="FULLTEXT" />
          </el-select>
        </el-form-item>

        <el-form-item label="包含字段" prop="fields">
          <el-select
              v-model="formData.fields"
              multiple
              filterable
              placeholder="请选择字段（支持多选）"
              style="width: 100%"
          >
            <el-option
                v-for="field in availableFields"
                :key="field.fieldCode"
                :label="`${field.fieldName} (${field.fieldCode})`"
                :value="field.fieldCode"
            />
          </el-select>
          <div class="field-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>复合索引建议选择 2-3 个字段，字段顺序影响查询性能</span>
          </div>
        </el-form-item>

        <el-form-item label="索引描述">
          <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="请描述该索引的用途和优化场景"
              maxlength="200"
              show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="indexDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveIndex" :loading="saving">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  isVersionEdit: {
    type: Boolean,
    default: false
  },
  // 从父组件传入的字段列表
  fieldList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['change'])

const indexList = ref([
  {
    id: 1,
    indexName: 'idx_bill_no',
    indexType: 'UNIQUE',
    fields: ['bill_no'],
    description: '单据编号唯一索引，保证单据编号全局唯一',
    status: 'enabled',
    system: true,
    isNewIndex: false
  },
  {
    id: 2,
    indexName: 'idx_applicant',
    indexType: 'NORMAL',
    fields: ['applicant_id'],
    description: '申请人查询索引，优化按申请人查询性能',
    status: 'enabled',
    system: true,
    isNewIndex: false
  },
  {
    id: 3,
    indexName: 'idx_apply_date',
    indexType: 'NORMAL',
    fields: ['apply_date'],
    description: '申请日期索引，优化按日期范围查询',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 4,
    indexName: 'idx_license_plate',
    indexType: 'UNIQUE',
    fields: ['license_plate'],
    description: '车牌号唯一索引，防止重复申请',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 5,
    indexName: 'idx_status_date',
    indexType: 'COMPOSITE',
    fields: ['approval_status', 'apply_date'],
    description: '复合索引，优化按状态和日期联合查询',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 6,
    indexName: 'idx_dept_status',
    indexType: 'COMPOSITE',
    fields: ['apply_dept_id', 'approval_status'],
    description: '复合索引，优化部门审批状态查询',
    status: 'enabled',
    system: false,
    isNewIndex: false
  },
  {
    id: 7,
    indexName: 'idx_vehicle_time',
    indexType: 'COMPOSITE',
    fields: ['vehicle_id', 'start_time', 'end_time'],
    description: '复合索引，优化车辆时间段冲突检测',
    status: 'enabled',
    system: false,
    isNewIndex: false
  }
])

// 对话框相关
const indexDialogVisible = ref(false)
const isEditMode = ref(false)
const saving = ref(false)
const formRef = ref(null)

// 表单数据
const formData = ref({
  id: null,
  indexName: '',
  indexType: 'NORMAL',
  fields: [],
  description: ''
})

// 表单验证规则
const formRules = {
  indexName: [
    { required: true, message: '请输入索引名称', trigger: 'blur' },
    { max: 50, message: '索引名称不能超过50个字符', trigger: 'blur' },
    { pattern: /^idx_[a-z_]+$/, message: '索引名称格式不正确，应以 idx_ 开头', trigger: 'blur' }
  ],
  indexType: [
    { required: true, message: '请选择索引类型', trigger: 'change' }
  ],
  fields: [
    { required: true, message: '请选择包含字段', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少选择一个字段'))
        } else if (value.length > 5) {
          callback(new Error('索引字段不能超过5个'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 可用字段（模拟数据，实际应从父组件传入）
const availableFields = computed(() => {
  if (props.fieldList.length > 0) {
    return props.fieldList
  }
  // 默认模拟字段
  return [
    { fieldName: '单据编号', fieldCode: 'bill_no', dataType: 'String' },
    { fieldName: '申请人', fieldCode: 'applicant_id', dataType: 'String' },
    { fieldName: '车牌号码', fieldCode: 'license_plate', dataType: 'String' },
    { fieldName: '开始时间', fieldCode: 'start_time', dataType: 'Date' },
    { fieldName: '结束时间', fieldCode: 'end_time', dataType: 'Date' },
    { fieldName: '随行人数', fieldCode: 'passenger_count', dataType: 'Number' },
    { fieldName: '紧急联系人', fieldCode: 'emergency_contact', dataType: 'String' },
    { fieldName: '联系电话', fieldCode: 'contact_phone', dataType: 'String' },
    { fieldName: '用车事由', fieldCode: 'usage_reason', dataType: 'String' },
    { fieldName: '申请日期', fieldCode: 'apply_date', dataType: 'Date' },
    { fieldName: '审批状态', fieldCode: 'approval_status', dataType: 'String' },
    { fieldName: '申请部门', fieldCode: 'apply_dept_id', dataType: 'String' },
    { fieldName: '车辆ID', fieldCode: 'vehicle_id', dataType: 'String' }
  ]
})

const getIndexTypeTag = (type) => {
  const tags = {
    'PRIMARY': 'danger',
    'UNIQUE': 'warning',
    'NORMAL': 'info',
    'COMPOSITE': 'success',
    'FULLTEXT': 'primary'
  }
  return tags[type] || 'info'
}

const getIndexTypeText = (type) => {
  const texts = {
    'PRIMARY': '主键索引',
    'UNIQUE': '唯一索引',
    'NORMAL': '普通索引',
    'COMPOSITE': '复合索引',
    'FULLTEXT': '全文索引'
  }
  return texts[type] || type
}

// 新增索引
const handleAddIndex = () => {
  isEditMode.value = false
  resetForm()
  indexDialogVisible.value = true
}

// 编辑索引
const handleEditIndex = (row) => {
  isEditMode.value = true
  Object.assign(formData.value, {
    id: row.id,
    indexName: row.indexName,
    indexType: row.indexType,
    fields: [...row.fields],
    description: row.description || ''
  })
  indexDialogVisible.value = true
}

// 索引类型变更
const handleIndexTypeChange = () => {
  // 可以添加特定类型的提示或逻辑
}

// 保存索引
const handleSaveIndex = async () => {
  try {
    await formRef.value.validate()
    saving.value = true

    setTimeout(() => {
      if (isEditMode.value) {
        // 编辑模式：更新现有索引
        const index = indexList.value.findIndex(i => i.id === formData.value.id)
        if (index !== -1) {
          Object.assign(indexList.value[index], formData.value)
          if (props.isVersionEdit && !indexList.value[index].isNewIndex) {
            indexList.value[index].changeType = '修改'
          }
        }
        ElMessage.success('修改成功')
      } else {
        // 新增模式：添加新索引
        const newId = Math.max(...indexList.value.map(i => i.id), 0) + 1
        const newIndex = {
          id: newId,
          ...formData.value,
          status: 'enabled',
          system: false,
          isNewIndex: props.isVersionEdit,
          changeType: props.isVersionEdit ? '新增' : undefined
        }
        indexList.value.push(newIndex)
        ElMessage.success('新增成功')
      }

      saving.value = false
      indexDialogVisible.value = false
      emit('change', indexList.value)
    }, 500)
  } catch (error) {
    console.error('验证失败:', error)
    saving.value = false
  }
}

// 删除索引
const handleDeleteIndex = (row) => {
  ElMessageBox.confirm(
      `确定要删除索引"${row.indexName}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    indexList.value = indexList.value.filter(i => i.id !== row.id)
    ElMessage.success('删除成功')
    emit('change', indexList.value)
  }).catch(() => {})
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: null,
    indexName: '',
    indexType: 'NORMAL',
    fields: [],
    description: ''
  }
}

defineExpose({
  indexList
})
</script>

<style scoped lang="scss">
.index-management {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  .index-fields {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .action-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
  }

  .field-tip {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;

    .el-icon {
      font-size: 14px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
}
</style>
