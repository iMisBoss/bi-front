<template>
  <div class="remind-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>建行员工提醒</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            添加提醒
          </el-button>
        </div>
      </template>

      <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="未读提醒" name="unread" />
          <el-tab-pane label="已读提醒" name="read" />
          <el-tab-pane label="全部提醒" name="all" />
        </el-tabs>

        <div>
          未读：            <el-badge :value="unreadCount" :hidden="unreadCount === 0" style="margin-left: 10px" />
        </div>
      </div>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="type" label="类型" width="80">
          <template #default="{ row }">
            <el-icon :size="20" :color="getTypeColor(row.type)">
              <component :is="getTypeIcon(row.type)" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="提醒内容" min-width="350" />
        <el-table-column prop="level" label="紧急程度" width="100">
          <template #default="{ row }">
            <el-tag :type="getLevelTag(row.level)" size="small">
              {{ row.levelName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remindTime" label="提醒时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isRead ? 'info' : 'success'" size="small">
              {{ row.isRead ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="200">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleMarkRead(row)" v-if="!row.isRead">标为已读</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <div class="remind-content">
        <div class="remind-header">
          <el-tag :type="getLevelTag(currentRemind.level)">
            {{ currentRemind.levelName }}
          </el-tag>
          <span class="remind-time">{{ currentRemind.remindTime }}</span>
        </div>
        <el-divider />
        <div class="remind-body">
          <p><strong>提醒类型：</strong>{{ currentRemind.typeName }}</p>
          <p><strong>提醒内容：</strong>{{ currentRemind.content }}</p>
          <p v-if="currentRemind.deadline"><strong>截止时间：</strong>{{ currentRemind.deadline }}</p>
          <p v-if="currentRemind.relatedPerson"><strong>相关人员：</strong>{{ currentRemind.relatedPerson }}</p>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleHandle">立即处理</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="addVisible" title="添加提醒" width="600px">
      <el-form :model="remindForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="提醒类型" prop="type">
          <el-select v-model="remindForm.type" placeholder="请选择类型">
            <el-option label="合同到期" value="contract" />
            <el-option label="证书年审" value="certificate" />
            <el-option label="会议提醒" value="meeting" />
            <el-option label="任务截止" value="task" />
            <el-option label="生日提醒" value="birthday" />
          </el-select>
        </el-form-item>
        <el-form-item label="提醒标题" prop="title">
          <el-input v-model="remindForm.title" placeholder="请输入提醒标题" />
        </el-form-item>
        <el-form-item label="提醒内容" prop="content">
          <el-input v-model="remindForm.content" type="textarea" :rows="4" placeholder="请输入提醒内容" />
        </el-form-item>
        <el-form-item label="紧急程度" prop="level">
          <el-radio-group v-model="remindForm.level">
            <el-radio label="low">一般</el-radio>
            <el-radio label="medium">重要</el-radio>
            <el-radio label="high">紧急</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="提醒时间" prop="remindTime">
          <el-date-picker
              v-model="remindForm.remindTime"
              type="datetime"
              placeholder="选择提醒时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
              v-model="remindForm.deadline"
              type="datetime"
              placeholder="选择截止时间"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="相关人员" prop="relatedPerson">
          <el-input v-model="remindForm.relatedPerson" placeholder="请输入相关人员" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Bell, Clock, Warning, Document, User } from '@element-plus/icons-vue'

const loading = ref(false)
const activeTab = ref('unread')
const tableData = ref([])
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const addVisible = ref(false)
const dialogTitle = ref('提醒详情')
const formRef = ref(null)
const currentRemind = ref({})

const remindForm = ref({
  type: '',
  title: '',
  content: '',
  level: 'medium',
  remindTime: null,
  deadline: null,
  relatedPerson: ''
})

const rules = {
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  remindTime: [{ required: true, message: '请选择提醒时间', trigger: 'change' }]
}

const unreadCount = computed(() => tableData.value.filter(m => !m.isRead).length)

const typeIcons = {
  contract: Document,
  certificate: Document,
  meeting: Clock,
  task: Bell,
  birthday: User
}

const typeNames = {
  contract: '合同到期',
  certificate: '证书年审',
  meeting: '会议提醒',
  task: '任务截止',
  birthday: '生日提醒'
}

const levelNames = {
  low: '一般',
  medium: '重要',
  high: '紧急'
}

onMounted(() => {
  loadData()
})

const loadData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, type: 'contract', typeName: '合同到期', title: 'XX 项目合同即将到期，请及时处理续签事宜', level: 'high', levelName: '紧急', remindTime: '2026-01-15 10:00', deadline: '2026-01-20', relatedPerson: '张三', isRead: false, content: 'XX 项目合同将于 2026 年 1 月 20 日到期，请提前准备续签材料。' },
      { id: 2, type: 'certificate', typeName: '证书年审', title: '公司营业执照需要进行年审', level: 'medium', levelName: '重要', remindTime: '2026-01-14 09:00', deadline: '2026-01-25', relatedPerson: '李四', isRead: false, content: '公司营业执照年审时间为 1 月 25 日，请准备相关材料。' },
      { id: 3, type: 'meeting', typeName: '会议提醒', title: '下午 3 点召开部门例会', level: 'low', levelName: '一般', remindTime: '2026-01-13 14:00', relatedPerson: '', isRead: true, content: '今天下午 3 点在会议室召开部门例会，请准时参加。' }
    ]
    pagination.total = tableData.value.length
    loading.value = false
  }, 500)
}

const handleTabChange = () => {
  loadData()
}

const handleAdd = () => {
  remindForm.value = { type: '', title: '', content: '', level: 'medium', remindTime: null, deadline: null, relatedPerson: '' }
  addVisible.value = true
}

const handleView = (row) => {
  currentRemind.value = row
  dialogTitle.value = '提醒详情'
  dialogVisible.value = true
}

const handleMarkRead = (row) => {
  row.isRead = true
  ElMessage.success('已标记为已读')
}

const handleDelete = (row) => {
  tableData.value = tableData.value.filter(m => m.id !== row.id)
  pagination.total--
  ElMessage.success('删除成功')
}

const handleHandle = () => {
  ElMessage.success('已标记为处理完成')
  dialogVisible.value = false
  loadData()
}

const handleAddSubmit = () => {
  ElMessage.success('添加成功')
  addVisible.value = false
  loadData()
}

const getTypeIcon = (type) => {
  return typeIcons[type] || Bell
}

const getTypeColor = (type) => {
  const colors = { contract: '#409eff', certificate: '#67c23a', meeting: '#e6a23c', task: '#f56c6c', birthday: '#909399' }
  return colors[type] || '#909399'
}

const getLevelTag = (level) => {
  const types = { low: 'info', medium: 'warning', high: 'danger' }
  return types[level] || 'info'
}
</script>

<style lang="scss" scoped>
.remind-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tab-badge {
    margin-left: 8px;
    color: #f56c6c;
    font-size: 12px;
  }

  .pagination {
    margin-top: 20px;
    justify-content: flex-end;
  }

  .remind-content {
    .remind-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      .remind-time {
        font-size: 13px;
        color: #999;
      }
    }

    .remind-body {
      p {
        margin: 10px 0;
        line-height: 1.6;
        color: #606266;

        strong {
          color: #333;
        }
      }
    }
  }
}
</style>
