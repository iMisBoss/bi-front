<template>
  <div class="start-container">
    <div class="page-header">
      <h2>发起审批</h2>
      <el-input
          v-model="searchText"
          placeholder="搜索流程模板"
          style="width: 300px"
          clearable
          prefix-icon="Search"
      />
    </div>

    <el-row :gutter="20">
      <!-- 左侧分类菜单 -->
      <el-col :span="4">
        <el-card class="category-card">
          <template #header>
            <span>流程分类</span>
          </template>
          <el-menu
              :default-active="activeCategory"
              class="category-menu"
              @select="handleCategorySelect"
          >
            <el-menu-item index="all">
              <el-icon><Grid /></el-icon>
              <span>全部流程</span>
            </el-menu-item>
            <el-menu-item index="common">
              <el-icon><Star /></el-icon>
              <span>常用流程</span>
            </el-menu-item>
            <el-menu-item index="admin">
              <el-icon><OfficeBuilding /></el-icon>
              <span>行政</span>
            </el-menu-item>
            <el-menu-item index="management">
              <el-icon><Briefcase /></el-icon>
              <span>综合管理</span>
            </el-menu-item>
            <el-menu-item index="capital">
              <el-icon><Money /></el-icon>
              <span>资金运营</span>
            </el-menu-item>
            <el-menu-item index="consumer">
              <el-icon><Document /></el-icon>
              <span>消保</span>
            </el-menu-item>
            <el-menu-item index="tech">
              <el-icon><Monitor /></el-icon>
              <span>金科与数据</span>
            </el-menu-item>
            <el-menu-item index="finance">
              <el-icon><Money /></el-icon>
              <span>财务</span>
            </el-menu-item>
            <el-menu-item index="legal">
              <el-icon><Document /></el-icon>
              <span>法律合规</span>
            </el-menu-item>
            <el-menu-item index="general">
              <el-icon><Grid /></el-icon>
              <span>通用</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>

      <!-- 右侧流程模板网格 -->
      <el-col :span="20">
        <el-card class="templates-card">
          <template #header>
            <div class="card-header">
              <span>{{ categoryNames[activeCategory] }}</span>
              <el-tag type="info" effect="plain">{{ filteredTemplates.length }} 个流程</el-tag>
            </div>
          </template>

          <el-row :gutter="16">
            <el-col
                :span="4"
                v-for="template in filteredTemplates"
                :key="template.id"
            >
              <el-card
                  shadow="hover"
                  class="template-card"
                  @click="selectTemplate(template)"
              >
                <div class="template-content">
                  <el-tag
                      v-if="template.isCommon"
                      type="warning"
                      size="small"
                      class="common-tag"
                      @click.stop="toggleCommon(template)"
                  >
                    <el-icon><Star /></el-icon>
                  </el-tag>
                  <el-tag
                      v-else
                      type="info"
                      size="small"
                      effect="plain"
                      class="common-tag"
                      @click.stop="toggleCommon(template)"
                  >
                    设为常用
                  </el-tag>
                  <div class="template-icon" :style="{ backgroundColor: template.color }">
                    <el-icon :size="28" color="#fff">
                      <component :is="template.icon" />
                    </el-icon>
                  </div>
                  <div class="template-name">{{ template.name }}</div>
                  <div class="template-desc">{{ template.description }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>

          <el-empty
              v-if="filteredTemplates.length === 0"
              description="暂无流程模板"
              :image-size="200"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Grid, Star, User, OfficeBuilding, Money, Briefcase, Monitor,
  Document, Timer, Stamp, FolderChecked, Plus, Van,
  VideoCamera, Files, Tools, Connection, Message
} from '@element-plus/icons-vue'

const router = useRouter()
const searchText = ref('')
const activeCategory = ref('all')
const previewVisible = ref(false)
const previewUrl = ref('')

const categoryNames = {
  all: '全部流程',
  common: '常用流程',
  admin: '行政',
  management: '综合管理',
  capital: '资金运营',
  consumer: '消保',
  tech: '金科与数据',
  finance: '财务',
  legal: '法律合规',
  general: '通用'
}

