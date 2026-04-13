<template>
  <div class="property-panel">
    <div class="panel-header">
      <span class="title">属性配置</span>
    </div>

    <el-tabs v-model="activeTab" class="panel-tabs">
      <!-- Tab1: 页面属性 -->
      <el-tab-pane label="页面属性" name="page">
        <div class="tab-content">
          <el-form label-width="90px" size="small">
            <el-form-item label="门户备注">
              <el-input v-model="localPortal.remark" type="textarea" :rows="3" placeholder="选填" />
            </el-form-item>
            <el-form-item label="适配模式">
              <el-radio-group v-model="localPortal.layoutMode">
                <el-radio value="fixed">固定宽度</el-radio>
                <el-radio value="auto">自适应全屏</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="背景样式">
              <el-select v-model="localPortal.background" style="width: 100%">
                <el-option label="纯白" value="#ffffff" />
                <el-option label="浅灰" value="#f5f7fa" />
                <el-option label="自定义" value="custom" />
              </el-select>
              <el-color-picker v-if="localPortal.background === 'custom'" v-model="customBgColor" show-alpha style="margin-top: 8px" />
            </el-form-item>
            <el-form-item label="权限配置">
              <el-link
                  :type="publishStatus === 'published' ? 'primary' : 'info'"
                  :underline="false"
                  :disabled="publishStatus !== 'published'"
                  @click="handleJumpPermission"
              >
                {{ publishStatus === 'published' ? '去设置' : '请先发布后配置' }}
              </el-link>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>

      <!-- Tab2: 组件属性 -->
      <el-tab-pane label="组件属性" name="component">
        <div v-if="selectedComponent" class="tab-content">
          <el-form label-width="90px" size="small">
            <el-form-item label="组件名称">
              <el-input v-model="selectedComponent.name" disabled />
            </el-form-item>

            <!-- 展示组件专属属性 -->
            <template v-if="isDisplayComponent">
              <el-form-item label="显示标题">
                <el-switch v-model="selectedComponent.showTitle" />
                <el-input v-if="selectedComponent.showTitle" v-model="selectedComponent.title" placeholder="标题" style="margin-top: 8px" />
              </el-form-item>
              <el-form-item label="组件高度">
                <el-radio-group v-model="selectedComponent.heightMode">
                  <el-radio value="fixed">固定高度</el-radio>
                  <el-radio value="auto">自适应</el-radio>
                </el-radio-group>
                <el-input-number v-if="selectedComponent.heightMode === 'fixed'" v-model="selectedComponent.height" :min="100" :max="1000" style="margin-top: 8px" />
              </el-form-item>
              <el-form-item label="是否显示">
                <el-switch v-model="selectedComponent.visible" />
              </el-form-item>

              <!-- 业务组件专属配置 -->
              <template v-if="isBusinessComponent">
                <el-divider>业务配置</el-divider>
                <el-form-item label="显示条数">
                  <el-select v-model="selectedComponent.displayCount" style="width: 100%">
                    <el-option label="5条" :value="5" />
                    <el-option label="10条" :value="10" />
                    <el-option label="20条" :value="20" />
                  </el-select>
                </el-form-item>
                <el-form-item label="数据范围">
                  <el-radio-group v-model="selectedComponent.dataScope">
                    <el-radio value="all">全部</el-radio>
                    <el-radio value="category">指定分类</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item v-if="selectedComponent.dataScope === 'category'" label="选择分类">
                  <el-select v-model="selectedComponent.categoryId" placeholder="请选择" style="width: 100%">
                    <el-option label="公司公告" value="1" />
                    <el-option label="部门通知" value="2" />
                    <el-option label="制度文件" value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item label="排序规则">
                  <el-select v-model="selectedComponent.sortRule" style="width: 100%">
                    <el-option label="按时间倒序" value="time_desc" />
                    <el-option label="按紧急度" value="urgency" />
                    <el-option label="按重要性" value="importance" />
                  </el-select>
                </el-form-item>
              </template>
            </template>

            <!-- 容器组件仅显示是否显示 -->
            <el-form-item v-else label="是否显示">
              <el-switch v-model="selectedComponent.visible" />
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>点击画布中的组件查看属性</span>
        </div>
      </el-tab-pane>

      <!-- Tab3: 样式配置（所有组件均可配置） -->
      <el-tab-pane label="样式配置" name="style">
        <div v-if="selectedComponent" class="tab-content">
          <el-form label-width="90px" size="small">
            <el-form-item label="圆角大小">
              <el-radio-group v-model="selectedComponent.borderRadius">
                <el-radio value="small">小</el-radio>
                <el-radio value="medium">中</el-radio>
                <el-radio value="large">大</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="阴影效果">
              <el-switch v-model="selectedComponent.showShadow" />
            </el-form-item>
            <el-form-item label="内边距">
              <el-radio-group v-model="selectedComponent.padding">
                <el-radio value="default">默认</el-radio>
                <el-radio value="compact">紧凑</el-radio>
                <el-radio value="loose">宽松</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="isDisplayComponent" label="标题颜色">
              <el-radio-group v-model="selectedComponent.titleColor">
                <el-radio value="primary">主色</el-radio>
                <el-radio value="gray">灰色</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>点击画布中的组件查看样式</span>
        </div>
      </el-tab-pane>

      <!-- Tab4: 全局样式 -->
      <el-tab-pane label="全局样式" name="global">
        <div class="tab-content">
          <el-form label-width="90px" size="small">
            <el-form-item label="主题色">
              <el-color-picker v-model="globalStyle.primaryColor" show-alpha />
            </el-form-item>
            <el-form-item label="辅助色">
              <el-color-picker v-model="globalStyle.secondaryColor" show-alpha />
            </el-form-item>
            <el-form-item label="布局风格">
              <el-radio-group v-model="globalStyle.layoutStyle">
                <el-radio value="card">卡片式</el-radio>
                <el-radio value="simple">极简式</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="顶部Banner">
              <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleBannerUpload"
              >
                <el-button size="small" type="primary">上传Banner</el-button>
              </el-upload>
              <div v-if="globalStyle.bannerImage" class="banner-preview">
                <img :src="globalStyle.bannerImage" alt="Banner" />
                <el-button size="small" type="danger" link @click="globalStyle.bannerImage = ''">删除</el-button>
              </div>
            </el-form-item>
            <el-form-item label="Banner高度">
              <el-input-number v-model="globalStyle.bannerHeight" :min="100" :max="400" style="width: 100%" />
            </el-form-item>
            <el-form-item label="字体大小">
              <el-radio-group v-model="globalStyle.fontSize">
                <el-radio value="small">小</el-radio>
                <el-radio value="medium">中</el-radio>
                <el-radio value="large">大</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="组件间距">
              <el-radio-group v-model="globalStyle.componentGap">
                <el-radio value="compact">紧凑</el-radio>
                <el-radio value="default">默认</el-radio>
                <el-radio value="loose">宽松</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-divider />
            <el-form-item>
              <el-button type="primary" size="small" @click="saveGlobalStyle">保存为模板</el-button>
              <el-button size="small" @click="resetGlobalStyle">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  selectedComponent: {
    type: Object,
    default: null
  },
  portalConfig: {
    type: Object,
    default: () => ({})
  },
  publishStatus: {
    type: String,
    default: 'draft'
  }
})

