<template>
  <el-dialog v-model="visible" title="管理绑定节点" width="600px" :close-on-click-modal="false">
    <el-alert
        :title="`当前规则：${rule?.ruleName}`"
        type="info"
        show-icon
        :closable="false"
        style="margin-bottom: 16px"
    />

    <div class="node-selection">
      <p class="selection-tip">选择要绑定该规则的节点（仅展示当前流程的审批节点）：</p>
      <el-checkbox-group v-model="selectedNodes" class="node-list">
        <el-checkbox
            v-for="node in availableNodes"
            :key="node.nodeId"
            :label="node.nodeName"
            class="node-item"
        >
          {{ node.nodeName }}
        </el-checkbox>
      </el-checkbox-group>
    </div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: Boolean,
  rule: Object,
  availableNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const selectedNodes = ref([])

// 监听弹窗打开，初始化选中节点
watch(visible, (val) => {
  if (val && props.rule) {
    selectedNodes.value = [...(props.rule.boundNodes || [])]
  }
})

const handleConfirm = () => {
  if (selectedNodes.value.length === 0) {
    ElMessage.warning('请至少选择一个绑定节点')
    return
  }
  emit('confirm', selectedNodes.value)
  visible.value = false
}
</script>

<style scoped lang="scss">
.node-selection {
  .selection-tip {
    margin-bottom: 12px;
    font-size: 14px;
    color: #606266;
  }

  .node-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .node-item {
      padding: 8px 12px;
      background: #f5f7fa;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background: #ecf5ff;
      }

      :deep(.el-checkbox__label) {
        font-size: 14px;
      }
    }
  }
}
</style>
