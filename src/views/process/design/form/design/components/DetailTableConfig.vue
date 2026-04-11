<template>
  <el-dialog
      v-model="visible"
      title="明细表列配置"
      width="900px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <div class="detail-config-dialog">
      <el-form label-width="100px" size="small">
        <el-form-item label="表格名称">
          <el-input v-model="tableName" placeholder="请输入表格名称" />
        </el-form-item>
      </el-form>

      <div class="column-list-header">
        <span class="header-title">已配置列列表（支持拖拽排序）</span>
        <el-button type="primary" size="small" icon="Plus" @click="openColumnDrawer()">新增列</el-button>
      </div>

      <el-table
          :data="columns"
          border
          size="small"
          style="width: 100%; margin-top: 12px"
          row-key="code"
      >
        <el-table-column label="排序" width="60" align="center">
          <template #default="{ $index }">
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="label" label="列名" min-width="120" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getColumnTypeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="必填" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.required ? 'success' : 'info'">
              {{ row.required ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="width" label="宽度" width="80" align="center" />
        <el-table-column label="操作" width="140" align="center">
          <template #default="{ row, $index }">
            <el-button size="small" type="primary" link @click="openColumnDrawer(row, $index)">编辑</el-button>
            <el-button
                size="small"
                type="danger"
                link
                @click="deleteColumn($index)"
                :disabled="columns.length <= 1"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>

    <!-- 列配置抽屉 -->
    <el-drawer
        v-model="columnDrawer.visible"
        :title="columnDrawer.isEdit ? '编辑列' : '新增列'"
        size="500px"
        :close-on-click-modal="false"
    >
      <el-form :model="columnDrawer.form" label-width="100px" size="small">
        <el-form-item label="列名称" required>
          <el-input v-model="columnDrawer.form.label" placeholder="如：费用类型" />
        </el-form-item>
        <el-form-item label="列类型" required>
          <el-select v-model="columnDrawer.form.type" style="width: 100%" @change="handleColumnTypeChange">
            <el-option label="文本" value="input" />
            <el-option label="数字" value="number" />
            <el-option label="金额" value="money" />
            <el-option label="下拉选择" value="select" />
            <el-option label="日期" value="date" />
            <el-option label="附件" value="upload" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="columnDrawer.form.type === 'select'" label="数据字典">
          <el-select v-model="columnDrawer.form.dict" placeholder="选择数据字典" style="width: 100%">
            <el-option label="费用类型" value="dict_expense_type" />
            <el-option label="物品类别" value="dict_item_category" />
            <el-option label="交通工具" value="dict_transport" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否必填">
          <el-radio-group v-model="columnDrawer.form.required">
            <el-radio :value="true">是</el-radio>
            <el-radio :value="false">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="列宽度">
          <el-input-number v-model="columnDrawer.form.width" :min="80" :max="500" style="width: 100%" />
        </el-form-item>
        <el-form-item label="占位提示">
          <el-input v-model="columnDrawer.form.placeholder" placeholder="请输入占位提示" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="columnDrawer.visible = false">取消</el-button>
        <el-button type="primary" @click="saveColumnConfig">确定</el-button>
      </template>
    </el-drawer>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Rank } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  field: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = ref(false)
const tableName = ref('')
const columns = ref([])

// 列配置抽屉
const columnDrawer = reactive({
  visible: false,
  isEdit: false,
  editIndex: -1,
  form: {
    label: '',
    type: 'input',
    dict: '',
    required: false,
    width: 150,
    placeholder: ''
  }
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.field) {
    tableName.value = props.field.label
    columns.value = JSON.parse(JSON.stringify(props.field.columns || []))
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const getColumnTypeLabel = (type) => {
  const map = {
    input: '文本',
    number: '数字',
    money: '金额',
    select: '下拉',
    date: '日期',
    upload: '附件'
  }
  return map[type] || type
}

const openColumnDrawer = (column = null, index = -1) => {
  if (column) {
    columnDrawer.isEdit = true
    columnDrawer.editIndex = index
    columnDrawer.form = JSON.parse(JSON.stringify(column))
  } else {
    columnDrawer.isEdit = false
    columnDrawer.editIndex = -1
    columnDrawer.form = {
      code: 'col_' + Date.now().toString(36),
      label: '',
      type: 'input',
      dict: '',
      required: false,
      width: 150,
      placeholder: ''
    }
  }
  columnDrawer.visible = true
}

const handleColumnTypeChange = (type) => {
  if (type !== 'select') {
    columnDrawer.form.dict = ''
  }
}

const saveColumnConfig = () => {
  if (!columnDrawer.form.label) {
    ElMessage.warning('请输入列名称')
    return
  }

  if (columnDrawer.isEdit) {
    columns.value[columnDrawer.editIndex] = JSON.parse(JSON.stringify(columnDrawer.form))
    ElMessage.success('列配置已更新')
  } else {
    columns.value.push(JSON.parse(JSON.stringify(columnDrawer.form)))
    ElMessage.success('列已添加')
  }

  columnDrawer.visible = false
}

const deleteColumn = (index) => {
  columns.value.splice(index, 1)
  ElMessage.success('列已删除')
}

const handleSave = () => {
  if (!tableName.value) {
    ElMessage.warning('请输入表格名称')
    return
  }

  emit('save', {
    tableName: tableName.value,
    columns: columns.value
  })

  visible.value = false
  ElMessage.success('明细表配置已保存')
}

const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.detail-config-dialog {
  .column-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;

    .header-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .drag-handle {
    cursor: move;
    color: #909399;
  }
}
</style>