<template>
  <el-dialog v-model="visible" title="审批规则详情" width="700px" :close-on-click-modal="false">
    <div v-if="rule" class="rule-detail">
      <!-- 基础信息 -->
      <div class="detail-section">
        <h3 class="section-title">基础信息</h3>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="规则名称">{{ rule.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="规则说明">{{ rule.description || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="rule.status === 'enabled' ? 'success' : 'info'" size="small">
              {{ rule.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 触发条件 -->
      <div class="detail-section">
        <h3 class="section-title">触发条件（什么时候用这个规则）</h3>
        <div v-if="rule.conditions && rule.conditions.length > 0" class="conditions-list">
          <div v-for="(condition, index) in rule.conditions" :key="index" class="condition-item">
            <span class="condition-text">
              {{ condition.field }} {{ condition.operator }} {{ condition.value }}
            </span>
            <span v-if="index < rule.conditions.length - 1" class="logic-operator">且</span>
          </div>
        </div>
        <div v-else class="empty-tip">无特定条件，所有流程均可使用</div>
      </div>

      <!-- 审批链 -->
      <div class="detail-section">
        <h3 class="section-title">审批链（谁来审批）</h3>
        <div class="approval-chain">
          <div v-for="(node, index) in rule.approvalNodes" :key="index" class="chain-node">
            <div class="node-card">
              <div class="node-order">节点{{ index + 1 }}</div>
              <div class="node-name">{{ node.name }}</div>
              <div class="node-type">{{ getNodeTypeName(node.type) }}</div>
            </div>
            <el-icon v-if="index < rule.approvalNodes.length - 1" class="arrow-icon" color="#409EFF">
              <ArrowRight />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 其他信息 -->
      <div class="detail-section">
        <h3 class="section-title">其他信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="创建时间">{{ rule.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="最后修改">{{ rule.updateTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建人">{{ rule.creator || '-' }}</el-descriptions-item>
          <el-descriptions-item label="修改人">{{ rule.updater || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean,
  rule: Object
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getNodeTypeName = (type) => {
  const typeMap = {
    user: '指定人员',
    role: '指定角色',
    department: '指定部门',
    superior: '发起人上级',
    continuous_superior: '连续多级上级',
    self_select: '发起人自选'
  }
  return typeMap[type] || type
}
</script>

<style scoped lang="scss">
.rule-detail {
  .detail-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px;
      padding-left: 8px;
      border-left: 3px solid #409EFF;
    }

    .conditions-list {
      .condition-item {
        padding: 10px 12px;
        background: #f5f7fa;
        border-radius: 4px;
        margin-bottom: 8px;

        .condition-text {
          font-size: 14px;
          color: #606266;
        }

        .logic-operator {
          margin-left: 12px;
          font-size: 13px;
          color: #E6A23C;
          font-weight: 500;
        }
      }
    }

    .empty-tip {
      padding: 12px;
      text-align: center;
      color: #909399;
      font-size: 14px;
      background: #fafafa;
      border-radius: 4px;
    }

    .approval-chain {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      padding: 12px;
      background: #f5f7fa;
      border-radius: 4px;

      .chain-node {
        display: flex;
        align-items: center;
        gap: 8px;

        .node-card {
          min-width: 120px;
          padding: 12px;
          background: #fff;
          border: 2px solid #409EFF;
          border-radius: 6px;
          text-align: center;

          .node-order {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .node-name {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .node-type {
            font-size: 12px;
            color: #409EFF;
          }
        }

        .arrow-icon {
          font-size: 20px;
        }
      }
    }
  }
}
</style>
