<template>
  <div class="property-panel">
    <el-tabs v-model="activeTab" class="property-tabs">
      <!-- Tab1: 流程属性 -->
      <el-tab-pane label="流程属性" name="flow">
        <div class="tab-content">
          <flow-properties :flow-info="flowInfo" />
        </div>
      </el-tab-pane>

      <!-- Tab2: 节点属性 -->
      <el-tab-pane label="节点属性" name="node">
        <template v-if="activeNode">
          <div class="tab-content">
            <node-properties
                :active-node="activeNode"
                :all-nodes="allNodes"
                @update-node="handleNodeChange"
                @param-mapping="handleParamMapping"
            />
          </div>
        </template>
        <el-empty v-else description="请选择节点" :image-size="100" />
      </el-tab-pane>

      <!-- Tab3: 连线属性 -->
      <el-tab-pane label="连线属性" name="connection">
        <template v-if="activeConnection">
          <div class="tab-content">
            <connection-properties
                :active-connection="activeConnection"
                :all-nodes="allNodes"
                @update-connection="handleConnectionChange"
            />
          </div>
        </template>
        <el-empty v-else description="请选择连线" :image-size="100" />
      </el-tab-pane>

      <!-- Tab4: 流程规则 -->
      <el-tab-pane label="流程规则" name="rules">
        <div class="tab-content">
          <flow-rules :flow-info="flowInfo" :all-nodes="allNodes" />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import FlowProperties from './FlowProperties.vue'
import NodeProperties from './NodeProperties.vue'
import ConnectionProperties from './ConnectionProperties.vue'
import FlowRules from './FlowRules.vue'

const props = defineProps({
  activeNode: {
    type: Object,
    default: null
  },
  activeConnection: {
    type: Object,
    default: null
  },
  flowInfo: {
    type: Object,
    required: true
  },
  allNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:flow-info',
  'update-node',
  'update-connection',
  'param-mapping'
])

const activeTab = ref('flow')

// 节点变更
const handleNodeChange = (updatedNode) => {
  emit('update-node', updatedNode)
}

// 连线变更
const handleConnectionChange = (updatedConnection) => {
  emit('update-connection', updatedConnection)
}

// 参数映射
const handleParamMapping = () => {
  emit('param-mapping')
}

// 监听选中对象变化，自动切换Tab
watch(() => props.activeNode, (newNode) => {
  if (newNode) {
    activeTab.value = 'node'
  } else if (!props.activeConnection) {
    activeTab.value = 'flow'
  }
})

watch(() => props.activeConnection, (newConn) => {
  if (newConn) {
    activeTab.value = 'connection'
  } else if (!props.activeNode) {
    activeTab.value = 'flow'
  }
})
</script>

<style scoped lang="scss">
.property-panel {
  width: 340px;
  min-width: 300px;
  max-width: 450px;
  background: #fff;
  border-left: 1px solid #e8e8e8;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);

  .property-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;

    :deep(.el-tabs__header) {
      padding: 0 10px;
      margin: 0;
      flex-shrink: 0;
      min-height: 36px;

      .el-tabs__nav-wrap::after {
        height: 1px;
      }

      .el-tabs__item {
        padding: 0 10px;
        height: 36px;
        line-height: 36px;
        font-size: 13px;
      }
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      padding: 0;
      height: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      overflow: hidden;
    }
  }

  .tab-content {
    height: 100%;
    padding: 10px;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
      transition: background 0.2s;

      &:hover {
        background: #c0c4cc;
      }
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .el-form-item__label {
          padding: 0 6px 0 0;
          font-size: 13px;
          color: #606266;
          line-height: 28px;
          white-space: nowrap;
          width: 70px;
          flex-shrink: 0;
        }

        .el-form-item__content {
          flex: 1;
          min-width: 0;
        }
      }
    }

    :deep(.el-divider) {
      margin: 10px 0;

      .el-divider__text {
        font-weight: bold;
        font-size: 13px;
        color: #606266;
        padding: 0 6px;
      }
    }

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper),
    :deep(.el-textarea__inner) {
      padding: 4px 11px;
    }

    :deep(.el-switch) {
      height: 24px;
    }
  }

  :deep(.el-empty) {
    padding: 20px 0;
  }
}

.unit {
  margin-left: 8px;
  font-size: 12px;
  color: #909399;
}

.tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
}
</style>
