<template>
  <div class="security-control">
    <el-tabs v-model="activeSubTab" class="security-tabs">
      <!-- 子Tab1: 敏感词库 -->
      <el-tab-pane label="敏感词库" name="sensitive">
        <div class="toolbar">
          <div class="toolbar-left">
            <el-button-group>
              <el-button type="success" @click="handleBatchEnable" :disabled="selectedRows.length === 0">批量启用</el-button>
              <el-button type="warning" @click="handleBatchDisable" :disabled="selectedRows.length === 0">批量禁用</el-button>
            </el-button-group>
            <el-button @click="handleImport" icon="Upload">批量导入</el-button>
            <el-button @click="handleExportWords" icon="Download">导出词库</el-button>
          </div>
          <el-button type="primary" @click="handleAddWord" icon="Plus">新增敏感词</el-button>
        </div>

        <el-table
            :data="sensitiveWords"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
            style="flex: 1"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="word" label="敏感词" min-width="200" />
          <el-table-column prop="category" label="分类" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getCategoryType(row.category)" size="small">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="level" label="拦截级别" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.level === 'block' ? 'danger' : 'warning'" size="small">
                {{ row.level === 'block' ? '强制拦截' : '提示警告' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="scope" label="适用范围" width="150" />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEditWord(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDeleteWord(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 子Tab2: 拦截规则 -->
      <el-tab-pane label="拦截规则" name="rules">
        <el-form label-width="150px" style="max-width: 700px; margin: 20px auto">
          <el-form-item label="提问内容拦截">
            <el-switch v-model="interceptRules.questionIntercept" />
          </el-form-item>
          <el-form-item label="AI输出拦截">
            <el-switch v-model="interceptRules.outputIntercept" />
          </el-form-item>
          <el-form-item label="默认拦截级别">
            <el-select v-model="interceptRules.defaultLevel" style="width: 200px">
              <el-option label="提示警告（可提交）" value="warn" />
              <el-option label="强制拦截（不可提交）" value="block" />
            </el-select>
          </el-form-item>
          <el-form-item label="误拦截复核">
            <el-switch v-model="interceptRules.allowReview" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveRules">保存规则</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 子Tab3: 内网脱敏 -->
      <el-tab-pane label="内网脱敏" name="desensitization">
        <el-form label-width="150px" style="max-width: 700px; margin: 20px auto">
          <el-form-item label="手机号脱敏">
            <el-switch v-model="desensitization.phone" />
          </el-form-item>
          <el-form-item label="身份证号脱敏">
            <el-switch v-model="desensitization.idCard" />
          </el-form-item>
          <el-form-item label="工号脱敏">
            <el-switch v-model="desensitization.employeeNo" />
          </el-form-item>
          <el-form-item label="内网IP脱敏">
            <el-switch v-model="desensitization.ip" />
          </el-form-item>
          <el-form-item label="部门机密字段">
            <el-switch v-model="desensitization.departmentSecret" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveDesensitization">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 子Tab4: 拦截记录 -->
      <el-tab-pane label="拦截记录" name="records">
        <div class="filter-bar">
          <el-input placeholder="搜索拦截内容/人员" prefix-icon="Search" clearable style="width: 240px" />
          <el-select placeholder="拦截级别" style="width: 150px" clearable>
            <el-option label="提示警告" value="warn" />
            <el-option label="强制拦截" value="block" />
          </el-select>
          <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
          <el-button @click="handleExportRecords" icon="Download">导出记录</el-button>
        </div>

        <el-table :data="interceptRecords" border style="flex: 1">
          <el-table-column prop="time" label="拦截时间" width="160" />
          <el-table-column prop="user" label="人员" width="100" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="content" label="拦截内容" min-width="250" show-overflow-tooltip />
          <el-table-column prop="level" label="级别" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.level === 'block' ? 'danger' : 'warning'" size="small">
                {{ row.level === 'block' ? '强制拦截' : '提示警告' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleReview(row)">复核</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeSubTab = ref('sensitive')
const selectedRows = ref([])

const sensitiveWords = ref([
  { id: 1, word: '薪资', category: '企业机密', level: 'block', scope: '全系统', status: 'enabled' },
  { id: 2, word: '裁员', category: '企业机密', level: 'block', scope: '全系统', status: 'enabled' },
  { id: 3, word: '项目A', category: '项目名称', level: 'warn', scope: '全系统', status: 'enabled' },
  { id: 4, word: '政治敏感词', category: '政治词汇', level: 'block', scope: '全系统', status: 'enabled' }
])

const interceptRules = reactive({
  questionIntercept: true,
  outputIntercept: true,
  defaultLevel: 'block',
  allowReview: true
})

const desensitization = reactive({
  phone: true,
  idCard: true,
  employeeNo: true,
  ip: true,
  departmentSecret: true
})

const interceptRecords = ref([
  { time: '2026-04-15 10:30', user: '张三', department: '技术部', content: '请问公司今年的薪资调整方案是什么？', level: 'block', type: '提问拦截' },
  { time: '2026-04-15 09:15', user: '李四', department: '产品部', content: 'AI输出内容包含敏感信息', level: 'warn', type: '输出拦截' }
])

const getCategoryType = (category) => {
  const types = {
    '政治词汇': 'danger',
    '企业机密': 'warning',
    '项目名称': 'info'
  }
  return types[category] || ''
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleBatchEnable = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'enabled' })
  ElMessage.success('批量启用成功')
  selectedRows.value = []
}

const handleBatchDisable = () => {
  if (selectedRows.value.length === 0) return
  selectedRows.value.forEach(row => { row.status = 'disabled' })
  ElMessage.success('批量禁用成功')
  selectedRows.value = []
}

const handleImport = () => {
  ElMessage.info('批量导入功能')
}

const handleExportWords = () => {
  ElMessage.success('词库导出成功')
}

const handleAddWord = () => {
  ElMessage.info('新增敏感词功能')
}

const handleEditWord = (row) => {
  ElMessage.info('编辑敏感词功能')
}

const handleDeleteWord = (row) => {
  ElMessageBox.confirm(`确定要删除敏感词「${row.word}」吗？`, '删除敏感词', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    sensitiveWords.value = sensitiveWords.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveRules = () => {
  ElMessage.success('拦截规则保存成功')
}

const handleSaveDesensitization = () => {
  ElMessage.success('脱敏配置保存成功')
}

const handleExportRecords = () => {
  ElMessage.success('拦截记录导出成功')
}

const handleReview = (row) => {
  ElMessage.info('复核功能')
}
</script>

<style lang="scss" scoped>
.security-control {
  display: flex;
  flex-direction: column;
  height: 100%;

  .security-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    :deep(.el-tabs__header) {
      margin: 0 0 16px 0;
      padding-bottom: 0;
      border-bottom: 1px solid #ebeef5;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow: hidden;
      padding: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 8px;
    }
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
