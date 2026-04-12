<template>
  <div class="flow-rules">
    <el-divider content-position="left">驳回规则</el-divider>
    <el-form label-width="100px" size="small">
      <el-form-item label="全局驳回策略">
        <el-select v-model="localFlowInfo.globalRejectRule" style="width: 100%" @change="emitChange">
          <el-option label="驳回到发起人" value="to_initiator" />
          <el-option label="驳回到上一节点" value="to_prev" />
          <el-option label="驳回到指定节点" value="to_specific" />
          <el-option label="各节点独立配置" value="node_custom" />
        </el-select>
      </el-form-item>
      <el-form-item label="驳回到指定节点" v-if="localFlowInfo.globalRejectRule === 'to_specific'">
        <el-select v-model="localFlowInfo.rejectToNode" placeholder="选择节点" style="width: 100%" @change="emitChange">
          <el-option v-for="node in allNodes" :key="node.id" :label="node.name" :value="node.id" />
        </el-select>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">加签规则</el-divider>
    <el-form label-width="120px" size="small">
      <el-form-item label="允许加签">
        <el-switch v-model="localFlowInfo.allowAddSign" @change="emitChange" />
      </el-form-item>
      <el-form-item label="加签类型" v-if="localFlowInfo.allowAddSign">
        <el-checkbox-group v-model="localFlowInfo.addSignTypes" @change="emitChange">
          <el-checkbox value="before">会前签</el-checkbox>
          <el-checkbox value="after">会后签</el-checkbox>
          <el-checkbox value="parallel">并行加签</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">撤回规则</el-divider>
    <el-form label-width="120px" size="small">
      <el-form-item label="允许撤回">
        <el-switch v-model="localFlowInfo.allowWithdraw" @change="emitChange" />
      </el-form-item>
      <el-form-item label="撤回条件" v-if="localFlowInfo.allowWithdraw">
        <el-radio-group v-model="localFlowInfo.withdrawCondition" @change="emitChange">
          <el-radio label="any">任何节点都可撤回</el-radio>
          <el-radio label="first">仅第一个审批节点前可撤回</el-radio>
          <el-radio label="custom">指定节点前可撤回</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <el-divider content-position="left">版本与审计</el-divider>
    <el-form label-width="120px" size="small">
      <el-form-item label="版本管理">
        <el-switch v-model="localFlowInfo.versionControl" @change="emitChange" />
        <div class="tip">开启后每次修改自动生成新版本</div>
      </el-form-item>
      <el-form-item label="历史版本保留">
        <el-input-number v-model="localFlowInfo.versionKeepCount" :min="1" :max="50" style="width: 100%" @change="emitChange" />
        <span class="unit">个</span>
      </el-form-item>
      <el-form-item label="审计日志">
        <el-switch v-model="localFlowInfo.auditLog" @change="emitChange" />
        <div class="tip">记录所有流程操作日志，满足合规要求</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  flowInfo: {
    type: Object,
    required: true
  },
  allNodes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:flowInfo'])

const localFlowInfo = reactive({ ...props.flowInfo })

watch(() => props.flowInfo, (newVal) => {
  Object.assign(localFlowInfo, newVal)
}, { deep: true })

const emitChange = () => {
  emit('update:flowInfo', { ...localFlowInfo })
}
</script>

<style scoped lang="scss">
.flow-rules {
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

  :deep(.el-divider) {
    margin: 10px 0;
  }
}
</style>
