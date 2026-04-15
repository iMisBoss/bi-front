<template>
  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="card-title">
        <el-icon><Collection /></el-icon>
        <span>会议模板</span>
      </div>
    </template>
    <div class="template-list">
      <div
          v-for="template in templates"
          :key="template.id"
          class="template-item"
          @click="$emit('apply-template', template.id)"
      >
        <div class="template-name">{{ template.name }}</div>
        <div class="template-desc">{{ template.description }}</div>
      </div>
    </div>
  </el-card>

  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="card-title">
        <el-icon><QuestionFilled /></el-icon>
        <span>常见问题</span>
      </div>
    </template>
    <div class="faq-list">
      <div
          v-for="faq in faqs"
          :key="faq.id"
          class="faq-item"
          @click="faq.expanded = !faq.expanded"
      >
        <div class="faq-question">
          <span>{{ faq.question }}</span>
          <el-icon :size="16">
            <ArrowDown v-if="!faq.expanded" />
            <ArrowUp v-else />
          </el-icon>
        </div>
        <div v-if="faq.expanded" class="faq-answer">
          {{ faq.answer }}
        </div>
      </div>
    </div>
  </el-card>

  <el-card shadow="never" class="sidebar-card">
    <template #header>
      <div class="card-title">
        <el-icon><Operation /></el-icon>
        <span>快捷操作</span>
      </div>
    </template>
    <div class="quick-actions">
      <el-button
          style="width: 100%; margin-bottom: 8px"
          @click="$emit('sync-calendar')"
      >
        <el-icon><Calendar /></el-icon>
        关联我的日程
      </el-button>
      <el-button
          v-if="isAdmin || isDepartmentHead"
          style="width: 100%; margin-bottom: 8px"
          @click="$emit('batch-import')"
      >
        <el-icon><Upload /></el-icon>
        批量导入参会人
      </el-button>
      <el-button
          style="width: 100%"
          @click="$emit('view-rooms')"
      >
        <el-icon><OfficeBuilding /></el-icon>
        查看会议室占用
      </el-button>
    </div>
  </el-card>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { Collection, QuestionFilled, Operation, Calendar, Upload, OfficeBuilding, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

defineProps({
  templates: Array,
  faqs: Array,
  isAdmin: Boolean,
  isDepartmentHead: Boolean
})

defineEmits(['apply-template', 'sync-calendar', 'batch-import', 'view-rooms'])
</script>

<style lang="scss" scoped>
.sidebar-card {
  margin-bottom: 16px;

  :deep(.el-card__header) {
    padding: 12px 16px;
    background: #fafafa;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
  }

  .template-list {
    .template-item {
      padding: 12px;
      margin-bottom: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
        border: 1px solid #409eff;
      }

      .template-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .template-desc {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .faq-list {
    .faq-item {
      padding: 12px;
      margin-bottom: 8px;
      background: #f5f7fa;
      border-radius: 4px;
      cursor: pointer;

      .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        font-weight: 600;
        color: #303133;
      }

      .faq-answer {
        margin-top: 8px;
        font-size: 12px;
        color: #606266;
        line-height: 1.6;
      }
    }
  }

  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}
</style>
