<template>
  <div class="org-tree-panel" :style="{ width: panelWidth + 'px' }">
    <div class="tree-header">
      <h3 class="tree-title">组织架构</h3>
      <el-dropdown trigger="click" @command="handleQuickAction">
        <el-button size="small" icon="More">
          快捷操作
          <el-icon class="el-icon--right"><arrow-down /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="add-sub">新增子部门</el-dropdown-item>
            <el-dropdown-item command="add-sibling">新增同级部门</el-dropdown-item>
            <el-dropdown-item command="edit" :disabled="!currentNode">编辑</el-dropdown-item>
            <el-dropdown-item command="delete" :disabled="!currentNode">删除</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <el-tree
        ref="treeRef"
        :data="treeData"
        :props="treeProps"
        :default-expand-all="treeSettings.autoExpand"
        :highlight-current="true"
        :draggable="true"
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        node-key="id"
        @node-click="handleNodeClick"
        @node-drag-end="handleNodeDragEnd"
    >
      <template #default="{ node, data }">
        <div class="tree-node" :class="{ 'is-disabled': data.status === 'disabled' }">
          <span class="node-name">{{ node.label }}</span>

          <span v-if="treeSettings.showCode" class="node-code">({{ data.code }})</span>

          <span v-if="treeSettings.showMemberCount && data.memberCount" class="node-meta">
            {{ data.memberCount }}人
          </span>

          <span v-if="treeSettings.showLeader && data.leader" class="node-leader">
            - {{ data.leader }}
          </span>

          <div class="node-actions" @click.stop>
            <el-dropdown trigger="click" size="small">
              <el-button link size="small" icon="MoreFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('quick-add', data)">新增子部门</el-dropdown-item>
                  <el-dropdown-item @click="$emit('quick-edit', data)">编辑</el-dropdown-item>
                  <el-dropdown-item
                      :disabled="data.id === 1 || data.memberCount > 0"
                      @click="$emit('quick-delete', data)"
                  >
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </el-tree>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ArrowDown, MoreFilled } from '@element-plus/icons-vue'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => []
  },
  treeSettings: {
    type: Object,
    default: () => ({})
  },
  searchKeyword: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['node-click', 'node-drag-end', 'quick-add', 'quick-edit', 'quick-delete'])

const treeRef = ref(null)
const currentNode = ref(null)
const panelWidth = ref(320)

const treeProps = {
  children: 'children',
  label: 'name'
}

const handleNodeClick = (data) => {
  currentNode.value = data
  emit('node-click', data)
}

const handleNodeDragEnd = (draggingNode, dropNode, dropType) => {
  emit('node-drag-end', draggingNode.data, dropNode?.data, dropType)
}

const handleQuickAction = (command) => {
  if (!currentNode.value && command !== 'add-sub') {
    return
  }

  switch (command) {
    case 'add-sub':
      emit('quick-add', currentNode.value || { id: 1 })
      break
    case 'add-sibling':
      emit('quick-add', { id: currentNode.value?.parentId || 1 })
      break
    case 'edit':
      emit('quick-edit', currentNode.value)
      break
    case 'delete':
      emit('quick-delete', currentNode.value)
      break
  }
}

const allowDrag = (draggingNode) => {
  return draggingNode.data.id !== 1
}

const allowDrop = (draggingNode, dropNode, type) => {
  if (type === 'inner') {
    return true
  }
  return dropNode.data.id !== 1
}

// 全部展开
const expandAll = () => {
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

// 全部收起
const collapseAll = () => {
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

defineExpose({
  expandAll,
  collapseAll
})
</script>

<style lang="scss" scoped>
.org-tree-panel {
  width: 320px;
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
  }

  :deep(.el-tree) {
    flex: 1;
    overflow: auto;
    padding: 8px;

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

      &.is-disabled {
        opacity: 0.6;
      }

      .node-name {
        font-size: 13px;
        color: #303133;
        font-weight: 500;
      }

      .node-code {
        font-size: 11px;
        color: #909399;
      }

      .node-meta {
        font-size: 11px;
        color: #409eff;
        background: #ecf5ff;
        padding: 1px 6px;
        border-radius: 10px;
      }

      .node-leader {
        font-size: 11px;
        color: #606266;
      }

      .node-actions {
        margin-left: auto;
        opacity: 0;
        transition: opacity 0.2s;
      }

      &:hover .node-actions {
        opacity: 1;
      }
    }
  }
}
</style>
