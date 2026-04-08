<template>
  <div class="dependency-management">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Refresh" @click="handleRefreshDependencies">刷新依赖</el-button>
        <el-button size="default" icon="Download" @click="handleExportDependencies">导出依赖报告</el-button>
      </div>
    </div>

    <el-tabs v-model="dependencyTab" class="dependency-tabs">
      <el-tab-pane label="关联表单" name="forms">
        <el-table :data="dependencyForms" border style="width: 100%" max-height="350">
          <el-table-column prop="formName" label="表单名称" min-width="200" />
          <el-table-column prop="status" label="表单状态" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ row.status === 'enabled' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" min-width="120" />
          <el-table-column prop="createTime" label="创建时间" min-width="180" />
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" icon="View" @click="handleViewForm(row)">查看表单</el-button>
              <el-button size="small" type="success" icon="Right" @click="handleJumpToForm(row)">跳转到表单</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="关联流程" name="processes">
        <el-table :data="dependencyProcesses" border style="width: 100%" max-height="350">
          <el-table-column prop="processName" label="流程名称" min-width="200" />
          <el-table-column prop="status" label="流程状态" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ row.status === 'enabled' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" min-width="120" />
          <el-table-column prop="createTime" label="创建时间" min-width="180" />
          <el-table-column label="操作" width="180" align="center">
            <template #default="{ row }">
              <el-button size="small" type="primary" icon="View" @click="handleViewProcess(row)">查看流程</el-button>
              <el-button size="small" type="success" icon="Right" @click="handleJumpToProcess(row)">跳转到流程</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="关联报表" name="reports">
        <el-empty description="暂无关联报表" />
      </el-tab-pane>

      <el-tab-pane label="关联接口" name="apis">
        <el-empty description="暂无关联接口" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const dependencyTab = ref('forms')
const dependencyForms = ref([
  { formName: '请假申请表单', status: 'enabled', creator: '系统管理员', createTime: '2024-01-10 09:00:00' },
  { formName: '加班申请表单', status: 'enabled', creator: '系统管理员', createTime: '2024-01-12 14:30:00' }
])
const dependencyList = ref([
  {
    id: 1,
    dependencyType: '流程',
    dependencyName: '车辆申请审批流程',
    dependencyCode: 'vehicle_approval_flow',
    status: 'published',
    usage: '表单绑定、条件判断、节点分配',
    description: '该业务对象被车辆申请审批流程引用，用于表单展示和流程流转'
  },
  {
    id: 2,
    dependencyType: '表单',
    dependencyName: '车辆申请表单',
    dependencyCode: 'vehicle_application_form',
    status: 'published',
    usage: '字段绑定、数据联动',
    description: '该业务对象被车辆申请表单引用，用于字段配置和数据展示'
  },
  {
    id: 3,
    dependencyType: '报表',
    dependencyName: '车辆使用统计报表',
    dependencyCode: 'vehicle_usage_report',
    status: 'published',
    usage: '数据查询、统计汇总',
    description: '该业务对象被车辆使用统计报表引用，用于数据统计分析'
  },
  {
    id: 4,
    dependencyType: '报表',
    dependencyName: '部门用车分析报表',
    dependencyCode: 'dept_vehicle_analysis',
    status: 'published',
    usage: '数据查询、多维分析',
    description: '该业务对象被部门用车分析报表引用，用于多维度数据分析'
  },
  {
    id: 5,
    dependencyType: '数据规则',
    dependencyName: '车辆冲突检测规则',
    dependencyCode: 'vehicle_conflict_rule',
    status: 'published',
    usage: '字段校验、业务逻辑',
    description: '该业务对象被车辆冲突检测规则引用，用于时间段冲突校验'
  },
  {
    id: 6,
    dependencyType: '流程',
    dependencyName: '车辆归还审批流程',
    dependencyCode: 'vehicle_return_flow',
    status: 'draft',
    usage: '表单绑定',
    description: '该业务对象被车辆归还审批流程引用（草稿状态）'
  }
])
const dependencyProcesses = ref([
  { processName: '请假审批流程', status: 'enabled', creator: '流程管理员', createTime: '2024-01-11 10:00:00' }
])

const handleRefreshDependencies = () => {
  ElMessage.success('依赖关系已刷新')
}

const handleExportDependencies = () => {
  ElMessage.info('导出依赖报告功能开发中...')
}

const handleViewForm = (row) => {
  ElMessage.info('查看表单功能开发中...')
}

const handleJumpToForm = (row) => {
  ElMessage.info('跳转到表单功能开发中...')
}

const handleViewProcess = (row) => {
  ElMessage.info('查看流程功能开发中...')
}

const handleJumpToProcess = (row) => {
  ElMessage.info('跳转到流程功能开发中...')
}
</script>

<style scoped lang="scss">
.dependency-management {
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

  .dependency-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }
  }
}
</style>