const emit = defineEmits(['update-component', 'update-portal', 'jump-permission'])

const activeTab = ref('page')
const customBgColor = ref('#f5f7fa')
const localPortal = reactive({
  remark: '',
  layoutMode: 'fixed',
  background: '#f5f7fa'
})

// 全局样式配置
const globalStyle = reactive({
  primaryColor: '#409eff',
  secondaryColor: '#67c23a',
  layoutStyle: 'card',
  bannerImage: '',
  bannerHeight: 200,
  fontSize: 'medium',
  componentGap: 'default'
})

// 容器组件类型
const containerTypes = ['grid-1', 'grid-2', 'grid-3', 'grid-4', 'card', 'divider', 'spacer']

const isDisplayComponent = computed(() => {
  if (!props.selectedComponent) return false
  return !containerTypes.includes(props.selectedComponent.type)
})

const isBusinessComponent = computed(() => {
  if (!props.selectedComponent) return false
  const businessTypes = ['todo-list', 'done-list', 'launched-list', 'form-data', 'flow-stats', 'news-list', 'article-list', 'image-text-list', 'data-chart']
  return businessTypes.includes(props.selectedComponent.type)
})

const handleJumpPermission = () => {
  emit('jump-permission')
}

// 监听 portalConfig 变化
watch(() => props.portalConfig, (newVal) => {
  Object.assign(localPortal, newVal)
  if (newVal.background && newVal.background !== 'custom') {
    customBgColor.value = newVal.background
  }
}, { deep: true })

