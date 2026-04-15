<template>
  <div class="approval-rule-management">
    <div class="action-bar">
      <el-alert
          title="配置会议室预约的审批流程，支持多级审批和按条件触发（会议室/会议类型/时长）"
          type="info"
          :closable="false"
          show-icon
          style="flex: 1"
      />
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加规则
      </el-button>
    </div>

    <el-table :data="ruleList" border stripe style="margin-top: 16px">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="name" label="规则名称" width="200" show-overflow-tooltip />
      <el-table-column label="触发条件" min-width="250">
        <template #default="{ row }">
          <div class="condition-display">
            <el-tag size="small" :type="row.condition.type === 'room' ? 'primary' : 'success'">
              {{ row.condition.type === 'room' ? '会议室' : '会议类型' }}
            </el-tag>
            <span class="condition-text">{{ row.condition.value }}</span>
          </div>
          <div v-if="row.condition.hasDurationLimit" class="condition-display">
            <el-tag size="small" type="warning">时长</el-tag>
            <span class="condition-text">超过 {{ row.condition.duration }} 小时</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="审批节点" min-width="300">
        <template #default="{ row }">
          <el-steps direction="vertical" :active="0" size="small" class="approval-steps">
            <el-step
                v-for="(node, index) in row.approvalNodes"
                :key="index"
                :title="node.name"
                :description="node.approvers.join('、')"
            />
          </el-steps>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityType(row.priority)">
            {{ getPriorityText(row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.enabled"
              @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="success" size="small" @click="handleCopy(row)">
            复制
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑规则对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form
          :model="ruleForm"
          :rules="ruleRules"
          ref="ruleFormRef"
          label-width="120px"
      >
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="如：大会议室审批规则" />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-select v-model="ruleForm.priority" placeholder="请选择" style="width: 100%">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
        </el-form-item>

        <el-divider content-position="left">触发条件</el-divider>

        <el-form-item label="条件类型" prop="condition.type">
          <el-radio-group v-model="ruleForm.condition.type">
            <el-radio value="room">会议室</el-radio>
            <el-radio value="type">会议类型</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="条件值" prop="condition.value">
          <el-select
              v-if="ruleForm.condition.type === 'room'"
              v-model="ruleForm.condition.value"
              placeholder="请选择会议室"
              style="width: 100%"
              filterable
          >
            <el-option
                v-for="room in roomOptions"
                :key="room.id"
                :label="room.name"
                :value="room.name"
            />
          </el-select>
          <el-select
              v-else
              v-model="ruleForm.condition.value"
              placeholder="请选择会议类型"
              style="width: 100%"
              filterable
          >
            <el-option
                v-for="type in meetingTypeOptions"
                :key="type.code"
                :label="type.name"
                :value="type.name"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="时长条件">
          <el-switch v-model="ruleForm.condition.hasDurationLimit" />
          <span style="margin-left: 12px">超过指定时长需要审批</span>
        </el-form-item>

        <el-form-item label="时长限制" v-if="ruleForm.condition.hasDurationLimit">
          <el-input-number
              v-model="ruleForm.condition.duration"
              :min="1"
              :max="24"
              :step="0.5"
          />
          <span style="margin-left: 8px">小时</span>
        </el-form-item>

        <el-divider content-position="left">审批节点配置</el-divider>

        <el-form-item label="审批流程">
          <div class="approval-nodes-config">
            <div
                v-for="(node, index) in ruleForm.approvalNodes"
                :key="index"
                class="node-card"
            >
              <div class="node-header">
                <span class="node-badge">节点 {{ index + 1 }}</span>
                <el-button
                    link
                    type="danger"
                    size="small"
                    @click="removeNode(index)"
                    v-if="ruleForm.approvalNodes.length > 1"
                >
                  删除节点
                </el-button>
              </div>
              <el-form-item label="节点名称" :prop="`approvalNodes.${index}.name`">
                <el-input v-model="node.name" placeholder="如：部门审批" />
              </el-form-item>
              <el-form-item label="审批人" :prop="`approvalNodes.${index}.approvers`">
                <el-select
                    v-model="node.approvers"
                    placeholder="请选择审批人"
                    multiple
                    style="width: 100%"
                    filterable
                >
                  <el-option label="张经理 - 行政部" value="zhang_manager" />
                  <el-option label="李总监 - 技术部" value="li_director" />
                  <el-option label="王主任 - 产品部" value="wang_director" />
                  <el-option label="赵总 - 总裁办" value="zhao_ceo" />
                </el-select>
              </el-form-item>
            </div>
            <el-button
                type="primary"
                plain
                @click="addNode"
                style="width: 100%; margin-top: 12px"
            >
              <el-icon><Plus /></el-icon>
              添加审批节点
            </el-button>
          </div>
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

const ruleList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const editingRule = ref(null)
const ruleFormRef = ref(null)

const roomOptions = ref([
  { id: 'room101', name: '大会议室-A101' },
  { id: 'room102', name: '小会议室-A102' },
  { id: 'room201', name: '研发部会议室' },
  { id: 'room_exec1', name: '高管会议室-E01' }
])

const meetingTypeOptions = ref([
  { code: 'dept_meeting', name: '部门例会' },
  { code: 'project_review', name: '项目评审' },
  { code: 'interview', name: '面试' }
])

const ruleForm = reactive({
  name: '',
  priority: 'medium',
  enabled: true,
  condition: {
    type: 'room',
    value: '',
    hasDurationLimit: false,
    duration: 2
  },
  approvalNodes: [
    { name: '审批节点1', approvers: [] }
  ]
})

const ruleRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  'condition.type': [{ required: true, message: '请选择条件类型', trigger: 'change' }],
  'condition.value': [{ required: true, message: '请选择条件值', trigger: 'change' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  ruleList.value = [
    {
      id: 1,
      name: '大会议室审批规则',
      priority: 'high',
      enabled: true,
      condition: {
        type: 'room',
        value: '大会议室-A101',
        hasDurationLimit: false
      },
      approvalNodes: [
        { name: '行政审批', approvers: ['张经理 - 行政部'] },
        { name: '部门负责人审批', approvers: ['李总监 - 技术部'] }
      ]
    },
    {
      id: 2,
      name: '超时会议审批规则',
      priority: 'medium',
      enabled: true,
      condition: {
        type: 'type',
        value: '部门例会',
        hasDurationLimit: true,
        duration: 2
      },
      approvalNodes: [
        { name: '部门负责人审批', approvers: ['李总监 - 技术部'] }
      ]
    }
  ]
}

const getPriorityType = (priority) => {
  const types = { high: 'danger', medium: 'warning', low: 'info' }
  return types[priority] || 'info'
}

const getPriorityText = (priority) => {
  const texts = { high: '高', medium: '中', low: '低' }
  return texts[priority] || '未知'
}

const handleAdd = () => {
  editingRule.value = null
  dialogTitle.value = '添加审批规则'
  ruleForm.name = ''
  ruleForm.priority = 'medium'
  ruleForm.enabled = true
  ruleForm.condition = {
    type: 'room',
    value: '',
    hasDurationLimit: false,
    duration: 2
  }
  ruleForm.approvalNodes = [
    { name: '审批节点1', approvers: [] }
  ]
  dialogVisible.value = true
}

const handleEdit = (row) => {
  editingRule.value = row
  dialogTitle.value = '编辑审批规则'
  Object.assign(ruleForm, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleCopy = (row) => {
  editingRule.value = null
  dialogTitle.value = '复制审批规则'
  const copied = JSON.parse(JSON.stringify(row))
  copied.name = copied.name + ' (复制)'
  Object.assign(ruleForm, copied)
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除规则"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = ruleList.value.findIndex(r => r.id === row.id)
    if (index > -1) {
      ruleList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleStatusChange = (row) => {
  ElMessage.success(row.enabled ? '规则已启用' : '规则已禁用')
}

const addNode = () => {
  ruleForm.approvalNodes.push({
    name: `审批节点${ruleForm.approvalNodes.length + 1}`,
    approvers: []
  })
}

const removeNode = (index) => {
  ruleForm.approvalNodes.splice(index, 1)
}

const handleSave = () => {
  ruleFormRef.value.validate((valid) => {
    if (valid) {
      if (editingRule.value) {
        const index = ruleList.value.findIndex(r => r.id === editingRule.value.id)
        if (index > -1) {
          ruleList.value[index] = { ...ruleForm, id: editingRule.value.id }
        }
        ElMessage.success('修改成功')
      } else {
        const newRule = {
          ...ruleForm,
          id: Date.now()
        }
        ruleList.value.push(newRule)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
    }
  })
}

defineExpose({ loadData })
</script>

<style scoped lang="scss">
.approval-rule-management {
  padding: 16px;

  .action-bar {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .condition-display {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;

    .condition-text {
      font-size: 13px;
      color: #606266;
    }
  }

  .approval-steps {
    padding: 8px 0;
  }

  .approval-nodes-config {
    .node-card {
      padding: 16px;
      margin-bottom: 12px;
      background: #f5f7fa;
      border-radius: 6px;
      border: 1px solid #e4e7ed;

      .node-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .node-badge {
          background: #409eff;
          color: #fff;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 600;
        }
      }
    }
  }
}
</style>
