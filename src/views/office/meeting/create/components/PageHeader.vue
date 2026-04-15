<template>
  <div class="page-header">
    <div class="header-left">
      <el-icon :size="24" color="#409eff"><Calendar /></el-icon>
      <span class="page-title">发起会议</span>
    </div>
    <div class="header-right">
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button @click="$emit('save-draft')">
        <el-icon><DocumentCopy /></el-icon>
        保存草稿
      </el-button>
      <el-button @click="$emit('preview')">
        <el-icon><View /></el-icon>
        预览
      </el-button>
      <el-button type="primary" @click="$emit('submit')" :loading="submitting">
        <el-icon><Promotion /></el-icon>
        提交会议
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Calendar, DocumentCopy, View, Promotion } from '@element-plus/icons-vue'

defineProps({
  submitting: Boolean
})

defineEmits(['close', 'save-draft', 'preview', 'submit'])
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px 24px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }
}
</style>
