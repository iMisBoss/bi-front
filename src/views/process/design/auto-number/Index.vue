<template>
  <div class="auto-number-management">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>自动编号规则管理</h2>
      <p class="subtitle">配置业务对象的单据编号自动生成规则</p>
    </div>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索规则名称、业务对象"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="规则状态" clearable style="width: 150px">
          <el-option label="已启用" value="enabled" />
          <el-option label="已停用" value="disabled" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增规则</el-button>
        <el-button type="success" icon="Download" @click="handleExport">导出规则</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
        :data="filteredRuleList"
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="ruleName" label="规则名称" min-width="180" />
      <el-table-column prop="businessObject" label="业务对象" min-width="150" />
      <el-table-column prop="numberFormat" label="编号格式" min-width="200">
        <template #default="{ row }">
          <el-tag size="small">{{ row.numberFormat }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="currentNumber" label="当前编号" width="150" />
      <el-table-column label="规则状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
              v-model="row.status"
              active-value="enabled"
              inactive-value="disabled"
              @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="280" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="View" @click="handlePreview(row)">预览</el-button>
            <el-button size="small" type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-bar">
      <span>共 {{ filteredRuleList.length }} 条记录</span>
      <el-pagination
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredRuleList.length"
          :page-sizes="[10, 20, 50]"
          v-model:page-size="pageSize"
          v-model:current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>

        <el-form-item label="业务对象" prop="businessObject">
          <el-select v-model="ruleForm.businessObject" placeholder="请选择业务对象" style="width: 100%">
            <el-option label="请假申请" value="leave_application" />
            <el-option label="加班申请" value="overtime_application" />
            <el-option label="会议申请" value="meeting_application" />
            <el-option label="车辆申请" value="vehicle_application" />
            <el-option label="费用报销" value="expense_reimbursement" />
          </el-select>
        </el-form-item>

        <el-form-item label="编号格式" prop="numberFormat">
          <el-input v-model="ruleForm.numberFormat" placeholder="例如：{YYYY}{MM}{DD}-{SEQ:4}" />
          <div class="format-tip">
            <p>格式说明：</p>
            <ul>
              <li><code>{YYYY}</code> - 四位年份</li>
              <li><code>{MM}</code> - 两位月份</li>
              <li><code>{DD}</code> - 两位日期</li>
              <li><code>{SEQ:4}</code> - 4位流水号（自动递增）</li>
              <li><code>{SEQ:6}</code> - 6位流水号</li>
            </ul>
          </div>
        </el-form-item>

        <el-form-item label="起始编号" prop="startNumber">
          <el-input-number v-model="ruleForm.startNumber" :min="1" :max="999999" style="width: 100%" />
        </el-form-item>

        <el-form-item label="重置规则" prop="resetRule">
          <el-radio-group v-model="ruleForm.resetRule">
            <el-radio label="never">永不重置</el-radio>
            <el-radio label="daily">每天重置</el-radio>
            <el-radio label="monthly">每月重置</el-radio>
            <el-radio label="yearly">每年重置</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="规则说明" prop="description">
          <el-input
              v-model="ruleForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入规则说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>

    <!-- 预览对话框 -->
    <el-dialog
        v-model="previewVisible"
        title="编号预览"
        width="500px"
        :close-on-click-modal="false"
    >
      <div class="preview-content" v-if="previewRule">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="规则名称">{{ previewRule.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="编号格式">{{ previewRule.numberFormat }}</el-descriptions-item>
          <el-descriptions-item label="示例编号">
            <el-tag type="success" size="large">{{ generateSampleNumber(previewRule) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="preview-examples">
          <h4>接下来3个编号示例：</h4>
          <ul>
            <li v-for="(num, index) in nextNumbers" :key="index">
              <el-tag>{{ num }}</el-tag>
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Edit, View, Delete } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const loading = ref(false)
const saving = ref(false)

// 规则列表
const ruleList = ref([
  {
    id: 1,
    ruleName: '请假申请编号规则',
    businessObject: '请假申请',
    numberFormat: 'QJ{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'QJ20240408-0015',
    startNumber: 1,
    resetRule: 'daily',
    description: '请假申请单自动生成编号，每日重置流水号',
    status: 'enabled',
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    ruleName: '加班申请编号规则',
    businessObject: '加班申请',
    numberFormat: 'JB{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'JB20240408-0008',
    startNumber: 1,
    resetRule: 'daily',
    description: '加班申请单自动生成编号',
    status: 'enabled',
    creator: '系统管理员',
    createTime: '2024-01-12 14:30:00'
  },
  {
    id: 3,
    ruleName: '会议申请编号规则',
    businessObject: '会议申请',
    numberFormat: 'HY{YYYY}{MM}-{SEQ:4}',
    currentNumber: 'HY202404-0023',
    startNumber: 1,
    resetRule: 'monthly',
    description: '会议申请单自动生成编号，每月重置',
    status: 'enabled',
    creator: '流程管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 4,
    ruleName: '车辆申请编号规则',
    businessObject: '车辆申请',
    numberFormat: 'CL{YYYY}{SEQ:6}',
    currentNumber: 'CL2024000125',
    startNumber: 1,
    resetRule: 'yearly',
    description: '车辆申请单自动生成编号，每年重置',
    status: 'disabled',
    creator: '系统管理员',
    createTime: '2024-01-15 11:00:00'
  },
  {
    id: 5,
    ruleName: '费用报销编号规则',
    businessObject: '费用报销',
    numberFormat: 'BX{YYYY}{MM}{DD}-{SEQ:6}',
    currentNumber: 'BX20240408-000042',
    startNumber: 1,
    resetRule: 'daily',
    description: '费用报销单自动生成编号',
    status: 'enabled',
    creator: '财务管理员',
    createTime: '2024-03-01 09:30:00'
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

// 筛选后的列表
const filteredRuleList = computed(() => {
  let result = [...ruleList.value]

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(rule =>
        rule.ruleName.toLowerCase().includes(keyword) ||
        rule.businessObject.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(rule => rule.status === filterStatus.value)
  }

  return result
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增规则')
const formRef = ref(null)
const ruleForm = ref({
  ruleName: '',
  businessObject: '',
  numberFormat: '',
  startNumber: 1,
  resetRule: 'never',
  description: ''
})

// 表单验证规则
const formRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { max: 50, message: '规则名称不能超过50个字符', trigger: 'blur' }
  ],
  businessObject: [
    { required: true, message: '请选择业务对象', trigger: 'change' }
  ],
  numberFormat: [
    { required: true, message: '请输入编号格式', trigger: 'blur' },
    {
      pattern: /\{SEQ:\d+\}/,
      message: '编号格式必须包含流水号 {SEQ:n}',
      trigger: 'blur'
    }
  ],
  startNumber: [
    { required: true, message: '请输入起始编号', trigger: 'blur' }
  ]
}

// 预览对话框
const previewVisible = ref(false)
const previewRule = ref(null)
const nextNumbers = ref([])

// 搜索
const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

// 重置
const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  currentPage.value = 1
  ElMessage.success('已重置查询条件')
}

// 新增
const handleAdd = () => {
  dialogTitle.value = '新增规则'
  ruleForm.value = {
    ruleName: '',
    businessObject: '',
    numberFormat: '',
    startNumber: 1,
    resetRule: 'never',
    description: ''
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑规则'
  ruleForm.value = { ...row }
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      setTimeout(() => {
        if (ruleForm.value.id) {
          // 编辑
          const index = ruleList.value.findIndex(r => r.id === ruleForm.value.id)
          if (index !== -1) {
            ruleList.value[index] = { ...ruleForm.value }
          }
          ElMessage.success('规则修改成功')
        } else {
          // 新增
          const newRule = {
            ...ruleForm.value,
            id: Date.now(),
            currentNumber: '-',
            creator: '当前用户',
            createTime: new Date().toLocaleString('zh-CN')
          }
          ruleList.value.unshift(newRule)
          ElMessage.success('规则新增成功')
        }

        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

// 状态变更
const handleStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '停用'
  ElMessage.success(`已${action}规则"${row.ruleName}"`)
}

// 预览
const handlePreview = (row) => {
  previewRule.value = row
  nextNumbers.value = generateNextNumbers(row)
  previewVisible.value = true
}

// 生成示例编号
const generateSampleNumber = (rule) => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  let format = rule.numberFormat
  format = format.replace('{YYYY}', year)
  format = format.replace('{MM}', month)
  format = format.replace('{DD}', day)
  format = format.replace('{SEQ:4}', '0001')
  format = format.replace('{SEQ:6}', '000001')

  return format
}

// 生成接下来3个编号
const generateNextNumbers = (rule) => {
  const numbers = []
  const currentNum = rule.currentNumber || '-'

  if (currentNum === '-') {
    // 从未使用过
    const sample = generateSampleNumber(rule)
    for (let i = 0; i < 3; i++) {
      numbers.push(sample.replace(/0001$/, String(i + 1).padStart(4, '0')))
    }
  } else {
    // 提取当前流水号
    const match = currentNum.match(/(\d{4,6})$/)
    if (match) {
      let currentSeq = parseInt(match[1])
      const prefix = currentNum.substring(0, currentNum.lastIndexOf(match[1]))
      for (let i = 1; i <= 3; i++) {
        numbers.push(`${prefix}${String(currentSeq + i).padStart(match[1].length, '0')}`)
      }
    }
  }

  return numbers
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
      `确定要删除规则"${row.ruleName}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    ruleList.value = ruleList.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
}

// 选择变化
const handleSelectionChange = (selection) => {
  console.log('选中的规则:', selection)
}

// 分页相关
const handleSizeChange = (size) => {
  pageSize.value = size
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}
</script>

<style scoped lang="scss">
.auto-number-management {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
      color: #303133;
    }

    .subtitle {
      margin: 0;
      font-size: 14px;
      color: #909399;
    }
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .toolbar-left {
      display: flex;
      gap: 12px;
    }

    .toolbar-right {
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

  .pagination-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 12px 0;
  }

  .format-tip {
    margin-top: 8px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 4px;
    font-size: 12px;

    p {
      margin: 0 0 8px;
      font-weight: 500;
      color: #606266;
    }

    ul {
      margin: 0;
      padding-left: 20px;

      li {
        margin: 4px 0;
        color: #909399;
      }

      code {
        padding: 2px 6px;
        background: #e4e7ed;
        border-radius: 3px;
        font-family: monospace;
        color: #409eff;
      }
    }
  }

  .preview-content {
    .preview-examples {
      margin-top: 20px;

      h4 {
        margin: 0 0 12px;
        font-size: 14px;
        color: #303133;
      }

      ul {
        list-style: none;
        padding: 0;
        margin: 0;

        li {
          padding: 8px 0;
        }
      }
    }
  }
}
</style>