// 流程模板数据 - 银行系统专用
const templates = ref([
  // 常用流程
  { id: 1, name: '公司事务申请', description: '通用事务', icon: Document, color: '#409EFF', category: 'general', isCommon: true },
  { id: 2, name: '跨部门事务申请', description: '跨部门协作', icon: Briefcase, color: '#67C23A', category: 'general', isCommon: true },
  { id: 3, name: '办公场所进出权限申请', description: '门禁权限', icon: OfficeBuilding, color: '#E6A23C', category: 'admin', isCommon: false },
  { id: 4, name: '业务用车申请', description: '公务用车', icon: Van, color: '#F56C6C', category: 'admin', isCommon: false },
  { id: 5, name: '公务用餐申请', description: '工作用餐', icon: User, color: '#FA541C', category: 'admin', isCommon: false },
  { id: 6, name: '信息发布申请', description: '信息发布', icon: Document, color: '#1890FF', category: 'management', isCommon: false },
  { id: 7, name: '资金调拨事项审批', description: '资金划转', icon: Money, color: '#FAAD14', category: 'finance', isCommon: true },
  { id: 8, name: '系统岗位权限申请', description: '岗位权限', icon: Connection, color: '#722ED1', category: 'tech', isCommon: false },

  // 行政
  { id: 9, name: '部门主要负责人请假、备案', description: '高管请假', icon: Timer, color: '#409EFF', category: 'admin', isCommon: false },
  { id: 10, name: '部门其他负责人请假、备案', description: '负责人请假', icon: Timer, color: '#67C23A', category: 'admin', isCommon: false },
  { id: 11, name: '档案权证借阅审批', description: '档案借阅', icon: FolderChecked, color: '#E6A23C', category: 'admin', isCommon: false },
  { id: 12, name: '业务用印审批', description: '业务用印', icon: Stamp, color: '#F56C6C', category: 'admin', isCommon: false },
  { id: 13, name: '公司用印审批', description: '公司用印', icon: Stamp, color: '#FA541C', category: 'admin', isCommon: false },

  // 综合管理
  { id: 14, name: '会员中心任务、活动申请', description: '会员活动', icon: Star, color: '#1890FF', category: 'management', isCommon: false },
  { id: 15, name: '员工渠道相关事项', description: '员工渠道', icon: User, color: '#722ED1', category: 'management', isCommon: false },

  // 资金运营
  { id: 16, name: '营运业务申请', description: '营运业务', icon: Money, color: '#FAAD14', category: 'capital', isCommon: false },

  // 消保
  { id: 17, name: '产品与服务消保审查', description: '消保审查', icon: Document, color: '#13C2C2', category: 'consumer', isCommon: false },

  // 金科与数据
  { id: 18, name: '语音机器人话术修改申请单', description: '话术修改', icon: Monitor, color: '#409EFF', category: 'tech', isCommon: false },
  { id: 19, name: '数据修改申请单', description: '数据修改', icon: FolderChecked, color: '#67C23A', category: 'tech', isCommon: false },
  { id: 20, name: '办公网络接入申请及变更', description: '网络接入', icon: Connection, color: '#E6A23C', category: 'tech', isCommon: false },
  { id: 21, name: '测试云桌面账号申请', description: '测试账号', icon: Monitor, color: '#F56C6C', category: 'tech', isCommon: false },
  { id: 22, name: '短信触达申请', description: '短信发送', icon: Message, color: '#FA541C', category: 'tech', isCommon: false },
  { id: 23, name: '监管报送问题反馈', description: '监管报送', icon: Document, color: '#1890FF', category: 'tech', isCommon: false },
  { id: 24, name: '数据安全与个人客户信息保护影响评估处理单', description: '数据安全评估', icon: FolderChecked, color: '#722ED1', category: 'tech', isCommon: false },
  { id: 25, name: '数据外发申请', description: '数据外发', icon: FolderChecked, color: '#FAAD14', category: 'tech', isCommon: false },
  { id: 26, name: '移动办公 VPN 接入申请', description: 'VPN 接入', icon: Connection, color: '#13C2C2', category: 'tech', isCommon: false },
  { id: 27, name: '外部专家资源申请', description: '专家资源', icon: User, color: '#52C41A', category: 'tech', isCommon: false },
  { id: 28, name: '生产数据使用申请单', description: '生产数据', icon: FolderChecked, color: '#FA541C', category: 'tech', isCommon: false },

  // 财务
  { id: 29, name: '每日资金头寸安排', description: '头寸安排', icon: Money, color: '#409EFF', category: 'finance', isCommon: false },
  { id: 30, name: '拟提款申请', description: '提款申请', icon: Money, color: '#67C23A', category: 'finance', isCommon: false },
  { id: 31, name: '资金头寸调拨安排', description: '头寸调拨', icon: Money, color: '#E6A23C', category: 'finance', isCommon: false },
  { id: 32, name: '资金头寸调拨审批', description: '头寸审批', icon: Money, color: '#F56C6C', category: 'finance', isCommon: false },

  // 法律合规
  { id: 33, name: '法律性文件审查', description: '法律审查', icon: Document, color: '#722ED1', category: 'legal', isCommon: false },
  { id: 34, name: '知识产权文件审查', description: '知识产权', icon: Document, color: '#FAAD14', category: 'legal', isCommon: false }
])


