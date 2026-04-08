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
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button size="small" type="primary" icon="View" @click="handleViewVersion(row)">查看详情</el-button>
          <el-button size="small" icon="Compare" @click="handleCompareWithPrevious(row)">对比上一版本</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

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

const getStatusType = (status) => {
  const types = { draft: 'info', published: 'success' }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { draft: '草稿', published: '已发布' }
  return texts[status] || status
}

const handleVersionSelection = (selection) => {
  selectedVersions.value = selection
}

const versionRowClassName = ({ row }) => {
  return row.status === 'published' ? 'version-row-latest' : ''
}

const handleVersionCompare = () => {
  if (selectedVersions.value.length !== 2) {
    ElMessage.warning('请选择两个版本进行对比')
    return
  }
  ElMessage.info('版本对比功能开发中...')
}

const handleRollback = () => {
  if (selectedVersions.value.length !== 1) {
    ElMessage.warning('请选择一个版本进行回滚')
    return
  }
  ElMessageBox.confirm(`回滚到版本${selectedVersions.value[0].version}将撤销之后的所有变更，此操作不可恢复！`, '回滚确认', { type: 'warning' }).then(() => {
    ElMessage.success('回滚成功')
  }).catch(() => {})
}

const handleViewVersion = (row) => {
  ElMessage.info('查看版本详情功能开发中...')
}

const handleCompareWithPrevious = (row) => {
  ElMessage.info('对比上一版本功能开发中...')
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

  :deep(.version-row-latest) {
    background-color: #f0f9eb !important;
  }
}
</style>
