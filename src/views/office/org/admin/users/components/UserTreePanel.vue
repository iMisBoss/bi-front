<template>
  <div class="user-tree-panel" :style="{ width: panelWidth + 'px' }">
    <div class="tree-header">
      <h3 class="tree-title">部门机构</h3>
      <div class="tree-actions">
        <el-button-group size="small">
          <el-button @click="handleExpandAll" icon="SortDown">全部展开</el-button>
          <el-button @click="handleCollapseAll" icon="SortUp">全部收起</el-button>
        </el-button-group>
      </div>
    </div>

    <div class="tree-content">
      <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          :default-expand-all="true"
          :highlight-current="true"
          node-key="id"
          @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div class="tree-node" :class="{ 'is-current': data.id === selectedDeptId }">
            <el-icon class="node-icon"><OfficeBuilding /></el-icon>
            <span class="node-name">{{ node.label }}</span>
            <span v-if="data.id !== 0" class="node-count">({{ getNodeUserCount(data.id) }})</span>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { OfficeBuilding, SortDown, SortUp } from '@element-plus/icons-vue'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  selectedDeptId: {
    type: [Number, null],
    default: null
  },
  userList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['node-click', 'expand-all', 'collapse-all'])

const treeRef = ref(null)
const panelWidth = ref(280)

const treeProps = {
  children: 'children',
  label: 'name'
}

const handleNodeClick = (data) => {
  emit('node-click', data.id)
}

const handleExpandAll = () => {
  emit('expand-all')

  const expandNode = (node) => {
    node.expanded = true
    if (node.childNodes?.length) {
      node.childNodes.forEach(expandNode)
    }
  }

  if (treeRef.value) {
    const rootNodes = treeRef.value.store.rootNode.childNodes
    rootNodes.forEach(expandNode)
  }
}

const handleCollapseAll = () => {
  emit('collapse-all')

  const collapseNode = (node) => {
    node.expanded = false
    if (node.childNodes?.length) {
      node.childNodes.forEach(collapseNode)
    }
  }

  if (treeRef.value) {
    const rootNodes = treeRef.value.store.rootNode.childNodes
    rootNodes.forEach(collapseNode)
  }
}

// 获取部门人数
const getNodeUserCount = (deptId) => {
  return countUsersInDepartment(deptId)
}

const countUsersInDepartment = (deptId) => {
  const count = (nodes) => {
    let total = 0
    nodes.forEach(node => {
      if (node.id === deptId) {
        total = props.userList.filter(user => user.departmentId === deptId).length
        if (node.children) {
          node.children.forEach(child => {
            total += count([child])
          })
        }
      } else if (node.children) {
        total += count(node.children)
      }
    })
    return total
  }

  if (deptId === 0) {
    return props.userList.length
  }

  return count(props.treeData)
}

defineExpose({
  expandAll: handleExpandAll,
  collapseAll: handleCollapseAll
})
</script>

<style lang="scss" scoped>
.user-tree-panel {
  width: 280px;
  min-width: 250px;
  max-width: 600px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;

  .tree-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;

    .tree-title {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .tree-actions {
      display: flex;
      gap: 4px;
    }
  }

  .tree-content {
    flex: 1;
    overflow: auto;
    padding: 8px;

    :deep(.el-tree) {
      .el-tree-node__content {
        height: 36px;
        padding: 0 8px;

        &:hover {
          background-color: #f5f7fa;
        }
      }

      .tree-node {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        padding: 2px 0;

        &.is-current {
          color: #409eff;
          font-weight: 500;
        }

        .node-icon {
          font-size: 16px;
          color: #909399;
        }

        .node-name {
          font-size: 13px;
          color: #303133;
        }

        .node-count {
          font-size: 11px;
          color: #909399;
          margin-left: auto;
        }
      }
    }
  }
}
</style>
