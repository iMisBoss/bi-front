<template>
  <div class="org-footer-stats">
    <span>共 {{ totalDepartments }} 个部门</span>
    <el-divider direction="vertical" />
    <span>在职人员 {{ totalEmployees }} 人</span>
    <el-divider direction="vertical" />
    <span>已选择 {{ selectedCount }} 项</span>
    <div class="footer-tips">
      <el-icon><InfoFilled /></el-icon>
      <span>提示：根部门不可删除/禁用 | 有人员的部门不可禁用 | 所有操作将记录审计日志</span>
    </div>
  </div>
</template>

<script setup>
import { InfoFilled } from '@element-plus/icons-vue'

defineProps({
  totalDepartments: {
    type: Number,
    default: 0
  },
  totalEmployees: {
    type: Number,
    default: 0
  },
  selectedCount: {
    type: Number,
    default: 0
  }
})
</script>

<style lang="scss" scoped>
.org-footer-stats {
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  font-size: 13px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  :deep(.el-divider) {
    border-color: rgba(255, 255, 255, 0.3);
    margin: 0;
  }

  .footer-tips {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    opacity: 0.9;

    .el-icon {
      font-size: 14px;
    }
  }
}
</style>
