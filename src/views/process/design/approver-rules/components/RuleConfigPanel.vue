<template>
  <div class="rule-config-panel">
    <!-- 当前上下文（不可修改） -->
    <el-alert
        :title="`当前上下文：流程【${currentProcessName}】 > 节点【${currentNodeName}】`"
        type="info"
        show-icon
        :closable="false"
        class="context-banner"
    />

    <!-- Tab 栏 -->
    <el-tabs v-model="activeTab" class="panel-tabs">
      <!-- Tab1: 当前节点配置 -->
      <el-tab-pane label="当前节点配置" name="current">
        <div class="tab-content">
          <!-- 未绑定状态 -->
          <div v-if="!boundRule" class="empty-state">
            <el-empty description="当前节点未配置审批人规则" :image-size="100">
              <template #description>
                <p class="empty-text">请选择以下方式配置：</p>
              </template>
              <div class="empty-actions">
                <el-button type="primary" icon="Link" @click="activeTab = 'global'">选择全局规则</el-button>
                <el-button icon="Plus" @click="activeTab = 'create'">新建流程专属规则</el-button>
              </div>
            </el-empty>
          </div>

          <!-- 已绑定状态 -->
          <div v-else class="bound-rule-card">
            <div class="card-header">
              <h3 class="rule-title">{{ boundRule.ruleName }}</h3>
              <el-tag :type="boundRule.ruleType === 'global' ? 'primary' : 'info'" size="small">
                {{ boundRule.ruleType === 'global' ? '全局通用规则' : '流程专属规则' }}
              </el-tag>
            </div>

            <el-descriptions :column="1" border size="small" class="rule-info">
              <el-descriptions-item label="分配策略">
                <el-tooltip :content="getStrategyDesc(boundRule.strategy)" placement="top">
                  <el-tag size="small">{{ getStrategyText(boundRule.strategy) }}</el-tag>
                </el-tooltip>
              </el-descriptions-item>
              <el-descriptions-item label="审批人配置">
                <el-tooltip :content="boundRule.target" placement="top">
                  <span>{{ boundRule.target }}</span>
                </el-tooltip>
              </el-descriptions-item>
              <el-descriptions-item label="绑定节点">
                <div class="bound-nodes">
                  <el-tag
                      v-for="node in boundRule.boundNodes || [currentNodeName]"
                      :key="node"
                      size="small"
                      style="margin-right: 6px; margin-bottom: 4px"
                  >
                    {{ node }}
                  </el-tag>
                  <el-button
                      v-if="canEditBoundRule && !boundRule.isGlobalRule"
                      size="small"
                      link
                      type="primary"
                      @click="handleManageNodes"
                  >
                    管理绑定节点
                  </el-button>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="优先级">
                <el-tag :type="getPriorityTag(boundRule.priority)" size="small">{{ boundRule.priority }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="规则状态">
                <el-tag :type="boundRule.status === 'enabled' ? 'success' : 'danger'" size="small">
                  {{ boundRule.status === 'enabled' ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 异常提示 -->
            <el-alert
                v-if="boundRule.status === 'disabled'"
                title="该规则已在全局被禁用，请重新配置"
                type="error"
                show-icon
                :closable="false"
                style="margin-top: 12px"
            />

            <!-- 操作按钮区 -->
            <div class="action-buttons">
              <el-button size="small" icon="View" @click="handleViewDetail">查看详情</el-button>
              <el-button
                  size="small"
                  :type="canEditBoundRule ? 'primary' : 'info'"
                  :disabled="!canEditBoundRule"
                  icon="Edit"
                  @click="handleEditRule"
              >
                编辑规则
              </el-button>
              <el-button
                  v-if="!boundRule.isGlobalRule"
                  size="small"
                  type="success"
                  icon="CopyDocument"
                  @click="handleCopyRule"
              >
                复制规则
              </el-button>
              <el-button size="small" type="warning" icon="Promotion" @click="handleTestRule">测试规则</el-button>
              <el-button size="small" type="danger" plain icon="Link" @click="handleUnbind">解绑规则</el-button>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab2: 选择全局规则 -->
      <el-tab-pane label="选择全局规则" name="global">
        <div class="tab-content">
          <!-- 筛选栏 -->
          <div class="filter-bar">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索规则名称"
                clearable
                style="width: 250px"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-select v-model="filterStrategy" placeholder="分配策略" clearable style="width: 160px">
              <el-option label="指定人员" value="specific_user" />
              <el-option label="指定角色" value="specific_role" />
              <el-option label="发起人上级" value="initiator_superior" />
              <el-option label="条件分支" value="condition_branch" />
            </el-select>
            <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
            <el-button icon="Refresh" @click="handleReset">重置</el-button>
          </div>

          <!-- 规则列表 -->
          <el-table
              v-if="filteredGlobalRules.length > 0"
              :data="filteredGlobalRules"
              border
              highlight-current-row
              style="width: 100%"
          >
            <el-table-column type="index" label="#" width="50" align="center" />
            <el-table-column prop="ruleName" label="规则名称" min-width="180" />
            <el-table-column prop="strategy" label="分配策略" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ getStrategyText(row.strategy) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="审批人/角色" min-width="180" show-overflow-tooltip />
            <el-table-column prop="priority" label="优先级" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getPriorityTag(row.priority)" size="small">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button size="small" link type="primary" icon="View" @click="handleViewGlobalDetail(row)">详情</el-button>
                <el-button size="small" link type="success" icon="Link" @click="handleBindRule(row)">绑定</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态引导 -->
          <el-empty v-else description="暂无可用全局规则" :image-size="100">
            <template #description>
              <p class="empty-text">请联系系统管理员在【全局审批人规则引擎】中配置</p>
              <p class="empty-text">或点击下方按钮新建流程专属规则</p>
            </template>
            <div class="empty-actions">
              <el-button type="primary" @click="handleJumpToGlobal">跳转到全局规则引擎</el-button>
              <el-button @click="activeTab = 'create'">新建流程专属规则</el-button>
            </div>
          </el-empty>
        </div>
      </el-tab-pane>

      <!-- Tab3: 新建流程专属规则 -->
      <el-tab-pane label="新建流程专属规则" name="create">
        <div class="tab-content">
          <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="140px">
            <!-- 规则基本信息 -->
            <el-divider content-position="left">规则基本信息</el-divider>
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="createForm.ruleName" placeholder="自动生成前缀，可手动修改" />
              <div class="form-tip">默认前缀：{{ currentProcessName }}-{{ currentNodeName }}-专属规则</div>
            </el-form-item>

            <el-form-item label="规则类型">
              <el-tag type="info" size="default">流程专属规则（仅当前流程可用）</el-tag>
              <div class="form-tip" v-if="isAdmin">
                <el-link type="primary" @click="createForm.allowGlobal = true">切换为全局通用规则（仅管理员）</el-link>
              </div>
            </el-form-item>

            <el-form-item label="适用范围">
              <el-input :value="`仅当前流程：${currentProcessName}`" readonly />
            </el-form-item>

            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="createForm.priority" :min="1" :max="100" style="width: 100%" />
            </el-form-item>

            <el-form-item label="规则状态">
              <el-radio-group v-model="createForm.status">
                <el-radio label="enabled">启用</el-radio>
                <el-radio label="disabled">禁用</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 分配策略配置 -->
            <el-divider content-position="left">分配策略配置</el-divider>
            <el-form-item label="分配策略" prop="strategy">
              <el-select v-model="createForm.strategy" placeholder="请选择分配策略" style="width: 100%" @change="handleStrategyChange">
                <el-option label="指定人员" value="specific_user" />
                <el-option label="指定角色" value="specific_role" />
                <el-option label="发起人上级" value="initiator_superior" />
                <el-option label="条件分支" value="condition_branch" />
              </el-select>
            </el-form-item>

            <!-- 动态配置项 -->
            <el-form-item v-if="createForm.strategy === 'specific_user'" label="选择人员">
              <el-select v-model="createForm.targetUser" multiple placeholder="请选择审批人员" style="width: 100%">
                <el-option label="张三" value="zhangsan" />
                <el-option label="李四" value="lisi" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="createForm.strategy === 'specific_role'" label="选择角色">
              <el-select v-model="createForm.targetRole" multiple placeholder="请选择审批角色" style="width: 100%">
                <el-option label="部门经理" value="dept_manager" />
                <el-option label="总经理" value="general_manager" />
              </el-select>
            </el-form-item>

            <!-- 绑定节点配置 -->
            <el-divider content-position="left">绑定节点配置</el-divider>
            <el-form-item label="绑定方式">
              <el-radio-group v-model="createForm.bindMode">
                <el-radio label="single">仅绑定当前节点（{{ currentNodeName }}）</el-radio>
                <el-radio label="multiple">绑定当前流程的多个审批节点</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item v-if="createForm.bindMode === 'multiple'" label="选择节点" prop="boundNodes">
              <el-checkbox-group v-model="createForm.boundNodes">
                <el-checkbox
                    v-for="node in availableNodes"
                    :key="node.nodeId"
                    :label="node.nodeName"
                >
                  {{ node.nodeName }}
                  <el-tag v-if="node.nodeId === currentNodeId" size="small" type="info" style="margin-left: 6px">当前</el-tag>
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="规则说明">
              <el-input v-model="createForm.description" type="textarea" :rows="3" />
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部固定操作栏 -->
    <div class="panel-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button v-if="activeTab === 'create'" type="info" plain @click="handleSaveOnly">仅保存（不绑定）</el-button>
      <el-button type="primary" :loading="saving" @click="handleSave">
        {{ activeTab === 'create' ? '保存并绑定到选中节点' : '保存' }}
      </el-button>
      <el-button type="success" plain icon="Link" @click="handleJumpToGlobal">跳转到全局规则引擎</el-button>
    </div>

    <!-- 子组件弹窗 -->
    <RuleDetailDialog v-model="detailVisible" :rule="currentDetailRule" />
    <RuleTestDialog v-model="testVisible" :rule="boundRule" />
    <BindNodeManager
        v-model="manageNodesVisible"
        :rule="boundRule"
        :available-nodes="availableNodes"
        @confirm="handleConfirmManageNodes"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Link, Plus, View, Edit, CopyDocument, Promotion } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user.js'
import RuleDetailDialog from './RuleDetailDialog.vue'
import RuleTestDialog from './RuleTestDialog.vue'
import BindNodeManager from './BindNodeManager.vue'

const router = useRouter()
const userStore = useUserStore()

// Props
const props = defineProps({
  currentProcessId: { type: String, required: true },
  currentProcessName: { type: String, required: true },
  currentNodeId: { type: String, required: true },
  currentNodeName: { type: String, required: true },
  availableNodes: { type: Array, default: () => [] }
})

const isAdmin = computed(() => userStore.isAdmin)
const activeTab = ref('current')
const boundRule = ref(null)
const saving = ref(false)

// 全局规则数据（实际应从API获取）
const globalRuleList = ref([
  {
    id: 1,
    ruleName: '请假审批-部门经理',
    ruleType: 'global',
    strategy: 'initiator_superior',
    target: '发起人直接上级',
    priority: 10,
    status: 'enabled'
  }
])

// 筛选
const searchKeyword = ref('')
const filterStrategy = ref('')

// 新建表单
const createFormRef = ref(null)
const createForm = ref({
  ruleName: '',
  strategy: '',
  targetUser: [],
  targetRole: [],
  priority: 10,
  status: 'enabled',
  description: '',
  bindMode: 'single',
  boundNodes: [],
  allowGlobal: false
})

// 弹窗状态
const detailVisible = ref(false)
const currentDetailRule = ref(null)
const testVisible = ref(false)
const manageNodesVisible = ref(false)

// 权限计算
const canEditBoundRule = computed(() => {
  if (!boundRule.value) return false
  return boundRule.value.ruleType === 'process' || isAdmin.value
})

// 筛选后的全局规则
const filteredGlobalRules = computed(() => {
  let result = globalRuleList.value.filter(r => r.ruleType === 'global' && r.status === 'enabled')
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(r => r.ruleName.toLowerCase().includes(kw))
  }
  if (filterStrategy.value) {
    result = result.filter(r => r.strategy === filterStrategy.value)
  }
  return result
})

// 表单验证
const createRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  strategy: [{ required: true, message: '请选择分配策略', trigger: 'change' }]
}

