<template>
  <div class="dependency-management">
    <div class="tab-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" size="default" icon="Refresh" @click="handleRefreshDependencies" :loading="refreshing">
          刷新依赖
        </el-button>
        <el-dropdown @command="handleExportCommand" :disabled="!hasData">
          <el-button size="default" icon="Download">
            导出依赖报告
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="excel">导出 Excel 清单</el-dropdown-item>
              <el-dropdown-item command="pdf">导出 PDF 审计报告</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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
          <el-table-column label="操作" width="220" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" icon="View" @click="handleViewForm(row)">查看表单</el-button>
                <el-button size="small" type="success" icon="Right" @click="handleJumpToForm(row)" disabled>
                  跳转到表单
                </el-button>
              </div>
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
          <el-table-column label="操作" width="220" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" icon="View" @click="handleViewProcess(row)">查看流程</el-button>
                <el-button size="small" type="success" icon="Right" @click="handleJumpToProcess(row)" disabled>
                  跳转到流程
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="关联规则" name="rules">
        <el-table :data="dependencyRules" border style="width: 100%" max-height="350">
          <el-table-column prop="ruleName" label="规则名称" min-width="200" />
          <el-table-column prop="ruleType" label="规则类型" width="120" />
          <el-table-column prop="status" label="规则状态" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
                {{ row.status === 'enabled' ? '启用' : '停用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" min-width="120" />
          <el-table-column prop="createTime" label="创建时间" min-width="180" />
          <el-table-column label="操作" width="150" align="center">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button size="small" type="primary" icon="View" @click="handleViewRule(row)">查看规则</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 查看详情对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        :title="detailTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-if="currentDetail">
        <el-descriptions-item label="名称">{{ currentDetail.formName || currentDetail.processName || currentDetail.ruleName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentDetail.status === 'enabled' ? 'success' : 'info'">
            {{ currentDetail.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建人">{{ currentDetail.creator }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item v-if="currentDetail.ruleType" label="规则类型">{{ currentDetail.ruleType }}</el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const dependencyTab = ref('forms')
const refreshing = ref(false)

const dependencyForms = ref([
  { formName: '请假申请表单', status: 'enabled', creator: '系统管理员', createTime: '2024-01-10 09:00:00', description: '员工请假申请使用的标准表单' },
  { formName: '加班申请表单', status: 'enabled', creator: '系统管理员', createTime: '2024-01-12 14:30:00', description: '员工加班申请使用的标准表单' }
])

const dependencyProcesses = ref([
  { processName: '请假审批流程', status: 'enabled', creator: '流程管理员', createTime: '2024-01-11 10:00:00', description: '员工请假审批的标准流程' }
])

const dependencyRules = ref([
  { ruleName: '请假天数校验规则', ruleType: '数据校验', status: 'enabled', creator: '系统管理员', createTime: '2024-01-10 10:00:00', description: '校验请假天数是否在合理范围内' },
  { ruleName: '自动编号生成规则', ruleType: '自动编号', status: 'enabled', creator: '系统管理员', createTime: '2024-01-01 00:00:00', description: '自动生成单据编号' }
])

// 计算是否有数据
const hasData = computed(() => {
  return dependencyForms.value.length > 0 ||
      dependencyProcesses.value.length > 0 ||
      dependencyRules.value.length > 0
})

// 详情对话框
const detailDialogVisible = ref(false)
const detailTitle = ref('')
const currentDetail = ref(null)

// 刷新依赖
const handleRefreshDependencies = () => {
  refreshing.value = true

  // 模拟刷新过程
  setTimeout(() => {
    refreshing.value = false
    ElMessage.success('依赖关系已刷新')
  }, 1000)
}

// 导出命令
const handleExportCommand = (command) => {
  if (command === 'excel') {
    exportToExcel()
  } else if (command === 'pdf') {
    exportToPdf()
  }
}

// 导出 Excel
const exportToExcel = () => {
  ElMessageBox.confirm('确定要导出依赖关系清单吗？', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    // 构建导出数据
    const exportData = []

    dependencyForms.value.forEach(form => {
      exportData.push({
        type: '表单',
        name: form.formName,
        status: form.status === 'enabled' ? '启用' : '停用',
        creator: form.creator,
        createTime: form.createTime
      })
    })

    dependencyProcesses.value.forEach(process => {
      exportData.push({
        type: '流程',
        name: process.processName,
        status: process.status === 'enabled' ? '启用' : '停用',
        creator: process.creator,
        createTime: process.createTime
      })
    })

    dependencyRules.value.forEach(rule => {
      exportData.push({
        type: '规则',
        name: rule.ruleName,
        type_detail: rule.ruleType,
        status: rule.status === 'enabled' ? '启用' : '停用',
        creator: rule.creator,
        createTime: rule.createTime
      })
    })

    // 生成 CSV 内容（简化版 Excel）
    const headers = ['类型', '名称', '状态', '创建人', '创建时间', '规则类型']
    const csvContent = [
      headers.join(','),
      ...exportData.map(item => [
        item.type,
        item.name,
        item.status,
        item.creator,
        item.createTime,
        item.type_detail || ''
      ].join(','))
    ].join('\n')

    // 下载文件
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `依赖关系清单_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    ElMessage.success(`成功导出 ${exportData.length} 条依赖记录`)
  }).catch(() => {})
}

// 导出 PDF
const exportToPdf = () => {
  ElMessageBox.confirm('确定要导出 PDF 审计报告吗？', '导出确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    ElMessage.info('PDF 导出功能需要后端支持，当前使用打印预览代替')

    // 使用浏览器打印功能代替 PDF 导出
    const printContent = generatePrintContent()
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }).catch(() => {})
}

// 生成打印内容
const generatePrintContent = () => {
  const now = new Date().toLocaleString('zh-CN')

  let html = `
    <html>
    <head>
      <title>依赖关系审计报告</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { text-align: center; color: #333; }
        .info { margin: 20px 0; padding: 10px; background: #f5f5f5; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f0f0f0; }
        .footer { margin-top: 30px; text-align: right; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1>业务对象依赖关系审计报告</h1>
      <div class="info">
        <p><strong>报告生成时间：</strong>${now}</p>
        <p><strong>关联表单：</strong>${dependencyForms.value.length} 个</p>
        <p><strong>关联流程：</strong>${dependencyProcesses.value.length} 个</p>
        <p><strong>关联规则：</strong>${dependencyRules.value.length} 个</p>
      </div>
  `

  if (dependencyForms.value.length > 0) {
    html += `<h2>关联表单</h2><table><tr><th>表单名称</th><th>状态</th><th>创建人</th><th>创建时间</th></tr>`
    dependencyForms.value.forEach(form => {
      html += `<tr><td>${form.formName}</td><td>${form.status === 'enabled' ? '启用' : '停用'}</td><td>${form.creator}</td><td>${form.createTime}</td></tr>`
    })
    html += `</table>`
  }

  if (dependencyProcesses.value.length > 0) {
    html += `<h2>关联流程</h2><table><tr><th>流程名称</th><th>状态</th><th>创建人</th><th>创建时间</th></tr>`
    dependencyProcesses.value.forEach(process => {
      html += `<tr><td>${process.processName}</td><td>${process.status === 'enabled' ? '启用' : '停用'}</td><td>${process.creator}</td><td>${process.createTime}</td></tr>`
    })
    html += `</table>`
  }

  if (dependencyRules.value.length > 0) {
    html += `<h2>关联规则</h2><table><tr><th>规则名称</th><th>规则类型</th><th>状态</th><th>创建人</th><th>创建时间</th></tr>`
    dependencyRules.value.forEach(rule => {
      html += `<tr><td>${rule.ruleName}</td><td>${rule.ruleType}</td><td>${rule.status === 'enabled' ? '启用' : '停用'}</td><td>${rule.creator}</td><td>${rule.createTime}</td></tr>`
    })
    html += `</table>`
  }

  html += `<div class="footer">本报告由系统自动生成 | ${now}</div></body></html>`

  return html
}

// 查看表单
const handleViewForm = (row) => {
  detailTitle.value = '表单详情'
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 跳转到表单（暂时禁用）
const handleJumpToForm = (row) => {
  ElMessage.info('跳转到表单功能开发中...')
}

// 查看流程
const handleViewProcess = (row) => {
  detailTitle.value = '流程详情'
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 跳转到流程（暂时禁用）
const handleJumpToProcess = (row) => {
  ElMessage.info('跳转到流程功能开发中...')
}

// 查看规则
const handleViewRule = (row) => {
  detailTitle.value = '规则详情'
  currentDetail.value = row
  detailDialogVisible.value = true
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
}
</style>
