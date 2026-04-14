NEW_FILE_CODE
<template>
  <div class="email-data-control">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button-group>
          <el-button
              type="danger"
              @click="handleBatchDelete"
              :disabled="selectedRows.length === 0"
              icon="Delete"
          >
            批量删除
          </el-button>
          <el-button
              @click="handleBatchArchive"
              :disabled="selectedRows.length === 0"
              icon="Folder"
          >
            批量归档
          </el-button>
          <el-button @click="handleExport" icon="Download">
            导出
          </el-button>
        </el-button-group>
      </div>

      <div class="toolbar-right">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索发件人、收件人、邮件主题"
            prefix-icon="Search"
            clearable
            style="width: 280px"
            @input="handleSearch"
        />
        <el-select
            v-model="statusFilter"
            placeholder="邮件状态"
            style="width: 120px"
            clearable
            @change="handleFilter"
        >
          <el-option label="全部" value="" />
          <el-option label="正常" value="normal" />
          <el-option label="已删除" value="deleted" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            @change="handleFilter"
        />
        <el-button @click="handleRefresh" icon="Refresh">刷新</el-button>
      </div>
    </div>

    <!-- 邮件列表表格 -->
    <el-table
        :data="filteredEmails"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
        style="flex: 1"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="subject" label="邮件主题" min-width="200" show-overflow-tooltip />
      <el-table-column prop="sender" label="发件人" width="120" />
      <el-table-column prop="receiver" label="收件人" width="150" show-overflow-tooltip />
      <el-table-column prop="sendTime" label="发送时间" width="160" />
      <el-table-column prop="size" label="邮件大小" width="100" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button
              link
              type="danger"
              size="small"
              @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 底部分页 -->
    <div class="pagination-wrapper">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 邮件详情抽屉 -->
    <EmailDetailDrawer
        v-model="showDetailDrawer"
        :data="currentEmail"
        @delete="handleDelete"
        @archive="handleArchive"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import EmailDetailDrawer from './EmailDetailDrawer.vue'

const selectedRows = ref([])
const currentEmail = ref(null)
const showDetailDrawer = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchKeyword = ref('')
const statusFilter = ref('')
const dateRange = ref(null)

const emailData = ref([])

const filteredEmails = computed(() => {
  let data = [...emailData.value]

  if (searchKeyword.value) {
    data = data.filter(item =>
        item.subject?.includes(searchKeyword.value) ||
        item.sender?.includes(searchKeyword.value) ||
        item.receiver?.includes(searchKeyword.value)
    )
  }

  if (statusFilter.value) {
    data = data.filter(item => item.status === statusFilter.value)
  }

  if (dateRange.value && dateRange.value.length === 2) {
    const [start, end] = dateRange.value
    data = data.filter(item => {
      const sendTime = new Date(item.sendTime)
      return sendTime >= start && sendTime <= end
    })
  }

  total.value = data.length
  return data
})

onMounted(() => {
  loadEmailData()
})

