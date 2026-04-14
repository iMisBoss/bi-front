<template>
  <el-dialog
      v-model="visible"
      title="群组成员管理"
      width="900px"
      :close-on-click-modal="false"
      @close="handleClose"
  >
    <el-alert
        v-if="group?.isSystem"
        title="系统群组成员自动同步全公司人员，禁止手动修改"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px"
    />

    <div class="members-container">
      <!-- 左侧：已加入成员 -->
      <div class="members-left">
        <div class="members-header">
          <h4>已加入成员（{{ currentMembers.length }}人）</h4>
          <el-button
              v-if="!group?.isSystem"
              type="danger"
              size="small"
              :disabled="selectedMembers.length === 0"
              @click="handleBatchRemove"
          >
            批量移除
          </el-button>
        </div>
        <el-table
            :data="currentMembers"
            border
            @selection-change="handleMemberSelectionChange"
            max-height="400"
        >
          <el-table-column v-if="!group?.isSystem" type="selection" width="50" />
          <el-table-column label="姓名" width="100">
            <template #default="{ row }">
              {{ row.name }}
            </template>
          </el-table-column>
          <el-table-column prop="employeeNo" label="工号" width="100" />
          <el-table-column prop="department" label="部门" />
        </el-table>
      </div>

      <!-- 中间操作按钮 -->
      <div class="members-actions" v-if="!group?.isSystem">
        <el-button type="primary" @click="handleAddMembers">
          添加成员 &gt;
        </el-button>
      </div>

      <!-- 右侧：人员选择器 -->
      <div class="members-right" v-if="showAddPanel">
        <div class="members-header">
          <h4>选择人员</h4>
          <el-button size="small" @click="showAddPanel = false">取消</el-button>
        </div>

        <el-input
            v-model="searchKeyword"
            placeholder="搜索姓名/工号"
            prefix-icon="Search"
            clearable
            style="margin-bottom: 12px"
        />

        <el-tree
            :data="departmentTree"
            :props="{ label: 'name', children: 'children' }"
            node-key="id"
            default-expand-all
            @node-click="handleDeptClick"
        />

        <el-divider />

        <el-table
            :data="filteredAvailableUsers"
            border
            @selection-change="handleAvailableSelectionChange"
            max-height="200"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="name" label="姓名" width="100" />
          <el-table-column prop="employeeNo" label="工号" width="100" />
          <el-table-column prop="department" label="部门" />
        </el-table>

        <div class="members-footer">
          <el-button size="small" @click="showAddPanel = false">取消</el-button>
          <el-button
              type="primary"
              size="small"
              :disabled="selectedAvailableUsers.length === 0"
              @click="handleConfirmAdd"
          >
            添加选中（{{ selectedAvailableUsers.length }}）
          </el-button>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ group?.isSystem ? '关闭' : '取消' }}</el-button>
        <el-button v-if="!group?.isSystem" type="primary" @click="handleConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  group: {
    type: Object,
    default: null
  },
  allUsers: {
    type: Array,
    default: () => []
  },
  departmentTree: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = ref(props.modelValue)
const showAddPanel = ref(false)
const searchKeyword = ref('')
const selectedDeptId = ref(null)
const currentMembers = ref([])
const selectedMembers = ref([])
const selectedAvailableUsers = ref([])

const filteredAvailableUsers = computed(() => {
  let data = props.allUsers.filter(user => {
    return !currentMembers.value.find(m => m.id === user.id)
  })

  if (searchKeyword.value) {
    data = data.filter(user =>
        user.name?.includes(searchKeyword.value) ||
        user.employeeNo?.includes(searchKeyword.value)
    )
  }

  if (selectedDeptId.value) {
    data = data.filter(user => {
      return isUserInDepartment(user, selectedDeptId.value)
    })
  }

  return data
})

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && props.group) {
    // 将字符串数组或对象数组转换为完整的用户对象
    currentMembers.value = (props.group.members || []).map(member => {
      // 如果已经是对象，直接返回
      if (typeof member === 'object' && member.id) {
        return member
      }
      // 如果是字符串，根据姓名查找用户对象
      if (typeof member === 'string') {
        return props.allUsers.find(user => user.name === member) || {
          id: Date.now() + Math.random(),
          name: member,
          employeeNo: '-',
          department: '-'
        }
      }
      return member
    }).filter(Boolean)
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const isUserInDepartment = (user, deptId) => {
  if (deptId === 0) return true // ✅ 根节点，返回所有用户

  // 递归查找部门及其子部门
  const findDepartmentAndChildren = (nodes, targetId) => {
    const deptIds = []

    const traverse = (nodeList) => {
      for (const node of nodeList) {
        if (node.id === targetId) {
          deptIds.push(node.id)
          if (node.children && node.children.length > 0) {
            traverse(node.children) // ✅ 递归查找所有子部门
          }
        } else if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      }
    }

    traverse(nodes)
    return deptIds
  }

  const departmentIds = findDepartmentAndChildren(props.departmentTree, deptId)
  return departmentIds.includes(user.departmentId) // ✅ 判断用户是否在这些部门中
}

const handleDeptClick = (data) => {
  selectedDeptId.value = data.id
}

const handleMemberSelectionChange = (selection) => {
  selectedMembers.value = selection
}

const handleAvailableSelectionChange = (selection) => {
  selectedAvailableUsers.value = selection
}

const handleAddMembers = () => {
  showAddPanel.value = true
}

const handleConfirmAdd = () => {
  currentMembers.value.push(...selectedAvailableUsers.value)
  selectedAvailableUsers.value = []
  showAddPanel.value = false
  ElMessage.success('添加成功')
}

const handleBatchRemove = () => {
  currentMembers.value = currentMembers.value.filter(member => {
    return !selectedMembers.value.find(selected => selected.id === member.id)
  })
  selectedMembers.value = []
  ElMessage.success('移除成功')
}

const handleConfirm = () => {
  emit('confirm', currentMembers.value)
  visible.value = false
}

const handleClose = () => {
  visible.value = false
  showAddPanel.value = false
  currentMembers.value = []
  selectedMembers.value = []
  selectedAvailableUsers.value = []
  searchKeyword.value = ''
  selectedDeptId.value = null
}
</script>

<style lang="scss" scoped>
.members-container {
  display: flex;
  gap: 16px;
  min-height: 400px;

  .members-left,
  .members-right {
    flex: 1;
    display: flex;
    flex-direction: column;

    .members-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      h4 {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }

  .members-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .members-footer {
    margin-top: 12px;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
