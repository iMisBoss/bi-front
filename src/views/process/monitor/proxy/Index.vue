<template>
  <div class="proxy-settings">
    <div class="page-header">
      <h2>审批代理管理</h2>
      <p class="subtitle">配置审批人在特定时间段内的代理人，确保流程正常流转</p>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索委托人、代理人"
            clearable
            style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filterStatus" placeholder="代理状态" clearable style="width: 150px">
          <el-option label="生效中" value="active" />
          <el-option label="未开始" value="pending" />
          <el-option label="已结束" value="expired" />
        </el-select>
        <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button icon="Refresh" @click="handleReset">重置</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Plus" @click="handleAdd">新增代理</el-button>
      </div>
    </div>

    <el-table
        :data="filteredProxyList"
        border
        style="width: 100%"
        v-loading="loading"
    >
      <el-table-column prop="delegator" label="委托人" width="120" />
      <el-table-column prop="delegate" label="代理人" width="120" />
      <el-table-column prop="startTime" label="开始时间" width="180" />
      <el-table-column prop="endTime" label="结束时间" width="180" />
      <el-table-column prop="scope" label="代理范围" min-width="150" show-overflow-tooltip />
      <el-table-column prop="status" label="代理状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="getStatusTag(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="220" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button
                v-if="row.status === 'active'"
                size="small"
                type="danger"
                icon="Close"
                @click="handleCancel(row)"
            >
              取消
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="600px"
        :close-on-click-modal="false"
    >
      <el-form :model="proxyForm" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="委托人" prop="delegator">
          <el-select v-model="proxyForm.delegator" placeholder="请选择委托人" style="width: 100%">
            <el-option label="张三" value="zhangsan" />
            <el-option label="李四" value="lisi" />
            <el-option label="王五" value="wangwu" />
          </el-select>
        </el-form-item>

        <el-form-item label="代理人" prop="delegate">
          <el-select v-model="proxyForm.delegate" placeholder="请选择代理人" style="width: 100%">
            <el-option label="赵六" value="zhaoliu" />
            <el-option label="孙七" value="sunqi" />
            <el-option label="周八" value="zhouba" />
          </el-select>
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
              v-model="proxyForm.startTime"
              type="datetime"
              placeholder="选择开始时间"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
              v-model="proxyForm.endTime"
              type="datetime"
              placeholder="选择结束时间"
              style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="代理范围" prop="scope">
          <el-select v-model="proxyForm.scope" multiple placeholder="请选择代理范围" style="width: 100%">
            <el-option label="全部流程" value="all" />
            <el-option label="请假审批" value="leave" />
            <el-option label="费用报销" value="expense" />
            <el-option label="加班审批" value="overtime" />
          </el-select>
        </el-form-item>

        <el-form-item label="代理说明" prop="description">
          <el-input
              v-model="proxyForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入代理说明"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Edit, Close } from '@element-plus/icons-vue'

const searchKeyword = ref('')
const filterStatus = ref('')
const loading = ref(false)
const saving = ref(false)

const proxyList = ref([
  {
    id: 1,
    delegator: '张三',
    delegate: '赵六',
    startTime: '2024-04-08 00:00:00',
    endTime: '2024-04-15 23:59:59',
    scope: '全部流程',
    status: 'active',
    createTime: '2024-04-07 16:00:00',
    description: '张三出差期间由赵六代理审批'
  },
  {
    id: 2,
    delegator: '李四',
    delegate: '孙七',
    startTime: '2024-04-10 00:00:00',
    endTime: '2024-04-20 23:59:59',
    scope: '请假审批、费用报销',
    status: 'pending',
    createTime: '2024-04-08 09:00:00',
    description: '李四休假期间由孙七代理'
  },
  {
    id: 3,
    delegator: '王五',
    delegate: '周八',
    startTime: '2024-04-01 00:00:00',
    endTime: '2024-04-07 23:59:59',
    scope: '全部流程',
    status: 'expired',
    createTime: '2024-03-31 17:00:00',
    description: '已结束代理'
  }
])

const dialogVisible = ref(false)
const dialogTitle = ref('新增代理')
const formRef = ref(null)
const proxyForm = ref({
  delegator: '',
  delegate: '',
  startTime: '',
  endTime: '',
  scope: [],
  description: ''
})

const formRules = {
  delegator: [{ required: true, message: '请选择委托人', trigger: 'change' }],
  delegate: [{ required: true, message: '请选择代理人', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

const filteredProxyList = computed(() => {
  let result = [...proxyList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(p =>
        p.delegator.toLowerCase().includes(keyword) ||
        p.delegate.toLowerCase().includes(keyword)
    )
  }

  if (filterStatus.value) {
    result = result.filter(p => p.status === filterStatus.value)
  }

  return result
})

const handleSearch = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查询完成')
  }, 500)
}

const handleReset = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  ElMessage.success('已重置查询条件')
}

const handleAdd = () => {
  dialogTitle.value = '新增代理'
  proxyForm.value = {
    delegator: '',
    delegate: '',
    startTime: '',
    endTime: '',
    scope: [],
    description: ''
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑代理'
  proxyForm.value = { ...row }
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true
      setTimeout(() => {
        if (proxyForm.value.id) {
          const index = proxyList.value.findIndex(p => p.id === proxyForm.value.id)
          if (index !== -1) {
            proxyList.value[index] = { ...proxyForm.value }
          }
          ElMessage.success('代理修改成功')
        } else {
          proxyList.value.unshift({
            ...proxyForm.value,
            id: Date.now(),
            status: 'pending',
            createTime: new Date().toLocaleString('zh-CN')
          })
          ElMessage.success('代理新增成功')
        }
        saving.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const handleCancel = (row) => {
  ElMessageBox.confirm(
      `确定要取消${row.delegator}的代理设置吗？`,
      '取消确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    row.status = 'expired'
    ElMessage.success('代理已取消')
  }).catch(() => {})
}

const getStatusTag = (status) => {
  const tags = { active: 'success', pending: 'warning', expired: 'info' }
  return tags[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { active: '生效中', pending: '未开始', expired: '已结束' }
  return texts[status] || status
}
</script>

<style scoped lang="scss">
.proxy-settings {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    h2 {
      margin: 0 0 8px;
      font-size: 20px;
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

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

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