// 方法
const handleSearch = () => ElMessage.success('查询完成')
const handleReset = () => {
  searchKeyword.value = ''
  filterStrategy.value = ''
}

const handleBindRule = (row) => {
  ElMessageBox.confirm(`确定将规则「${row.ruleName}」绑定到当前节点吗？`, '绑定确认').then(() => {
    boundRule.value = { ...row, boundNodes: [props.currentNodeName], isGlobalRule: true }
    activeTab.value = 'current'
    ElMessage.success('绑定成功')
  }).catch(() => {})
}

const handleViewDetail = () => {
  currentDetailRule.value = boundRule.value
  detailVisible.value = true
}

const handleViewGlobalDetail = (row) => {
  currentDetailRule.value = row
  detailVisible.value = true
}

const handleEditRule = () => {
  if (boundRule.value.isGlobalRule) {
    ElMessage.info('全局规则仅管理员可编辑，正在跳转...')
    router.push('/process/design/approver-rules')
  } else {
    activeTab.value = 'create'
    createForm.value = { ...boundRule.value }
  }
}

const handleCopyRule = () => {
  activeTab.value = 'create'
  createForm.value = {
    ...boundRule.value,
    ruleName: `${boundRule.value.ruleName}（副本）`,
    bindMode: 'single',
    boundNodes: [props.currentNodeName]
  }
  ElMessage.success('规则已复制，请修改后保存')
}

