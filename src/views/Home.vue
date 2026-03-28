<template>
  <div class="home-page">
    <el-row :gutter="20">
      <!-- 快捷入口 -->
      <el-col :span="24">
        <el-card class="quick-access">
          <template #header>
            <span>快捷入口</span>
          </template>
          <el-row :gutter="20">
            <el-col :span="3" v-for="item in quickAccessList" :key="item.path">
              <div class="access-items" @click="navigateTo(item.path)">
                <el-icon :size="40" :color="item.color">
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.name }}</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <!-- 组织人事管理 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>组织人事管理</span>
              <el-button link type="primary" @click="navigateTo('/org')">更多</el-button>
            </div>
          </template>
          <el-table :data="orgFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 流程审批中心 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>流程审批中心</span>
              <el-button link type="primary" @click="navigateTo('/process')">更多</el-button>
            </div>
          </template>
          <el-table :data="processFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 内容管理中心 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>内容管理中心</span>
              <el-button link type="primary" @click="navigateTo('/cms')">更多</el-button>
            </div>
          </template>
          <el-table :data="cmsFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 日常办公 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>日常办公</span>
              <el-button link type="primary" @click="navigateTo('/office')">更多</el-button>
            </div>
          </template>
          <el-table :data="officeFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- AI 智能助手 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>AI 智能助手</span>
              <el-button link type="primary" @click="navigateTo('/ai')">更多</el-button>
            </div>
          </template>
          <el-table :data="aiFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 消息中心 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>消息中心</span>
              <el-button link type="primary" @click="navigateTo('/message')">更多</el-button>
            </div>
          </template>
          <el-table :data="messageFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 系统管理 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>系统管理</span>
              <el-button link type="primary" @click="navigateTo('/system')">更多</el-button>
            </div>
          </template>
          <el-table :data="systemFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <!-- 移动端 -->
      <el-col :span="12">
        <el-card class="module-card">
          <template #header>
            <div class="card-header">
              <span>移动端</span>
              <el-button link type="primary" @click="navigateTo('/mobile')">更多</el-button>
            </div>
          </template>
          <el-table :data="mobileFunctions" style="width: 100%" :show-header="false">
            <el-table-column prop="name" label="功能" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.status === '已上线' ? 'success' : 'warning'" size="small">
                  {{ row.status }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const quickAccessList = ref([
  { name: '流程设计', path: '/process/designer', icon: 'Connection', color: '#409EFF' },
  { name: '我的待办', path: '/process/todo', icon: 'Document', color: '#67C23A' },
  { name: '考勤打卡', path: '/office/attendance', icon: 'Clock', color: '#E6A23C' },
  { name: '会议管理', path: '/office/meeting', icon: 'VideoCamera', color: '#909399' },
  { name: '公文管理', path: '/cms/document', icon: 'Folder', color: '#F56C6C' },
  { name: 'AI 问答', path: '/ai/qa', icon: 'ChatDotRound', color: '#1890ff' }
])

const orgFunctions = ref([
  { name: '人员档案管理', status: '已上线' },
  { name: '部门管理', status: '已上线' },
  { name: '岗位管理', status: '已上线' },
  { name: '角色权限', status: '已上线' },
  { name: '职级体系', status: '规划中' },
  { name: '员工入职离职', status: '规划中' }
])

const processFunctions = ref([
  { name: '流程设计器', status: '已上线' },
  { name: '表单设计器', status: '已上线' },
  { name: '我的待办', status: '已上线' },
  { name: '我已处理', status: '已上线' },
  { name: '流程监控', status: '已上线' },
  { name: '超时督办', status: '规划中' }
])

const cmsFunctions = ref([
  { name: '新闻公告', status: '已上线' },
  { name: '公文管理', status: '已上线' },
  { name: '知识库', status: '已上线' },
  { name: '文档库', status: '已上线' },
  { name: '规章制度', status: '规划中' },
  { name: '企业文化', status: '规划中' }
])

const officeFunctions = ref([
  { name: '考勤打卡', status: '已上线' },
  { name: '请假休假', status: '已上线' },
  { name: '会议管理', status: '已上线' },
  { name: '车辆申请', status: '规划中' },
  { name: '用品申领', status: '规划中' },
  { name: '用印申请', status: '规划中' }
])

const aiFunctions = ref([
  { name: 'AI 问答客服', status: '规划中' },
  { name: '智能写作', status: '规划中' },
  { name: '文档摘要', status: '规划中' },
  { name: '会议纪要', status: '规划中' }
])

const messageFunctions = ref([
  { name: '站内消息', status: '已上线' },
  { name: '短信通知', status: '已上线' },
  { name: '邮件推送', status: '已上线' },
  { name: '建行员工提醒', status: '规划中' }
])

const systemFunctions = ref([
  { name: '参数配置', status: '已上线' },
  { name: '日志审计', status: '已上线' },
  { name: '数据备份', status: '已上线' },
  { name: '版本管理', status: '规划中' }
])

const mobileFunctions = ref([
  { name: '移动端集成', status: '已上线' },
  { name: '移动审批', status: '已上线' },
  { name: '移动考勤', status: '已上线' },
  { name: '消息推送', status: '已上线' }
])

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 20px;

  .quick-access {
    margin-bottom: 20px;

    .access-items {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 20px 10px;
      transition: all 0.3s;
      border-radius: 4px;

      &:hover {
        background: #f5f7fa;
        transform: translateY(-2px);
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
      }

      span {
        margin-top: 10px;
        font-size: 13px;
        color: #606266;
      }
    }
  }

  .module-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
