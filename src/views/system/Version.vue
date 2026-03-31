<template>
  <div class="version-container">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>当前版本</span>
              <el-tag type="success" size="large">v{{ currentVersion.version }}</el-tag>
            </div>
          </template>

          <el-descriptions :column="1" border>
            <el-descriptions-item label="版本号">
              v{{ currentVersion.version }}
            </el-descriptions-item>
            <el-descriptions-item label="发布日期">
              {{ currentVersion.releaseDate }}
            </el-descriptions-item>
            <el-descriptions-item label="构建号">
              {{ currentVersion.buildNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="环境">
              <el-tag :type="currentVersion.environment === 'production' ? 'success' : 'warning'">
                {{ currentVersion.environment === 'production' ? '生产环境' : '开发环境' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>

          <div class="update-info">
            <h4>更新内容</h4>
            <ul>
              <li v-for="(item, index) in currentVersion.changelog" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最新版本</span>
              <el-tag v-if="hasNewVersion" type="danger" size="large">
                v{{ latestVersion.version }}
              </el-tag>
              <el-tag v-else type="info" size="large">已是最新</el-tag>
            </div>
          </template>

          <el-descriptions :column="1" border v-if="hasNewVersion">
            <el-descriptions-item label="版本号">
              v{{ latestVersion.version }}
            </el-descriptions-item>
            <el-descriptions-item label="发布日期">
              {{ latestVersion.releaseDate }}
            </el-descriptions-item>
            <el-descriptions-item label="构建号">
              {{ latestVersion.buildNumber }}
            </el-descriptions-item>
            <el-descriptions-item label="更新大小">
              {{ latestVersion.size }}
            </el-descriptions-item>
          </el-descriptions>

          <div v-if="hasNewVersion" class="update-info">
            <h4>更新内容</h4>
            <ul>
              <li v-for="(item, index) in latestVersion.changelog" :key="index">
                {{ item }}
              </li>
            </ul>
          </div>

          <div class="action-buttons" v-if="hasNewVersion">
            <el-button type="primary" @click="handleUpdate">立即更新</el-button>
            <el-button @click="handleViewDetails">查看详情</el-button>
          </div>
          <div class="action-buttons" v-else>
            <el-button type="success" disabled>已是最新版本</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="box-card" style="margin-top: 20px">
      <template #header>
        <span>版本历史</span>
      </template>

      <el-timeline>
        <el-timeline-item
            v-for="(version, index) in versionHistory"
            :key="index"
            :timestamp="version.releaseDate"
            placement="top"
            :type="index === 0 ? 'primary' : 'success'"
        >
          <el-card>
            <h4>v{{ version.version }}</h4>
            <p>{{ version.description }}</p>
            <el-divider />
            <div class="changelog">
              <div v-for="(item, idx) in version.changelog" :key="idx" class="changelog-item">
                <el-icon><Check /></el-icon>
                <span>{{ item }}</span>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <el-dialog v-model="detailsDialogVisible" title="版本详情" width="800px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="最新版本">{{ latestVersion.version }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ latestVersion.releaseDate }}</el-descriptions-item>
        <el-descriptions-item label="更新大小">{{ latestVersion.size }}</el-descriptions-item>
        <el-descriptions-item label="强制更新">
          {{ latestVersion.forceUpdate ? '是' : '否' }}
        </el-descriptions-item>
        <el-descriptions-item label="详细说明" :span="2">
          <p>{{ latestVersion.description }}</p>
        </el-descriptions-item>
      </el-descriptions>

      <div style="margin-top: 20px">
        <h4>详细更新日志</h4>
        <ul>
          <li v-for="(item, index) in latestVersion.changelog" :key="index">
            {{ item }}
          </li>
        </ul>
      </div>

      <template #footer>
        <el-button @click="detailsDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleUpdate">立即下载更新</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check } from '@element-plus/icons-vue'

const detailsDialogVisible = ref(false)

const currentVersion = ref({
  version: '2.5.0',
  releaseDate: '2026-03-15',
  buildNumber: '20260315001',
  environment: 'production',
  changelog: [
    '新增 AI 会议纪要功能',
    '优化工作流审批流程',
    '修复移动端考勤 bug',
    '提升系统性能和稳定性'
  ]
})

const latestVersion = ref({
  version: '2.6.0',
  releaseDate: '2026-03-28',
  buildNumber: '20260328001',
  size: '45.8 MB',
  forceUpdate: false,
  description: '本次更新包含多个新功能和性能优化',
  changelog: [
    '新增数据分析报表功能',
    '新增批量导入导出功能',
    '优化移动端界面体验',
    '新增主题切换功能',
    '修复已知问题，提升系统稳定性'
  ]
})

const versionHistory = ref([
  {
    version: '2.5.0',
    releaseDate: '2026-03-15',
    description: 'AI 功能增强与性能优化',
    changelog: [
      '新增 AI 会议纪要功能',
      '优化工作流审批流程',
      '修复移动端考勤 bug'
    ]
  },
  {
    version: '2.4.0',
    releaseDate: '2026-02-28',
    description: '移动端功能完善',
    changelog: [
      '新增移动端审批功能',
      '新增移动端考勤打卡',
      '优化消息推送机制'
    ]
  },
  {
    version: '2.3.0',
    releaseDate: '2026-02-15',
    description: '组织架构管理升级',
    changelog: [
      '新增多层级组织架构',
      '新增员工档案管理',
      '优化权限控制体系'
    ]
  }
])

const hasNewVersion = computed(() => {
  return currentVersion.value.version !== latestVersion.value.version
})

const handleUpdate = () => {
  ElMessageBox.confirm(
      `确定要更新到版本 v${latestVersion.value.version} 吗？`,
      '系统更新',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    ElMessage.success('开始下载更新包...')
    setTimeout(() => {
      ElMessage.success('更新成功，系统将自动重启')
    }, 3000)
  }).catch(() => {})
}

const handleViewDetails = () => {
  detailsDialogVisible.value = true
}
</script>

<style scoped lang="scss">
.version-container {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .update-info {
    margin-top: 20px;

    h4 {
      margin-bottom: 10px;
      color: #303133;
    }

    ul {
      list-style: none;
      padding: 0;

      li {
        padding: 5px 0;
        color: #606266;

        &::before {
          content: '• ';
          color: #409EFF;
        }
      }
    }
  }

  .action-buttons {
    margin-top: 20px;
    text-align: center;
  }

  .changelog {
    margin-top: 10px;

    .changelog-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      color: #606266;

      .el-icon {
        margin-right: 8px;
        color: #67C23A;
      }
    }
  }
}
</style>