const handleTestRule = () => {
  testVisible.value = true
}

const handleUnbind = () => {
  ElMessageBox.confirm('确定解绑当前节点的审批人规则吗？', '解绑确认', { type: 'warning' }).then(() => {
    boundRule.value = null
    ElMessage.success('已解绑')
  }).catch(() => {})
}

const handleManageNodes = () => {
  manageNodesVisible.value = true
}

const handleConfirmManageNodes = (nodes) => {
  boundRule.value.boundNodes = nodes
  ElMessage.success('绑定节点已更新')
}

const handleStrategyChange = () => {
  createForm.value.targetUser = []
  createForm.value.targetRole = []
}

const handleSave = async () => {
  if (activeTab.value === 'create') {
    createFormRef.value?.validate(async (valid) => {
      if (!valid) return
      saving.value = true
      await new Promise(resolve => setTimeout(resolve, 500))

      const newRule = {
        id: Date.now(),
        ...createForm.value,
        processName: props.currentProcessName,
        ruleType: createForm.value.allowGlobal && isAdmin.value ? 'global' : 'process',
        boundNodes: createForm.value.bindMode === 'multiple' ? createForm.value.boundNodes : [props.currentNodeName]
      }

      globalRuleList.value.unshift(newRule)
      boundRule.value = { ...newRule }
      activeTab.value = 'current'
      saving.value = false
      ElMessage.success('规则已保存并绑定')
    })
  } else {
    saving.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    saving.value = false
    ElMessage.success('保存成功')
  }
}

