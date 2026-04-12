
<template>
  <el-dialog v-model="visible" title="门户预览" width="80%" top="5vh" :close-on-click-modal="false">
    <div class="preview-container" :style="previewStyle">
      <div class="preview-header">
        <span class="preview-title">{{ previewData.name || '门户预览' }}</span>
        <el-tag size="small" type="info">预览模式</el-tag>
      </div>

      <div class="preview-body">
        <div v-for="comp in previewData.components" :key="comp.id" class="preview-component">
          <div class="comp-header">{{ comp.title || comp.name }}</div>
          <div class="comp-content">
            <template v-if="isGridComponent(comp.type)">
              <div class="grid-placeholder">
                <div v-for="n in getGridCols(comp.type)" :key="n" class="grid-cell">列 {{ n }}</div>
              </div>
            </template>
            <template v-else>
              <span>{{ getComponentText(comp.type) }}</span>
            </template>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="visible = false">关闭预览</el-button>
    </template>
  </el-dialog>
</template>

<script setup>import { ref, computed } from 'vue'

const visible = ref(false)
const previewData = ref({})

const open = (data) => {
  previewData.value = data || {}
  visible.value = true
}

const isGridComponent = (type) => ['grid-1', 'grid-2', 'grid-3', 'grid-4'].includes(type)
const getGridCols = (type) => {
  const map = { 'grid-1': 1, 'grid-2': 2, 'grid-3': 3, 'grid-4': 4 }
  return map[type] || 1
}
const getComponentText = (type) => {
  const texts = {
    'user-card': '个人信息卡', 'scroll-notice': '单行滚动公告', 'nav-menu': '快捷导航菜单',
    'shortcut': '快捷入口', 'carousel': '公告轮播', 'article-list': '图文列表',
    'stat-card': '数据卡片', 'todo-list': '待办审批列表', 'done-list': '已办审批列表',
    'launched-list': '我的发起列表', 'form-data': '表单数据列表', 'flow-stats': '流程统计图表',
    'rich-text': '富文本内容', 'html': '自定义 HTML', 'iframe': 'iframe 嵌入'
  }
  return texts[type] || type
}

const previewStyle = computed(() => ({
  background: previewData.value.background || '#f5f7fa',
  borderRadius: '4px',
  minHeight: '500px'
}))

defineExpose({ open })
</script>

<style scoped lang="scss">.preview-container {
  .preview-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: #fff; border-bottom: 1px solid #ebeef5;
    .preview-title { font-size: 16px; font-weight: 500; }
  }
  .preview-body { padding: 20px; }
  .preview-component { margin-bottom: 16px; background: #fff; border-radius: 8px; box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    .comp-header { padding: 12px 16px; border-bottom: 1px solid #f2f6fc; font-weight: 500; font-size: 14px; }
    .comp-content { padding: 20px; min-height: 80px; color: #909399; }
    .grid-placeholder { display: flex; gap: 10px;
      .grid-cell { flex: 1; height: 60px; background: #f5f7fa; border: 1px dashed #dcdfe6; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #c0c4cc; }
    }
  }
}
</style>