<template>
  <div class="org-detail-panel">
    <h3 class="detail-title">
      {{ node.name }}（部门）
    </h3>
    <div class="detail-actions">
      <el-button size="small" @click="$emit('edit')">编辑</el-button>
      <el-button size="small" @click="$emit('addSubDepartment')">新增下级部门</el-button>
      <el-button size="small" @click="$emit('addPosition')">新增岗位</el-button>
      <el-button size="small" @click="$emit('linkLocation')">关联办公地点</el-button>
      <el-button
          v-if="node.status === 'enabled'"
          size="small"
          type="warning"
          @click="$emit('toggleStatus')"
      >
        禁用
      </el-button>
      <el-button
          v-else
          size="small"
          type="success"
          @click="$emit('toggleStatus')"
      >
        启用
      </el-button>
      <el-button size="small" :disabled="!canDelete" @click="$emit('delete')">删除</el-button>
    </div>

    <el-tabs v-model="localActiveTab" class="detail-tabs" @tab-change="handleTabChange">
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="basicForm" label-width="120px" class="basic-form">
          <el-form-item label="组织名称" required>
            <el-input v-model="basicForm.name" @blur="handleFieldBlur('name')" />
          </el-form-item>
          <el-form-item label="组织编码" required>
            <el-input v-model="basicForm.code" @blur="handleFieldBlur('code')" />
          </el-form-item>
          <el-form-item label="上级组织">
            <el-tree-select
                v-model="basicForm.parentId"
                :data="parentOptions"
                :props="{ value: 'id', label: 'name', children: 'children' }"
                node-key="id"
                value-key="id"
                check-strictly
                :render-after-expand="false"
                clearable
                placeholder="请选择"
            />
          </el-form-item>
          <el-form-item label="负责人">
            <el-select
                v-model="basicForm.leaderIds"
                multiple
                filterable
                placeholder="选择负责人"
                @change="handleFieldBlur('leaderIds')"
            >
              <el-option
                  v-for="person in personnelList"
                  :key="person.id"
                  :label="person.name"
                  :value="person.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" required>
            <el-radio-group v-model="basicForm.status" @change="handleFieldBlur('status')">
              <el-radio label="enabled">启用</el-radio>
              <el-radio label="disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="办公地点">
            <el-select
                v-model="basicForm.locationIds"
                multiple
                placeholder="选择办公地点"
                @change="handleFieldBlur('locationIds')"
            >
              <el-option
                  v-for="location in locationList"
                  :key="location.id"
                  :label="location.name"
                  :value="location.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
                v-model="basicForm.remark"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
                @blur="handleFieldBlur('remark')"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="岗位管理" name="positions">
        <div class="positions-toolbar">
          <el-button type="primary" size="small" @click="$emit('addPositionInline')">新增岗位</el-button>
          <el-button size="small" @click="handleBatchDisablePositions" :disabled="selectedPositions.length === 0">批量禁用</el-button>
          <el-button size="small" @click="handleExportPositions">导出</el-button>
        </div>
        <el-table
            :data="positions"
            border
            @selection-change="handlePositionSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="岗位名称" width="200" />
          <el-table-column prop="code" label="岗位编码" width="150" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="memberCount" label="人数" width="100" />
          <el-table-column label="操作" fixed="right" width="150">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="$emit('editPosition', row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="$emit('deletePosition', row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="成员管理" name="members">
        <div class="members-toolbar">
          <el-button type="primary" size="small" @click="$emit('addMembers')">添加成员</el-button>
          <el-button size="small" @click="$emit('removeMembers')" :disabled="selectedMembers.length === 0">移除成员</el-button>
          <el-input
              v-model="memberSearch"
              placeholder="按姓名、工号搜索"
              size="small"
              style="width: 200px"
              clearable
          />
          <el-select v-model="memberStatusFilter" placeholder="在职状态" size="small" style="width: 100px">
            <el-option label="全部" value="" />
            <el-option label="在职" value="active" />
            <el-option label="离职" value="resigned" />
          </el-select>
        </div>
        <el-table
            :data="filteredMembers"
            border
            @selection-change="handleMemberSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="employeeNo" label="工号" width="120" />
          <el-table-column prop="position" label="岗位" width="150" />
          <el-table-column prop="phone" label="联系方式" width="130" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'info'">
                {{ row.status === 'active' ? '在职' : '离职' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="100">
            <template #default="{ row }">
              <el-button link type="danger" size="small" @click="handleRemoveSingleMember(row)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="操作日志" name="logs">
        <div class="logs-toolbar">
          <el-select v-model="logOperatorFilter" placeholder="操作人" size="small" style="width: 120px" clearable>
            <el-option v-for="op in logOperators" :key="op" :label="op" :value="op" />
          </el-select>
          <el-date-picker
              v-model="logDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              size="small"
              style="width: 240px"
          />
          <el-select v-model="logTypeFilter" placeholder="操作类型" size="small" style="width: 120px" clearable>
            <el-option label="新增" value="create" />
            <el-option label="编辑" value="edit" />
            <el-option label="删除" value="delete" />
            <el-option label="禁用" value="disable" />
            <el-option label="启用" value="enable" />
            <el-option label="拖拽调整" value="drag" />
          </el-select>
          <el-button size="small" @click="handleExportLogs">导出日志</el-button>
        </div>
        <el-table :data="filteredLogs" border>
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="type" label="操作类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getLogTypeTag(row.type)">{{ getLogTypeLabel(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" min-width="300" />
          <el-table-column prop="ip" label="操作IP" width="130" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  node: Object,
  activeTab: String,
  basicForm: Object,
  positions: Array,
  members: Array,
  logs: Array,
  personnelList: Array,
  locationList: Array,
  parentOptions: Array
})

const emit = defineEmits([
  'tabChange', 'fieldBlur', 'edit', 'addSubDepartment', 'addPosition',
  'linkLocation', 'toggleStatus', 'delete', 'addMembers', 'removeMembers',
  'addPositionInline', 'editPosition', 'deletePosition', 'batchDisablePositions',
  'exportPositions', 'exportLogs'
])

const localActiveTab = computed({
  get: () => props.activeTab,
  set: (val) => emit('tabChange', val)
})

const memberSearch = ref('')
const memberStatusFilter = ref('')
const logOperatorFilter = ref('')
const logDateRange = ref([])
const logTypeFilter = ref('')
const selectedMembers = ref([])
const selectedPositions = ref([])

const canDelete = computed(() => {
  return props.node.memberCount === 0 && (!props.node.children || props.node.children.length === 0)
})

const filteredMembers = computed(() => {
  let data = props.members

  if (memberSearch.value) {
    data = data.filter(m =>
        m.name.includes(memberSearch.value) ||
        m.employeeNo.includes(memberSearch.value)
    )
  }

  if (memberStatusFilter.value) {
    data = data.filter(m => m.status === memberStatusFilter.value)
  }

  return data
})

const logOperators = computed(() => {
  return [...new Set(props.logs.map(log => log.operator))]
})

const filteredLogs = computed(() => {
  let data = props.logs

  if (logOperatorFilter.value) {
    data = data.filter(log => log.operator === logOperatorFilter.value)
  }

  if (logTypeFilter.value) {
    data = data.filter(log => log.type === logTypeFilter.value)
  }

  if (logDateRange.value && logDateRange.value.length === 2) {
    const [start, end] = logDateRange.value
    data = data.filter(log => {
      const logTime = new Date(log.time)
      return logTime >= start && logTime <= end
    })
  }

  return data
})

const handleTabChange = (tab) => {
  emit('tabChange', tab)
}

const handleFieldBlur = (field) => {
  emit('fieldBlur', field)
}

const handleMemberSelectionChange = (selection) => {
  selectedMembers.value = selection
}

const handleRemoveSingleMember = (member) => {
  ElMessageBox.confirm(`确定要移除成员「${member.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('移除成功')
    loadNodeDetail(currentNode.value)
  })
}

const handlePositionSelectionChange = (selection) => {
  selectedPositions.value = selection
}

const handleBatchDisablePositions = () => {
  emit('batchDisablePositions', selectedPositions.value)
}

const handleExportPositions = () => {
  emit('exportPositions')
}

const handleExportLogs = () => {
  emit('exportLogs')
}

const getLogTypeTag = (type) => {
  const tags = {
    create: 'success',
    edit: 'primary',
    delete: 'danger',
    disable: 'warning',
    enable: 'success',
    drag: 'info'
  }
  return tags[type] || ''
}

const getLogTypeLabel = (type) => {
  const labels = {
    create: '新增',
    edit: '编辑',
    delete: '删除',
    disable: '禁用',
    enable: '启用',
    drag: '拖拽调整'
  }
  return labels[type] || type
}
</script>

<style lang="scss" scoped>
.org-detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;

  .detail-header {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .detail-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .detail-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }

  .detail-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: auto;
      padding: 16px;
    }
  }

  .basic-form {
    max-width: 800px;
  }

  .positions-toolbar,
  .members-toolbar,
  .logs-toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
