<template>
  <div class="version-history">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="View" @click="handleVersionCompare">版本对比</el-button>
        <el-button size="default" type="warning" icon="RefreshLeft" @click="handleRollback">回滚到选中版本</el-button>
      </div>
    </div>

    <el-table :data="versionList" border style="width: 100%" max-height="400" :row-class-name="versionRowClassName" @selection-change="handleVersionSelection">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="version" label="版本号" width="100" />
      <el-table-column prop="publisher" label="发布人" min-width="120" />
      <el-table-column prop="publishTime" label="发布时间" min-width="180" />
      <el-table-column prop="description" label="变更说明" min-width="250" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="View" @click="handleViewVersion(row)">查看详情</el-button>
            <el-button size="small" icon="Compare" @click="handleCompareWithPrevious(row)">对比上一版本</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 版本详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="版本详情"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="2" border v-if="currentVersion">
        <el-descriptions-item label="版本号">{{ currentVersion.version }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentVersion.status)">
            {{ getStatusText(currentVersion.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentVersion.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentVersion.createTime }}</el-descriptions-item>
        <el-descriptions-item label="发布人">{{ currentVersion.publisher || '-' }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentVersion.publishTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="变更说明" :span="2">{{ currentVersion.description }}</el-descriptions-item>
      </el-descriptions>

      <div v-if="currentVersion && currentVersion.changes" style="margin-top: 16px">
        <h4>变更明细</h4>
        <ul class="changes-list">
          <li v-for="(change, index) in currentVersion.changes" :key="index">
            <el-tag size="small" :type="getChangeTag(change)" style="margin-right: 8px">
              {{ getChangeType(change) }}
            </el-tag>
            <span>{{ getChangeContent(change) }}</span>
          </li>
        </ul>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 版本对比对话框 -->
    <el-dialog
        v-model="compareDialogVisible"
        title="版本对比"
        width="900px"
        :close-on-click-modal="false"
    >
      <div class="compare-content">
        <div class="compare-header">
          <div class="compare-version">
            <h3>原版本 V{{ compareOriginal.version }}</h3>
            <el-tag :type="getStatusType(compareOriginal.status)">
              {{ getStatusText(compareOriginal.status) }}
            </el-tag>
          </div>
          <div class="compare-arrow">
            <el-icon :size="32" color="#409eff"><Right /></el-icon>
          </div>
          <div class="compare-version">
            <h3>新版本 V{{ compareNew.version }}</h3>
            <el-tag :type="getStatusType(compareNew.status)">
              {{ getStatusText(compareNew.status) }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <h4>变更明细</h4>
        <el-table :data="compareDiffList" border style="width: 100%" max-height="300">
          <el-table-column prop="type" label="变更类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="row.type === '新增' ? 'success' : row.type === '修改' ? 'warning' : 'danger'">
                {{ row.type }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="field" label="字段/项" min-width="150" />
          <el-table-column prop="oldValue" label="原版本" min-width="200" />
          <el-table-column prop="newValue" label="新版本" min-width="200" />
        </el-table>
      </div>

      <template #footer>
        <el-button @click="compareDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExportCompare">导出对比报告</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Right } from '@element-plus/icons-vue'

const versionList = ref([
  {
    id: 1,
    version: '1.3',
    status: 'published',
    createTime: '2024-03-15 10:30:00',
    publishTime: '2024-03-15 14:20:00',
    creator: '张三',
    publisher: '张三',
    description: '新增车辆类型、车牌号码字段，优化审批流程',
    changes: ['新增字段：车辆类型', '新增字段：车牌号码', '修改字段：用车事由（长度调整为2000）']
  },
  {
    id: 2,
    version: '1.2',
    status: 'published',
    createTime: '2024-02-20 09:15:00',
    publishTime: '2024-02-20 16:45:00',
    creator: '李四',
    publisher: '李四',
    description: '新增紧急联系人、联系电话字段，完善数据安全',
    changes: ['新增字段：紧急联系人', '新增字段：联系电话', '新增索引：idx_dept_status']
  },
  {
    id: 3,
    version: '1.1',
    status: 'published',
    createTime: '2024-01-10 11:00:00',
    publishTime: '2024-01-10 17:30:00',
    creator: '王五',
    publisher: '王五',
    description: '新增随行人数、目的地字段，优化用车申请体验',
    changes: ['新增字段：随行人数', '新增字段：目的地', '修改关联：车辆信息']
  },
  {
    id: 4,
    version: '1.0',
    status: 'published',
    createTime: '2023-12-01 08:00:00',
    publishTime: '2023-12-01 18:00:00',
    creator: '张三',
    publisher: '张三',
    description: '初始版本，包含基础字段和审批流程',
    changes: ['初始创建业务对象', '配置基础字段', '配置审批流程']
  },
  {
    id: 5,
    version: '0.9',
    status: 'deprecated',
    createTime: '2023-11-15 14:20:00',
    publishTime: null,
    creator: '张三',
    publisher: null,
    description: '测试版本，未发布',
    changes: ['测试字段配置', '测试关联关系']
  }
])

const selectedVersions = ref([])
const detailDialogVisible = ref(false)
const compareDialogVisible = ref(false)
const currentVersion = ref(null)
const compareOriginal = ref({})
const compareNew = ref({})
const compareDiffList = ref([])

const getStatusType = (status) => {
  const types = { draft: 'info', published: 'success', deprecated: 'info' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { draft: '草稿', published: '已发布', deprecated: '已废弃' }
  return texts[status] || status
}

const handleVersionSelection = (selection) => {
  selectedVersions.value = selection
}

const versionRowClassName = ({ row }) => {
  return row.status === 'published' ? 'version-row-latest' : ''
}

// 版本对比
const handleVersionCompare = () => {
  if (selectedVersions.value.length !== 2) {
    ElMessage.warning('请选择两个版本进行对比')
    return
  }

  // 按版本号排序
  const sorted = [...selectedVersions.value].sort((a, b) => {
    return parseFloat(a.version) - parseFloat(b.version)
  })

  compareOriginal.value = sorted[0]
  compareNew.value = sorted[1]

  // 生成对比差异数据
  generateCompareDiff(sorted[0], sorted[1])
  compareDialogVisible.value = true
}

// 生成对比差异
const generateCompareDiff = (oldVersion, newVersion) => {
  const diffList = []

  // 模拟对比逻辑
  const oldChanges = oldVersion.changes || []
  const newChanges = newVersion.changes || []

  // 找出新增的变更
  newChanges.forEach(change => {
    if (!oldChanges.includes(change)) {
      const type = getChangeType(change)
      const field = getChangeContent(change)
      diffList.push({
        type: '新增',
        field: field,
        oldValue: '-',
        newValue: '已添加'
      })
    }
  })

  // 找出删除的变更
  oldChanges.forEach(change => {
    if (!newChanges.includes(change)) {
      const type = getChangeType(change)
      const field = getChangeContent(change)
      diffList.push({
        type: '删除',
        field: field,
        oldValue: '已删除',
        newValue: '-'
      })
    }
  })

  compareDiffList.value = diffList
}

// 回滚版本
const handleRollback = () => {
  if (selectedVersions.value.length !== 1) {
    ElMessage.warning('请选择一个版本进行回滚')
    return
  }

  const targetVersion = selectedVersions.value[0]

  ElMessageBox.confirm(
      `确定要回滚到版本 ${targetVersion.version} 吗？\n\n回滚后将撤销之后的所有变更，此操作不可恢复！`,
      '回滚确认',
      {
        confirmButtonText: '确认回滚',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ElMessage.success(`已成功回滚到版本 ${targetVersion.version}`)
  }).catch(() => {})
}

// 查看版本详情
const handleViewVersion = (row) => {
  currentVersion.value = { ...row }
  detailDialogVisible.value = true
}

// 对比上一版本
const handleCompareWithPrevious = (row) => {
  const currentIndex = versionList.value.findIndex(v => v.id === row.id)

  if (currentIndex === versionList.value.length - 1) {
    ElMessage.warning('当前已是初始版本，没有上一版本可对比')
    return
  }

  const previousVersion = versionList.value[currentIndex + 1]

  compareOriginal.value = previousVersion
  compareNew.value = row

  generateCompareDiff(previousVersion, row)
  compareDialogVisible.value = true
}

// 导出对比报告
const handleExportCompare = () => {
  ElMessage.success('对比报告导出功能开发中...')
}

// 解析变更类型
const getChangeType = (change) => {
  if (change.startsWith('新增')) return '新增'
  if (change.startsWith('修改')) return '修改'
  if (change.startsWith('删除')) return '删除'
  return '其他'
}

// 解析变更内容
const getChangeContent = (change) => {
  return change.replace(/^(新增|修改|删除)(字段|索引|关联)：?/, '')
}

// 获取变更标签类型
const getChangeTag = (change) => {
  const type = getChangeType(change)
  const tags = { '新增': 'success', '修改': 'warning', '删除': 'danger' }
  return tags[type] || 'info'
}

defineExpose({
  versionList,
  selectedVersions
})
</script>

<style scoped lang="scss">
.version-history {
  .tab-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }
  }

  // 操作按钮组不换行
  :deep(.el-table__cell) {
    .action-buttons {
      display: inline-flex !important;
      gap: 8px;
      justify-content: center;
      align-items: center;
      flex-wrap: nowrap !important;
      white-space: nowrap !important;

      .el-button {
        margin: 0 !important;
        white-space: nowrap !important;
      }
    }
  }

  :deep(.version-row-latest) {
    background-color: #f0f9eb !important;
  }

  .changes-list {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      padding: 8px 0;
      border-bottom: 1px solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .compare-content {
    .compare-header {
      display: flex;
      align-items: center;
      justify-content: space-around;
      padding: 16px 0;

      .compare-version {
        text-align: center;

        h3 {
          margin: 0 0 8px;
          font-size: 16px;
          color: #303133;
        }
      }

      .compare-arrow {
        display: flex;
        align-items: center;
      }
    }

    h4 {
      margin: 16px 0 12px;
      font-size: 14px;
      color: #303133;
    }
  }
}
</style>
