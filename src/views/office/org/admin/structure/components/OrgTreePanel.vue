<template>
  <div class="org-tree-panel" :style="{ width: panelWidth + 'px' }">
    <div class="tree-header">
      <span class="tree-title">部门树</span>
      <div class="tree-actions">
        <el-button link size="small" @click="$emit('expandAll')">全部展开</el-button>
        <el-button link size="small" @click="$emit('collapseAll')">全部收起</el-button>
      </div>
    </div>

    <el-tree
        ref="treeRef"
        :data="filteredTreeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        highlight-current
        draggable
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        @node-click="handleNodeClick"
        @check="handleCheck"
        @node-drag-end="handleNodeDragEnd"
        :class="`density-${treeSettings.density}`"
    >
      <template #default="{ node, data }">
        <span class="tree-node" :class="{ disabled: data.status === 'disabled' }">
          <el-icon class="node-icon department">
            <OfficeBuilding />
          </el-icon>
          <span class="node-label">{{ node.label }}</span>
          <el-tag v-if="data.status === 'enabled'" size="small" type="success" class="node-status">启用</el-tag>
          <el-tag v-else size="small" type="danger" class="node-status">禁用</el-tag>
          <span v-if="treeSettings.showMemberCount" class="node-meta">
            ({{ data.memberCount || 0 }}人)
          </span>
          <span v-if="data.leader && treeSettings.showLeader" class="node-meta">
            - {{ data.leader }}
          </span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'

const props = defineProps({
  treeData: Array,
  treeSettings: Object,
  searchKeyword: String,
  statusFilter: String
})

const emit = defineEmits(['nodeClick', 'nodeCheck', 'nodeDragEnd', 'expandAll', 'collapseAll'])

const treeRef = ref(null)
const panelWidth = ref(window.innerWidth * 0.3)

const treeProps = {
  children: 'children',
  label: 'name'
}

const filteredTreeData = computed(() => {
  let data = JSON.parse(JSON.stringify(props.treeData))

  if (props.statusFilter) {
    data = filterByStatus(data, props.statusFilter)
  }

  if (props.searchKeyword) {
    data = filterByKeyword(data, props.searchKeyword)
  }

  return data
})

const filterByStatus = (nodes, status) => {
  return nodes.filter(node => {
    const match = node.status === status
    if (node.children) {
      node.children = filterByStatus(node.children, status)
    }
    return match || (node.children && node.children.length > 0)
  })
}

const filterByKeyword = (nodes, keyword) => {
  return nodes.filter(node => {
    const match = node.name.includes(keyword) || (node.leader && node.leader.includes(keyword))
    if (node.children) {
      node.children = filterByKeyword(node.children, keyword)
    }
    return match || (node.children && node.children.length > 0)
  })
}

const allowDrag = (draggingNode) => {
  return draggingNode.data.status === 'enabled'
}

const allowDrop = (draggingNode, dropNode, type) => {
  return dropNode.data.status === 'enabled'
}

const handleNodeClick = (data) => {
  emit('nodeClick', data)
}

const handleCheck = (checkedNode, checkedInfo) => {
  emit('nodeCheck', checkedInfo.checkedNodes)
}

const handleNodeDragEnd = (draggingNode, dropNode, dropType) => {
  emit('nodeDragEnd', draggingNode, dropNode, dropType)
}

const expandAll = () => {
  if (treeRef.value && treeRef.value.store && treeRef.value.store.nodesMap) {
    Object.values(treeRef.value.store.nodesMap).forEach(node => {
      node.expanded = true
    })
  }
}

const collapseAll = () => {
  if (treeRef.value && treeRef.value.store && treeRef.value.store.nodesMap) {
    Object.values(treeRef.value.store.nodesMap).forEach(node => {
      node.expanded = false
    })
  }
}

defineExpose({ expandAll, collapseAll })
</script>

<style lang="scss" scoped>
.org-tree-panel {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: auto;
  flex-shrink: 0;

  .tree-header {
    padding: 12px;
    border-bottom: 1px solid #dcdfe6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f5f7fa;

    .tree-title {
      font-weight: 600;
      font-size: 14px;
    }
  }

  :deep(.el-tree) {
    padding: 8px;

    &.density-compact {
      .el-tree-node__content {
        height: 28px;
      }
    }

    &.density-standard {
      .el-tree-node__content {
        height: 36px;
      }
    }

    &.density-loose {
      .el-tree-node__content {
        height: 44px;
      }
    }

    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;

      &.disabled {
        color: #c0c4cc;
      }

      .node-icon {
        font-size: 16px;
        color: #409eff;
      }

      .node-label {
        flex: 1;
      }

      .node-status {
        margin-left: 4px;
      }

      .node-meta {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
