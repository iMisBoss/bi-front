<template>
  <div class="portal-switcher">
    <el-dropdown
        trigger="click"
        @command="handlePortalSwitch"
        @visible-change="handleDropdownVisible"
        popper-class="portal-dropdown-popper"
    >
      <div class="portal-trigger" :class="{ 'is-active': dropdownVisible }">
        <el-icon :size="18"><Grid /></el-icon>
        <span class="portal-name">{{ currentPortal.name }}</span>
        <el-icon :size="12" class="arrow-icon">
          <ArrowDown />
        </el-icon>
      </div>

      <template #dropdown>
        <el-dropdown-menu class="portal-dropdown-menu">
          <!-- 搜索框 -->
          <div class="search-wrapper">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索门户"
                clearable
                @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 最近访问 -->
          <template v-if="recentPortals.length > 0 && filteredRecentPortals.length > 0">
            <div class="section-divider"></div>
            <div class="section-title">最近访问</div>
            <el-dropdown-item
                v-for="portal in filteredRecentPortals"
                :key="portal.id"
                :command="portal.id"
                class="portal-item"
                :class="{ 'is-current': portal.id === currentPortal.id }"
            >
              <div class="item-content">
                <el-icon v-if="portal.id === currentPortal.id" class="check-icon">
                  <Check />
                </el-icon>
                <span class="item-label">{{ portal.name }}</span>
              </div>
            </el-dropdown-item>
          </template>

          <!-- 全部门户 -->
          <div class="section-divider"></div>
          <div class="section-title">全部门户</div>
          <el-dropdown-item
              v-for="portal in filteredAllPortals"
              :key="portal.id"
              :command="portal.id"
              class="portal-item"
              :class="{ 'is-current': portal.id === currentPortal.id }"
          >
            <div class="item-content">
              <el-icon v-if="portal.id === currentPortal.id" class="check-icon">
                <Check />
              </el-icon>
              <span class="item-label">{{ portal.name }}</span>
            </div>
          </el-dropdown-item>

          <!-- 无搜索结果 -->
          <el-empty
              v-if="filteredRecentPortals.length === 0 && filteredAllPortals.length === 0 && searchKeyword"
              description="未找到匹配的门户"
              :image-size="60"
          />
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Grid, ArrowDown, Search, Check } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const emit = defineEmits(['portal-change'])

const currentPortal = ref({
  id: 'default',
  name: '首页看板'
})

const allPortals = ref([
  { id: 'default', name: '首页看板' },
  { id: 'personal', name: '个人办公门户' },
  { id: 'department', name: '部门管理门户' },
  { id: 'approval', name: '流程审批门户' },
  { id: 'document', name: '公文管理门户' },
  { id: 'meeting', name: '会议管理门户' }
])

const recentPortals = ref([])
const searchKeyword = ref('')
const dropdownVisible = ref(false)

// 过滤最近访问门户
const filteredRecentPortals = computed(() => {
  if (!searchKeyword.value) return recentPortals.value
  return recentPortals.value.filter(p =>
      p.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 过滤全部门户
const filteredAllPortals = computed(() => {
  if (!searchKeyword.value) return allPortals.value
  return allPortals.value.filter(p =>
      p.name.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

const handleDropdownVisible = (visible) => {
  dropdownVisible.value = visible
  if (!visible) {
    searchKeyword.value = ''
  }
}

const handleSearch = () => {
  // 搜索时重置
}

const handlePortalSwitch = (portalId) => {
  const portal = allPortals.value.find(p => p.id === portalId)
  if (!portal) return

  if (portal.id === currentPortal.value.id) {
    dropdownVisible.value = false
    return
  }

  // 记录到最近访问
  addToRecent(portal)

  // 更新当前门户
  const oldPortal = { ...currentPortal.value }
  currentPortal.value = portal

  // 保存到本地存储
  localStorage.setItem('bi_current_portal', JSON.stringify(portal))

  // 触发门户切换事件
  emit('portal-change', portal, oldPortal)

  ElMessage.success(`已切换到 ${portal.name}`)
}

const addToRecent = (portal) => {
  recentPortals.value = recentPortals.value.filter(p => p.id !== portal.id)
  recentPortals.value.unshift({ ...portal })
  if (recentPortals.value.length > 3) {
    recentPortals.value = recentPortals.value.slice(0, 3)
  }
  localStorage.setItem('bi_recent_portals', JSON.stringify(recentPortals.value))
}

const loadFromStorage = () => {
  const savedPortal = localStorage.getItem('bi_current_portal')
  if (savedPortal) {
    currentPortal.value = JSON.parse(savedPortal)
  }

  const savedRecent = localStorage.getItem('bi_recent_portals')
  if (savedRecent) {
    recentPortals.value = JSON.parse(savedRecent)
  }
}

onMounted(() => {
  loadFromStorage()
})

defineExpose({
  currentPortal
})
</script>

<style lang="scss" scoped>
.portal-switcher {
  display: inline-flex;
  align-items: center;
}

.portal-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid transparent;

  &:hover {
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.08);
  }

  &.is-active {
    background: rgba(64, 158, 255, 0.08);
    border-color: rgba(64, 158, 255, 0.2);

    .portal-name {
      color: #409eff;
    }

    .arrow-icon {
      transform: rotate(180deg);
      color: #409eff;
    }
  }

  .portal-name {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
    transition: color 0.25s;
    white-space: nowrap;
  }

  .arrow-icon {
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: #909399;
  }

  .el-icon:first-child {
    color: #409eff;
  }
}
</style>

<style lang="scss">
.portal-dropdown-popper {
  margin-top: 8px !important;
}

.portal-dropdown-menu {
  padding: 0 !important;
  min-width: 240px !important;
  max-width: 320px !important;
  border-radius: 8px !important;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
  0 3px 6px -4px rgba(0, 0, 0, 0.12),
  0 9px 28px 8px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.06) !important;

  .search-wrapper {
    padding: 10px 12px;
    border-bottom: 1px solid #f0f0f0;

    .el-input {
      .el-input__wrapper {
        background: #f5f7fa;
        box-shadow: none !important;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 0 10px;
        transition: all 0.25s;

        &:hover {
          background: #ebeef5;
        }

        &.is-focus {
          background: #fff;
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1) !important;
        }

        .el-input__inner {
          font-size: 13px;
        }
      }
    }
  }

  .section-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e8e8e8, transparent);
    margin: 4px 0;
  }

  .section-title {
    padding: 10px 16px 6px;
    font-size: 12px;
    color: #8c8c8c;
    font-weight: 600;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .el-dropdown-menu__item {
    padding: 0 !important;
    height: auto !important;
    line-height: normal !important;
    border-radius: 0 !important;
    margin: 2px 8px;

    .item-content {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 6px;
      transition: all 0.2s;
      width: 100%;

      .check-icon {
        color: #409eff;
        font-size: 14px;
        flex-shrink: 0;
      }

      .item-label {
        flex: 1;
        font-size: 14px;
        color: #303133;
        transition: all 0.2s;
      }
    }

    &.is-current {
      background: rgba(64, 158, 255, 0.08) !important;

      .item-content {
        .item-label {
          color: #409eff;
          font-weight: 600;
        }
      }
    }

    &:not(.is-disabled):hover {
      background: rgba(0, 0, 0, 0.04) !important;

      .item-content {
        background: rgba(0, 0, 0, 0.02);
      }
    }
  }

  .el-empty {
    padding: 20px 0;

    .el-empty__description {
      font-size: 13px;
      color: #909399;
    }
  }
}
</style>