const formData = reactive({
  title: '',
  priority: 'low',
  content: '',
  remark: ''
})

const filteredTemplates = computed(() => {
  let result = templates.value

  // 分类过滤
  if (activeCategory.value !== 'all') {
    if (activeCategory.value === 'common') {
      // 常用流程筛选
      result = templates.value.filter(t => t.isCommon)
    } else {
      result = templates.value.filter(t => t.category === activeCategory.value)
    }
  }

  // 搜索过滤
  if (searchText.value) {
    result = result.filter(t =>
        t.name.includes(searchText.value) ||
        t.description.includes(searchText.value)
    )
  }

  return result
})

const handleCategorySelect = (index) => {
  activeCategory.value = index
}

const selectTemplate = (template) => {
  // 直接跳转到详情页
  router.push({
    path: '/process/approval/detail',
    query: {
      id: Date.now(),
      templateId: template.id
    }
  })
}

const toggleCommon = (template) => {
  template.isCommon = !template.isCommon
  ElMessage.success(template.isCommon ? '已设为常用流程' : '已取消常用流程')
}

const handleRemove = (file, fileList) => {
  fileList.value = fileList
}

</script>

<style scoped lang="scss">
.start-container {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      font-size: 20px;
      color: #333;
      margin: 0;
      font-weight: 600;
    }
  }

  .category-card {
    .category-menu {
      border-right: none;

      .el-menu-item {
        height: 50px;
        line-height: 50px;
        border-radius: 4px;
        margin-bottom: 8px;

        &:hover {
          background-color: #f5f7fa;
        }

        &.is-active {
          background-color: #ecf5ff;
          color: #409EFF;
        }

        .el-icon {
          margin-right: 10px;
        }
      }
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .templates-card {
    max-height: calc(100vh - 180px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c1c1c1;
      border-radius: 3px;

      &:hover {
        background-color: #a8a8a8;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #f1f1f1;
    }
  }

  .template-card {
    margin-bottom: 16px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
    }

    .template-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 10px;

      .common-tag {
        position: absolute;
        top: 8px;
        right: 8px;
        cursor: pointer;
        z-index: 10;

        &:hover {
          opacity: 0.8;
        }
      }

      .template-icon {
        width: 60px;
        height: 60px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
        transition: all 0.3s;
        flex-shrink: 0;
      }

      .template-name {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 6px;
        line-height: 1.4;
      }

      .template-desc {
        font-size: 12px;
        color: #909399;
        line-height: 1.3;
      }
    }
  }
}
</style>