const handleSaveOnly = () => {
  ElMessage.success('规则已保存，但未绑定到任何节点')
}

const handleCancel = () => {
  ElMessageBox.confirm('确定放弃未保存的变更吗？', '提示', { type: 'warning' }).then(() => {
    ElMessage.info('已取消')
  }).catch(() => {})
}

const handleJumpToGlobal = () => {
  window.open('#/process/design/approver-rules', '_blank')
}

// 工具方法
const getStrategyText = (strategy) => {
  const texts = { specific_user: '指定人员', specific_role: '指定角色', initiator_superior: '发起人上级', condition_branch: '条件分支' }
  return texts[strategy] || strategy
}

const getStrategyDesc = (strategy) => {
  const descs = {
    specific_user: '指定具体人员作为审批人',
    specific_role: '指定角色，该角色下所有人员均可审批',
    initiator_superior: '自动获取发起人的直接上级',
    condition_branch: '根据表单条件动态分配审批人'
  }
  return descs[strategy] || ''
}

const getPriorityTag = (priority) => {
  if (priority >= 20) return 'danger'
  if (priority >= 10) return 'warning'
  return 'info'
}
</script>

<style scoped lang="scss">
.rule-config-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;

  .context-banner {
    margin-bottom: 16px;
  }

  .panel-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      overflow-y: auto;
    }
  }

  .tab-content {
    padding: 20px;
  }

  .empty-state {
    text-align: center;
    padding: 40px 0;

    .empty-text {
      color: #909399;
      margin: 8px 0 16px;
    }

    .empty-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }
  }

  .bound-rule-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .rule-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .rule-info {
      margin-bottom: 16px;
    }

    .bound-nodes {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      padding: 12px 0;
      border-top: 1px dashed #ebeef5;
      flex-wrap: wrap;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }

  .panel-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 20px;
    border-top: 1px solid #ebeef5;
    background: #fafafa;
  }
}
</style>
