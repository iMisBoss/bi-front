<template>
  <div class="security-control">
    <el-tabs v-model="activeTab">
      <!-- 敏感词库 -->
      <el-tab-pane label="敏感词库" name="sensitive-words">
        <div class="toolbar">
          <el-button-group>
            <el-button @click="handleBatchEnable" :disabled="selectedWords.length === 0">批量启用</el-button>
            <el-button @click="handleBatchDisable" :disabled="selectedWords.length === 0">批量禁用</el-button>
          </el-button-group>
          <el-button type="primary" @click="handleAdd" icon="Plus">新增敏感词</el-button>
          <el-button @click="handleImport" icon="Upload">批量导入</el-button>
          <el-button @click="handleExport" icon="Download">导出</el-button>
        </div>

        <el-table
            :data="sensitiveWords"
            border
            @selection-change="handleSelectionChange"
            row-key="id"
            style="flex: 1"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="word" label="敏感词" width="200" />
          <el-table-column prop="category" label="分类" width="120">
            <template #default="{ row }">
              <el-tag :type="getCategoryType(row.category)" size="small">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag :type="row.type === 'builtin' ? 'info' : 'primary'" size="small">
                {{ row.type === 'builtin' ? '内置' : '自定义' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 拦截规则 -->
      <el-tab-pane label="拦截规则" name="intercept-rules">
        <el-form label-width="150px" style="max-width: 600px; margin: 20px auto">
          <el-form-item label="提问拦截级别">
            <el-radio-group v-model="rules.questionLevel">
              <el-radio label="warning">提示警告（可提交）</el-radio>
              <el-radio label="block">强制拦截（不可提交）</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="AI输出拦截">
            <el-radio-group v-model="rules.outputLevel">
              <el-radio label="warning">提示警告</el-radio>
              <el-radio label="block">强制拦截</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="核心机密词">
            <el-switch v-model="rules.secretWordsEnabled" />
            <div class="form-tip">开启后，核心机密词拦截无用户提示，仅管理员可见记录</div>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveRules">保存规则</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 内网脱敏 -->
      <el-tab-pane label="内网脱敏" name="desensitization">
        <el-form label-width="150px" style="max-width: 600px; margin: 20px auto">
          <el-form-item label="手机号脱敏">
            <el-switch v-model="desensitization.phone" />
          </el-form-item>
          <el-form-item label="身份证脱敏">
            <el-switch v-model="desensitization.idCard" />
          </el-form-item>
          <el-form-item label="工号脱敏">
            <el-switch v-model="desensitization.employeeId" />
          </el-form-item>
          <el-form-item label="内网IP脱敏">
            <el-switch v-model="desensitization.ip" />
          </el-form-item>
          <el-form-item label="部门机密字段">
            <el-input v-model="desensitization.secretFields" type="textarea" :rows="3" placeholder="多个字段用逗号分隔" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveDesensitization">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 拦截记录 -->
      <el-tab-pane label="拦截记录" name="intercept-logs">
        <div class="filter-bar">
          <el-input placeholder="搜索人员/拦截内容" prefix-icon="Search" clearable style="width: 240px" />
          <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
          <el-button @click="handleExportLogs" icon="Download">导出记录</el-button>
        </div>

        <el-table :data="interceptLogs" border style="flex: 1">
          <el-table-column prop="time" label="拦截时间" width="160" />
          <el-table-column prop="user" label="人员" width="100" />
          <el-table-column prop="department" label="部门" width="120" />
          <el-table-column prop="content" label="拦截内容" min-width="250" show-overflow-tooltip />
          <el-table-column prop="type" label="类型" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.type === 'input' ? 'warning' : 'danger'" size="small">
                {{ row.type === 'input' ? '提问' : '输出' }}
              </el-tag>
            </template>
          </el-table-column>
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

const activeTab = ref('sensitive-words')
const selectedWords = ref([])

const sensitiveWords = ref([
  { id: 1, word: '政治敏感词1', category: '政治', type: 'builtin', status: 'enabled' },
  { id: 2, word: '项目代号A', category: '企业机密', type: 'custom', status: 'enabled' },
  { id: 3, word: '薪资信息', category: '企业机密', type: 'custom', status: 'enabled' },
  { id: 4, word: '违规词汇1', category: '违规', type: 'builtin', status: 'disabled' }
])

const rules = reactive({
  questionLevel: 'block',
  outputLevel: 'warning',
  secretWordsEnabled: true
})

const desensitization = reactive({
  phone: true,
  idCard: true,
  employeeId: true,
  ip: false,
  secretFields: '工资,奖金,股权激励'
})

const interceptLogs = ref([
  { id: 1, time: '2026-04-15 10:30', user: '张三', department: '技术部', content: '查询项目代号A的详细信息', type: 'input' },
  { id: 2, time: '2026-04-15 09:15', user: '李四', department: '财务部', content: 'AI输出了薪资相关数据', type: 'output' }
])

const getCategoryType = (category) => {
  const types = {
    '政治': 'danger',
    '违规': 'warning',
    '企业机密': 'info'
  }
  return types[category] || ''
}

const handleSelectionChange = (selection) => {
  selectedWords.value = selection
}

const handleAdd = () => {
  ElMessage.info('新增敏感词功能')
}

const handleEdit = (row) => {
  ElMessage.info('编辑敏感词功能')
}

const handleDelete = (row) => {
  if (row.type === 'builtin') {
    ElMessage.warning('内置敏感词不可删除')
    return
  }
  ElMessageBox.confirm(`确定要删除敏感词「${row.word}」吗？`, '删除敏感词', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    sensitiveWords.value = sensitiveWords.value.filter(item => item.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchEnable = () => {
  if (selectedWords.value.length === 0) return
  selectedWords.value.forEach(row => { row.status = 'enabled' })
  ElMessage.success('批量启用成功')
  selectedWords.value = []
}

const handleBatchDisable = () => {
  if (selectedWords.value.length === 0) return
  selectedWords.value.forEach(row => { row.status = 'disabled' })
  ElMessage.success('批量禁用成功')
  selectedWords.value = []
}

const handleImport = () => {
  ElMessage.info('批量导入功能')
}

const handleExport = () => {
  ElMessage.success('导出成功')
}

const handleSaveRules = () => {
  ElMessage.success('拦截规则保存成功')
}

const handleSaveDesensitization = () => {
  ElMessage.success('脱敏配置保存成功')
}

const handleExportLogs = () => {
  ElMessage.success('导出成功')
}

const handleReview = (row) => {
  ElMessage.info('复核拦截记录')
}
</script>

<style lang="scss" scoped>
.security-control {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
