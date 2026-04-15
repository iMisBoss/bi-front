<template>
  <el-drawer
      :model-value="visible"
      @update:model-value="$emit('update:visible', $event)"
      :title="drawerTitle"
      size="700px"
  >
    <div v-if="record" class="drawer-content">
      <!-- 编辑模式 -->
      <div v-if="mode === 'edit'" class="edit-mode">
        <el-form :model="formData" label-width="100px">
          <el-divider content-position="left">基础信息</el-divider>

          <el-form-item label="纪要标题">
            <el-input v-model="formData.title" placeholder="自动生成：XX会议-会议纪要" />
          </el-form-item>

          <el-form-item label="关联会议">
            <el-select v-model="formData.meetingId" placeholder="选择关联会议" style="width: 100%">
              <el-option label="技术部Q2季度规划会议" value="meeting1" />
              <el-option label="产品需求评审会" value="meeting2" />
            </el-select>
          </el-form-item>

          <el-form-item label="纪要编号">
            <el-input v-model="formData.agendaNo" disabled />
          </el-form-item>

          <el-divider content-position="left">会议内容</el-divider>

          <el-form-item label="会议议题">
            <el-input v-model="formData.topic" type="textarea" :rows="2" placeholder="会议讨论核心主题" />
          </el-form-item>

          <el-form-item label="会议内容">
            <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="详细讨论过程" />
          </el-form-item>

          <el-form-item label="会议决议" required>
            <div class="decisions-editor">
              <div v-for="(decision, index) in formData.decisions" :key="index" class="decision-item">
                <el-input v-model="formData.decisions[index]" placeholder="输入决议内容" />
                <el-button
                    link
                    type="danger"
                    @click="removeDecision(index)"
                    v-if="formData.decisions.length > 1"
                >
                  删除
                </el-button>
              </div>
              <el-button link type="primary" @click="addDecision" style="width: 100%; margin-top: 8px">
                <el-icon><Plus /></el-icon>
                添加决议
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="待办事项">
            <div class="todos-editor">
              <div v-for="(todo, index) in formData.todos" :key="index" class="todo-item">
                <el-input v-model="todo.content" placeholder="待办内容" style="flex: 1" />
                <el-select v-model="todo.assignee" placeholder="责任人" style="width: 120px">
                  <el-option label="张三" value="zhangsan" />
                  <el-option label="李四" value="lisi" />
                </el-select>
                <el-date-picker
                    v-model="todo.deadline"
                    type="date"
                    placeholder="截止时间"
                    style="width: 140px"
                />
                <el-button
                    link
                    type="danger"
                    @click="removeTodo(index)"
                    v-if="formData.todos.length > 0"
                >
                  删除
                </el-button>
              </div>
              <el-button link type="primary" @click="addTodo" style="width: 100%; margin-top: 8px">
                <el-icon><Plus /></el-icon>
                添加待办
              </el-button>
            </div>
          </el-form-item>

          <el-divider content-position="left">权限与发布</el-divider>

          <el-form-item label="可见范围">
            <el-select v-model="formData.visibility" style="width: 100%">
              <el-option label="本人仅见" value="personal" />
              <el-option label="参会人可见" value="meeting" />
              <el-option label="部门可见" value="department" />
              <el-option label="全公司可见" value="company" />
              <el-option label="指定人员" value="specific" />
            </el-select>
          </el-form-item>

          <el-form-item label="审批流程">
            <el-radio-group v-model="formData.needApproval">
              <el-radio :value="false">免审批</el-radio>
              <el-radio :value="true">需审批</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="附件上传">
            <el-upload
                action="#"
                :auto-upload="false"
                :limit="5"
            >
              <el-button size="small" type="primary">
                <el-icon><Upload /></el-icon>
                选择文件
              </el-button>
            </el-upload>
          </el-form-item>
        </el-form>

        <div class="drawer-footer">
          <el-button @click="$emit('close')">取消</el-button>
          <el-button @click="handleSaveDraft">保存草稿</el-button>
          <el-button type="primary" @click="handleSubmit">提交审批</el-button>
        </div>
      </div>

      <!-- 查看模式 -->
      <div v-if="mode === 'view'" class="view-mode">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="纪要编号">{{ record.agendaNo || 'JY-20260415-001' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="record.statusColor">{{ record.statusLabel }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="会议标题">{{ record.title }}</el-descriptions-item>
          <el-descriptions-item label="关联会议">{{ record.meetingName }}</el-descriptions-item>
          <el-descriptions-item label="会议时间">{{ record.meetingTime }}</el-descriptions-item>
          <el-descriptions-item label="起草人">{{ record.initiator }} · {{ record.initiatorDept }}</el-descriptions-item>
          <el-descriptions-item label="发布时间">{{ record.publishTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="可见范围">{{ getVisibilityText(record.visibility) }}</el-descriptions-item>
          <el-descriptions-item label="版本号">V{{ record.version }}</el-descriptions-item>
          <el-descriptions-item label="最后编辑">{{ record.lastEditTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">会议内容</el-divider>
        <div class="content-display">
          <h4>会议议题</h4>
          <p>{{ record.topic || '技术部Q2季度工作规划与目标设定' }}</p>

          <h4>会议内容</h4>
          <div class="rich-content">{{ record.content || '会议详细讨论了Q1工作总结、Q2目标设定、资源分配等议题...' }}</div>

          <h4>会议决议</h4>
          <ul class="decisions-list">
            <li v-for="(decision, index) in record.decisions" :key="index">{{ decision }}</li>
          </ul>

          <h4>待办事项 ({{ record.todoCount }}项)</h4>
          <el-table :data="record.todos || []" border size="small">
            <el-table-column type="index" width="50" />
            <el-table-column prop="content" label="待办内容" />
            <el-table-column prop="assignee" label="责任人" width="100" />
            <el-table-column prop="deadline" label="截止时间" width="120" />
            <el-table-column label="状态" width="80" align="center">
              <template #default>
                <el-tag size="small">待处理</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="drawer-footer">
          <el-button @click="$emit('close')">关闭</el-button>
          <el-button @click="$emit('export', record)">导出</el-button>
          <el-button v-if="record.status === 'published'" @click="$emit('compare-version', record)">
            版本对比
          </el-button>
          <el-button
              v-if="record.status === 'pending' && isInitiator"
              type="primary"
              @click="$emit('publish', record)"
          >
            发布
          </el-button>
        </div>
      </div>

      <!-- 审批模式 -->
      <div v-if="mode === 'approve'" class="approve-mode">
        <el-alert
            title="请审阅以下会议纪要内容，确认无误后审批通过"
            type="info"
            :closable="false"
            show-icon
            style="margin-bottom: 16px"
        />

        <el-descriptions :column="1" border>
          <el-descriptions-item label="纪要标题">{{ record.title }}</el-descriptions-item>
          <el-descriptions-item label="起草人">{{ record.initiator }} · {{ record.initiatorDept }}</el-descriptions-item>
          <el-descriptions-item label="会议时间">{{ record.meetingTime }}</el-descriptions-item>
          <el-descriptions-item label="核心决议">
            <ul>
              <li v-for="(decision, index) in record.decisions" :key="index">{{ decision }}</li>
            </ul>
          </el-descriptions-item>
        </el-descriptions>

        <el-divider />

        <el-form label-width="100px">
          <el-form-item label="审批意见">
            <el-input
                v-model="approvalComment"
                type="textarea"
                :rows="4"
                placeholder="请输入审批意见（驳回时必填）"
            />
          </el-form-item>
        </el-form>

        <div class="drawer-footer">
          <el-button @click="$emit('close')">取消</el-button>
          <el-button type="danger" @click="$emit('reject', record)">驳回</el-button>
          <el-button type="primary" @click="$emit('approve', record)">通过</el-button>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { defineProps, defineEmits, ref, reactive, computed } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  visible: Boolean,
  record: Object,
  mode: String,
  userRole: String,
  isInitiator: Boolean
})

const emit = defineEmits(['update:visible', 'save', 'submit', 'approve', 'reject', 'publish', 'export', 'compare-version', 'close'])

const approvalComment = ref('')

const drawerTitle = computed(() => {
  if (props.mode === 'edit') return props.record?.id ? '编辑会议纪要' : '新建会议纪要'
  if (props.mode === 'view') return '查看会议纪要'
  if (props.mode === 'approve') return '审批会议纪要'
  return '会议纪要详情'
})

const formData = reactive({
  title: props.record?.title || '',
  meetingId: '',
  agendaNo: `JY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
  topic: '',
  content: '',
  decisions: props.record?.decisions ? [...props.record.decisions] : [''],
  todos: props.record?.todos || [],
  visibility: props.record?.visibility || 'department',
  needApproval: false
})

const addDecision = () => {
  formData.decisions.push('')
}

const removeDecision = (index) => {
  formData.decisions.splice(index, 1)
}

const addTodo = () => {
  formData.todos.push({
    content: '',
    assignee: '',
    deadline: '',
    status: 'pending'
  })
}

const removeTodo = (index) => {
  formData.todos.splice(index, 1)
}

const handleSaveDraft = () => {
  emit('save', { ...props.record, ...formData, status: 'draft', statusLabel: '草稿', statusColor: 'info' })
}

const handleSubmit = () => {
  emit('submit', { ...props.record, ...formData })
}

const getVisibilityText = (visibility) => {
  const texts = {
    personal: '本人仅见',
    meeting: '参会人可见',
    department: '部门可见',
    company: '全公司可见',
    specific: '指定人员'
  }
  return texts[visibility] || '未知'
}
</script>

<style lang="scss" scoped>
.drawer-content {
  padding: 0 20px;

  .edit-mode,
  .view-mode,
  .approve-mode {
    .decisions-editor,
    .todos-editor {
      .decision-item,
      .todo-item {
        display: flex;
        gap: 8px;
        margin-bottom: 8px;
        align-items: center;
      }
    }

    .content-display {
      h4 {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 16px 0 8px 0;
      }

      .rich-content {
        line-height: 1.8;
        color: #606266;
      }

      .decisions-list {
        padding-left: 20px;
        line-height: 1.8;
        color: #303133;
      }
    }
  }

  .drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
}
</style>