const loadEmailData = () => {
  emailData.value = [
    {
      id: 1,
      subject: '关于召开2026年度第一次全员大会的通知',
      sender: '张三',
      receiver: '技术部全员',
      cc: '李四、王五',
      sendTime: '2026-04-15 10:00',
      size: '2MB',
      status: 'normal',
      content: '<p>各位同事：</p><p>公司定于2026年4月20日上午9:00在总部大会议室召开2026年度第一次全员大会，请大家准时参加。</p><p>会议内容：</p><ol><li>2025年度工作总结</li><li>2026年度工作规划</li><li>优秀员工表彰</li></ol><p>请各部门做好参会准备。</p>',
      attachments: [
        { name: '会议议程.docx', size: '150KB' },
        { name: '参会名单.xlsx', size: '80KB' }
      ],
      logs: [
        { action: '发送', operator: '张三', time: '2026-04-15 10:00' }
      ]
    },
    {
      id: 2,
      subject: '项目技术方案评审',
      sender: '李四',
      receiver: '王五',
      cc: '',
      sendTime: '2026-04-14 14:00',
      size: '5MB',
      status: 'archived',
      content: '<p>王五：</p><p>附件是最新版的技术方案，请审阅。重点看第三部分架构设计。</p><p>有问题随时沟通。</p>',
      attachments: [
        { name: '技术方案V2.0.pdf', size: '4.8MB' }
      ],
      logs: [
        { action: '发送', operator: '李四', time: '2026-04-14 14:00' },
        { action: '归档', operator: '管理员', time: '2026-04-15 09:00' }
      ]
    },
    {
      id: 3,
      subject: '财务部4月报销截止日期提醒',
      sender: '周八',
      receiver: '全公司',
      cc: '',
      sendTime: '2026-04-13 16:30',
      size: '500KB',
      status: 'normal',
      content: '<p>各位同事：</p><p>4月报销截止日期为4月25日，请大家及时提交报销单据。</p><p>注意事项：</p><ul><li>发票必须为原件</li><li>金额超过5000元需领导审批</li><li>逾期不予受理</li></ul>',
      attachments: [
        { name: '报销流程说明.pdf', size: '480KB' }
      ],
      logs: [
        { action: '发送', operator: '周八', time: '2026-04-13 16:30' }
      ]
    },
    {
      id: 4,
      subject: '产品部Q2产品规划讨论',
      sender: '王五',
      receiver: '产品部全员',
      cc: '李四',
      sendTime: '2026-04-12 11:00',
      size: '1.5MB',
      status: 'normal',
      content: '<p>产品部各位同事：</p><p>下周一下午2点召开Q2产品规划讨论会，请准备好各自负责的产品线规划方案。</p>',
      attachments: [],
      logs: [
        { action: '发送', operator: '王五', time: '2026-04-12 11:00' }
      ]
    },
    {
      id: 5,
      subject: '系统升级通知',
      sender: '系统管理员',
      receiver: '全公司',
      cc: '',
      sendTime: '2026-04-10 18:00',
      size: '300KB',
      status: 'deleted',
      content: '<p>各位同事：</p><p>系统将于本周六凌晨2:00-6:00进行升级维护，届时将无法访问。</p><p>请大家提前保存工作。</p>',
      attachments: [],
      logs: [
        { action: '发送', operator: '系统管理员', time: '2026-04-10 18:00' },
        { action: '删除', operator: '管理员', time: '2026-04-11 09:00' }
      ]
    },
    {
      id: 6,
      subject: '前端开发组代码规范',
      sender: '张三',
      receiver: '前端开发组',
      cc: '',
      sendTime: '2026-04-09 15:30',
      size: '800KB',
      status: 'normal',
      content: '<p>前端开发组各位同事：</p><p>附件是最新的代码规范文档，请大家仔细阅读并严格执行。</p>',
      attachments: [
        { name: '前端代码规范V3.0.pdf', size: '780KB' }
      ],
      logs: [
        { action: '发送', operator: '张三', time: '2026-04-09 15:30' }
      ]
    }
  ]
  total.value = emailData.value.length
}

const getStatusType = (status) => {
  const types = {
    'normal': 'success',
    'deleted': 'danger',
    'archived': 'info'
  }
  return types[status] || ''
}

const getStatusText = (status) => {
  const texts = {
    'normal': '正常',
    'deleted': '已删除',
    'archived': '已归档'
  }
  return texts[status] || status
}

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleView = (row) => {
  currentEmail.value = row
  showDetailDrawer.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除邮件「${row.subject}」吗？`, '删除邮件', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'deleted'
    row.logs.push({
      action: '删除',
      operator: '管理员',
      time: new Date().toLocaleString()
    })
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleArchive = (row) => {
  row.status = 'archived'
  row.logs.push({
    action: '归档',
    operator: '管理员',
    time: new Date().toLocaleString()
  })
  ElMessage.success('归档成功')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
      `确定要批量删除 ${selectedRows.value.length} 封邮件吗？`,
      '批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'deleted'
      row.logs.push({
        action: '删除',
        operator: '管理员',
        time: new Date().toLocaleString()
      })
    })
    ElMessage.success('批量删除成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleBatchArchive = () => {
  if (selectedRows.value.length === 0) return

  ElMessageBox.confirm(
      `确定要批量归档 ${selectedRows.value.length} 封邮件吗？`,
      '批量归档',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
  ).then(() => {
    selectedRows.value.forEach(row => {
      row.status = 'archived'
      row.logs.push({
        action: '归档',
        operator: '管理员',
        time: new Date().toLocaleString()
      })
    })
    ElMessage.success('批量归档成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleExport = () => {
  ElMessage.success('邮件数据导出成功')
}

const handleRefresh = () => {
  loadEmailData()
  ElMessage.success('刷新成功')
}

const handleSearch = () => {}
const handleFilter = () => {}

const handleSizeChange = (val) => {
  pageSize.value = val
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
.email-data-control {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    flex-wrap: wrap;
    gap: 12px;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
      flex-wrap: wrap;
    }
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }
}
</style>