// 监听 localPortal 变化并同步
watch(localPortal, (newVal) => {
  const bgColor = newVal.background === 'custom' ? customBgColor.value : newVal.background
  emit('update-portal', { ...newVal, background: bgColor })
}, { deep: true })

// 监听自定义背景色变化
watch(customBgColor, (newVal) => {
  if (localPortal.background === 'custom') {
    emit('update-portal', { ...localPortal, background: newVal })
  }
})

// 监听 selectedComponent 变化，选中时自动切换到组件属性Tab
watch(() => props.selectedComponent, (newVal) => {
  if (newVal) {
    activeTab.value = isDisplayComponent.value ? 'component' : 'page'
  }
}, { immediate: true })

// Banner上传处理
const handleBannerUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    globalStyle.bannerImage = e.target.result
    ElMessage.success('Banner上传成功')
  }
  reader.readAsDataURL(file.raw)
}

// 保存全局样式为模板
const saveGlobalStyle = () => {
  localStorage.setItem('portal-global-style-template', JSON.stringify(globalStyle))
  ElMessage.success('已保存为模板')
}

// 重置全局样式
const resetGlobalStyle = () => {
  Object.assign(globalStyle, {
    primaryColor: '#409eff',
    secondaryColor: '#67c23a',
    layoutStyle: 'card',
    bannerImage: '',
    bannerHeight: 200,
    fontSize: 'medium',
    componentGap: 'default'
  })
  ElMessage.success('已重置')
}

// 加载保存的模板
const loadSavedTemplate = () => {
  const saved = localStorage.getItem('portal-global-style-template')
  if (saved) {
    try {
      Object.assign(globalStyle, JSON.parse(saved))
    } catch (e) {
      console.error('加载模板失败:', e)
    }
  }
}

loadSavedTemplate()
</script>

<style scoped lang="scss">.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;

  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;

    .title {
      font-size: 15px;
      color: #303133;
    }
  }

  .panel-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;

    :deep(.el-tabs__header) {
      padding: 0 16px;
      margin: 0;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
      padding: 0;
    }

    :deep(.el-tabs__item) {
      font-weight: normal;
    }

    .tab-content {
      padding: 16px;

      .readonly-tip {
        font-size: 13px;
        color: #909399;
      }

      .banner-preview {
        margin-top: 8px;
        position: relative;

        img {
          width: 100%;
          height: 80px;
          object-fit: cover;
          border-radius: 4px;
        }

        .el-button {
          position: absolute;
          top: 4px;
          right: 4px;
        }
      }
    }

    .empty-tip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
      color: #909399;

      .el-icon {
        font-size: 48px;
        margin-bottom: 12px;
        color: #c0c4cc;
      }

      span {
        font-size: 13px;
      }
    }
  }
}
</style>
