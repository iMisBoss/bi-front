<template>
  <div class="integration-page">
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <span>移动端集成概览</span>
              <el-tag type="success">运行正常</el-tag>
            </div>
          </template>
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="stat-item">
                <el-icon :size="40" color="#409eff"><Mobile /></el-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.deviceCount }}</div>
                  <div class="stat-label">已激活设备</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <el-icon :size="40" color="#67c23a"><User /></el-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.userCount }}</div>
                  <div class="stat-label">活跃用户</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <el-icon :size="40" color="#e6a23c"><DataLine /></el-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.approvalCount }}</div>
                  <div class="stat-label">今日审批</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <el-icon :size="40" color="#f56c6c"><Bell /></el-icon>
                <div class="stat-content">
                  <div class="stat-value">{{ stats.pushCount }}</div>
                  <div class="stat-label">消息推送</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card class="platform-card">
          <template #header>
            <span>平台管理</span>
          </template>
          <el-table :data="platforms" border>
            <el-table-column prop="name" label="平台名称" width="150" />
            <el-table-column prop="version" label="版本" width="100" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '已上线' : '已下线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="users" label="用户数" width="100" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleViewPlatform(row)">查看</el-button>
                <el-button link type="primary" @click="handleEditPlatform(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="function-card">
          <template #header>
            <span>功能模块</span>
          </template>
          <el-table :data="functions" border>
            <el-table-column prop="name" label="功能名称" width="150" />
            <el-table-column prop="module" label="所属模块" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusTag(row.status)" size="small">
                  {{ row.statusText }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleConfigFunction(row)">配置</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <el-card class="version-card">
          <template #header>
            <div class="card-header">
              <span>版本管理</span>
              <el-button type="primary" @click="handleRelease">
                <el-icon><Upload /></el-icon>
                发布新版本
              </el-button>
            </div>
          </template>
          <el-table :data="versions" border>
            <el-table-column prop="version" label="版本号" width="120" />
            <el-table-column prop="platform" label="平台" width="100">
              <template #default="{ row }">
                <el-tag :type="row.platform === 'iOS' ? 'primary' : 'success'" size="small">
                  {{ row.platform }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="releaseTime" label="发布时间" width="180" />
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column prop="updateLog" label="更新日志" min-width="300" show-overflow-tooltip />
            <el-table-column prop="status" label="发布状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'warning'" size="small">
                  {{ row.status === 1 ? '已发布' : '审核中' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
                <el-button link type="danger" @click="handleOffline(row)">下线</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="releaseVisible" title="发布新版本" width="600px">
      <el-form :model="releaseForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="平台" prop="platform">
          <el-radio-group v-model="releaseForm.platform">
            <el-radio label="iOS">iOS</el-radio>
            <el-radio label="Android">Android</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="版本号" prop="version">
          <el-input v-model="releaseForm.version" placeholder="如：1.0.0" />
        </el-form-item>
        <el-form-item label="更新日志" prop="updateLog">
          <el-input v-model="releaseForm.updateLog" type="textarea" :rows="4" placeholder="请输入更新内容" />
        </el-form-item>
        <el-form-item label="安装包">
          <el-upload
              action="#"
              :auto-upload="false"
              :limit="1"
          >
            <el-button type="primary">
              <el-icon><Upload /></el-icon>
              上传安装包
            </el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="releaseVisible = false">取消</el-button>
        <el-button type="primary" @click="handleReleaseSubmit">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Mobile, User, DataLine, Bell, Upload } from '@element-plus/icons-vue'

const loading = ref(false)
const releaseVisible = ref(false)
const formRef = ref(null)

const stats = ref({
  deviceCount: 1256,
  userCount: 890,
  approvalCount: 156,
  pushCount: 2340
})

const platforms = ref([
  { id: 1, name: 'iOS 端', version: 'v2.1.0', status: 1, users: 680 },
  { id: 2, name: 'Android 端', version: 'v2.1.0', status: 1, users: 576 }
])

const functions = ref([
  { id: 1, name: '移动审批', module: '流程审批', status: 1, statusText: '已上线' },
  { id: 2, name: '移动考勤', module: '日常办公', status: 1, statusText: '已上线' },
  { id: 3, name: '消息推送', module: '消息中心', status: 1, statusText: '已上线' },
  { id: 4, name: '文档查看', module: '内容管理', status: 2, statusText: '测试中' }
])

const versions = ref([
  { id: 1, version: 'v2.1.0', platform: 'iOS', releaseTime: '2024-01-15 10:00', size: '45MB', updateLog: '1.优化审批流程 2.修复已知问题 3.提升系统稳定性', status: 1 },
  { id: 2, version: 'v2.1.0', platform: 'Android', releaseTime: '2024-01-14 09:00', size: '42MB', updateLog: '1.优化审批流程 2.修复已知问题 3.提升系统稳定性', status: 1 },
  { id: 3, version: 'v2.0.9', platform: 'iOS', releaseTime: '2024-01-01 10:00', size: '43MB', updateLog: '1.新增消息推送功能 2.优化界面体验', status: 2 }
])

const releaseForm = ref({
  platform: 'iOS',
  version: '',
  updateLog: ''
})

const rules = {
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  updateLog: [{ required: true, message: '请输入更新日志', trigger: 'blur' }]
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
}

const handleViewPlatform = (row) => {
  ElMessage.info('查看平台详情')
}

const handleEditPlatform = (row) => {
  ElMessage.info('编辑平台配置')
}

const handleConfigFunction = (row) => {
  ElMessage.info('配置功能模块')
}

const handleRelease = () => {
  releaseForm.value = { platform: 'iOS', version: '', updateLog: '' }
  releaseVisible.value = true
}

const handleReleaseSubmit = () => {
  ElMessage.success('版本发布成功')
  releaseVisible.value = false
  loadData()
}

const handleDownload = (row) => {
  ElMessage.success('开始下载')
}

const handleOffline = (row) => {
  ElMessage.warning('版本下线功能开发中')
}

const getStatusTag = (status) => {
  const types = { 1: 'success', 2: 'warning', 3: 'danger' }
  return types[status] || 'info'
}
</script>

<style lang="scss" scoped>
.integration-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .overview-card {
    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px;

      .stat-content {
        .stat-value {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }

  .platform-card,
  .function-card {
    height: 400px;
  }

  .version-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
