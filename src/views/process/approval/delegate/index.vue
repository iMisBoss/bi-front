<template>
  <div class="delegate-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2>审批委托</h2>
      </div>
      <div class="header-right">
        <el-button type="primary" size="large" @click="handleCreate" icon="Plus">
          新建委托
        </el-button>
      </div>
    </div>

    <!-- 筛选区域 -->
    <el-card class="filter-card" shadow="hover">
      <el-form :inline="true" :model="filterForm" size="default">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="草稿待确认" value="draft_pending" />
            <el-option label="待确认" value="pending" />
            <el-option label="已拒绝" value="rejected" />
            <el-option label="待生效" value="waiting" />
            <el-option label="生效中" value="active" />
            <el-option label="已撤销" value="cancelled" />
            <el-option label="已过期" value="expired" />
            <el-option label="已作废" value="void" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"              style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="人员">
          <el-input
              v-model="filterForm.person"
              placeholder="受托人/委托人"              style="width: 200px"
              clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter" icon="Search">查询</el-button>
          <el-button @click="handleResetFilter" icon="Refresh">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Tab 页签 -->
    <el-card class="tab-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="我发起的委托" name="initiated" />
        <el-tab-pane label="我收到的委托" name="received" />
      </el-tabs>

      <!-- 列表内容区 -->
      <el-table
          v-if="filteredTableData.length > 0"
          :data="filteredTableData"          style="width: 100%"
          border
          v-loading="loading"
      >
        <!-- 我发起的委托列表 -->
        <template v-if="activeTab === 'initiated'">
          <el-table-column prop="delegateNo" label="委托编号" width="160" />
          <el-table-column prop="trusteeName" label="受托人" width="120" />
          <el-table-column prop="scope" label="委托范围" min-width="180" show-overflow-tooltip />
          <el-table-column prop="startTime" label="生效时间" width="160" sortable />
          <el-table-column prop="endTime" label="失效时间" width="160" sortable />

          <!-- 新增：受托人确认状态字段 -->
          <el-table-column prop="confirmStatus" label="受托人确认状态" width="140">
            <template #default="{ row }">
              <el-tag
                  :type="getConfirmStatusType(row.confirmStatus)"
                  size="small"
                  effect="plain"
              >
                {{ getConfirmStatusText(row.confirmStatus) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="委托状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row)" icon="View">查看</el-button>

              <!-- 草稿待确认状态：显示提交、编辑、删除 -->
              <template v-if="row.status === 'draft_pending'">
                <el-button
                    size="small"
                    type="primary"
                    @click="handleSubmit(row)"
                    icon="Check"
                >
                  提交
                </el-button>
                <el-button
                    size="small"
                    type="warning"
                    @click="handleEdit(row)"
                    icon="Edit"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleDelete(row)"
                    icon="Delete"
                >
                  删除
                </el-button>
              </template>

              <!-- 待确认状态：显示编辑、撤销 -->
              <template v-else-if="row.status === 'pending'">
                <el-button
                    size="small"
                    type="warning"
                    @click="handleEdit(row)"
                    icon="Edit"
                >
                  编辑
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleRevoke(row)"
                    icon="Close"
                >
                  撤销
                </el-button>
              </template>

              <!-- 待生效/生效中状态：显示撤销 -->
              <template v-else-if="row.status === 'waiting' || row.status === 'active'">
                <el-button
                    size="small"
                    type="danger"
                    @click="handleRevoke(row)"
                    icon="Close"
                >
                  撤销
                </el-button>
              </template>
            </template>
          </el-table-column>
        </template>

        <!-- 我收到的委托列表 -->
        <template v-else-if="activeTab === 'received'">
          <el-table-column prop="delegateNo" label="委托编号" width="160" />
          <el-table-column prop="delegatorName" label="委托人" width="120" />

          <!-- 新增：委托原因/备注字段 -->
          <el-table-column prop="remark" label="委托原因" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="row.remark">{{ row.remark }}</span>
              <span v-else style="color: #999;">无备注</span>
            </template>
          </el-table-column>

          <el-table-column prop="scope" label="委托范围" min-width="180" show-overflow-tooltip />
          <el-table-column prop="startTime" label="生效时间" width="160" sortable />
          <el-table-column prop="endTime" label="失效时间" width="160" sortable />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="280" fixed="right">
            <template #default="{ row }">
              <el-button size="small" @click="handleView(row)" icon="View">查看</el-button>

              <!-- 待确认状态：显示同意和拒绝按钮 -->
              <template v-if="row.status === 'pending'">
                <el-button
                    size="small"
                    type="success"
                    @click="handleAgree(row)"
                    icon="Check"
                >
                  同意
                </el-button>
                <el-button
                    size="small"
                    type="danger"
                    @click="handleReject(row)"
                    icon="Close"
                >
                  拒绝
                </el-button>
              </template>
            </template>
          </el-table-column>
        </template>
      </el-table>

      <!-- 空状态 -->
      <el-empty
          v-else
          :description="`暂无${activeTab === 'initiated' ? '发起的' : '收到的'}委托记录`"
          :image-size="120"
      >
        <el-button type="primary" @click="handleCreate" icon="Plus">新建委托</el-button>
      </el-empty>

      <!-- 分页 -->
      <div v-if="filteredTableData.length > 0" class="table-footer">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
        />
      </div>
    </el-card>

    <!-- 新建/编辑委托弹框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑委托' : '新建委托'"
        width="700px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <el-alert
          title="前置校验规则"
          type="info"
          :closable="false"
          show-icon          style="margin-bottom: 16px;"
      >
        <template #default>
          <div>系统将自动校验：人员权限、委托时长（最长 90 天）、禁止委托的敏感流程</div>
        </template>
      </el-alert>

      <el-form :model="delegateForm" :rules="formRules" ref="formRef" label-width="120px">
        <!-- 必填基础信息区 -->
        <el-divider content-position="left">
          <span class="section-title">必填信息</span>
        </el-divider>

        <el-form-item label="委托起止时间" required>
          <el-date-picker
              v-model="delegateForm.dateTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD HH:mm:ss"              style="width: 100%"
              :disabled-date="disabledDate"
              :disabled-time="disabledTime"
          />
        </el-form-item>

        <el-form-item label="受托人" required>
          <el-select
              v-model="delegateForm.trusteeId"
              placeholder="请选择受托人"
              filterable              style="width: 100%"
          >
            <el-option
                v-for="item in trusteeList"
                :key="item.id"
                :label="`${item.name} - ${item.department}`"
                :value="item.id"
            />
          </el-select>
          <div class="form-tip">仅显示同部门或符合职级要求的人员</div>
        </el-form-item>

        <el-form-item label="委托范围" required>
          <el-radio-group v-model="delegateForm.scopeType" @change="handleScopeChange">
            <el-radio label="all">全部审批流程</el-radio>
            <el-radio label="specific">指定审批流程</el-radio>
          </el-radio-group>

          <!-- 指定流程选择器 -->
          <div v-if="delegateForm.scopeType === 'specific'" class="process-selector">
            <el-input
                v-model="processSearchText"
                placeholder="搜索流程名称"                style="width: 300px; margin-bottom: 12px"
                clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>

            <div class="process-actions">
              <el-checkbox
                  v-model="selectAllProcesses"
                  :indeterminate="isIndeterminate"
                  @change="handleSelectAll"
              >
                全选
              </el-checkbox>
              <el-button size="small" @click="handleInverseSelection">反选</el-button>
            </div>

            <el-checkbox-group v-model="delegateForm.selectedProcesses">
              <div class="process-categories">
                <div v-for="(category, index) in filteredProcessCategories" :key="index" class="category-item">
                  <div class="category-title">{{ category.name }}</div>
                  <div class="process-list">
                    <el-checkbox
                        v-for="process in category.processes"
                        :key="process.id"
                        :label="process.id"
                        :disabled="process.disabled"
                    >
                      {{ process.name }}
                      <el-tag v-if="process.disabled" size="small" type="info" style="margin-left: 8px">黑名单</el-tag>
                    </el-checkbox>
                  </div>
                </div>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>

        <!-- 非必填补充区 -->
        <el-divider content-position="left">
          <span class="section-title">补充信息（选填）</span>
        </el-divider>

        <el-form-item label="委托备注">
          <el-input
              v-model="delegateForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请填写委托原因，如：休假 7 天，临时委托处理采购、报销相关审批"
              maxlength="500"
              show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitForm" icon="Check" :loading="submitting">
          {{ isEdit ? '保存草稿' : '暂存草稿' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 委托详情/处理弹框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title=""
        width="900px"
        :close-on-click-modal="false"
        destroy-on-close
    >
      <template #header>
        <div style="display: none;">
          <!-- 隐藏标题，使用内部状态条 -->
        </div>
      </template>

      <div v-if="currentDetail" class="detail-content">
        <!-- 顶部状态条 -->
        <div class="status-bar" :class="'status-' + currentDetail.status">
          <div class="status-info">
            <el-icon class="status-icon" :size="24">
              <component :is="getStatusIcon(currentDetail.status)" />
            </el-icon>
            <div class="status-texts">
              <div class="status-title">{{ getStatusText(currentDetail.status) }}</div>
              <div v-if="currentDetail.status === 'active'" class="remaining-time">
                <el-icon><Timer /></el-icon>
                剩余有效时长：{{ calculateRemainingTime(currentDetail.endTime) }}
              </div>
              <!-- 状态提示 -->
              <div v-if="getPendingHint(currentDetail.status)" class="pending-hint">
                <el-alert
                    :title="getPendingHint(currentDetail.status)"
                    type="info"
                    :closable="false"
                    show-icon                    style="margin-top: 8px;"
                />
              </div>
            </div>
          </div>
          <el-tag :type="getStatusType(currentDetail.status)" size="large" effect="dark">
            {{ getStatusText(currentDetail.status) }}
          </el-tag>
        </div>

        <!-- 核心信息区 -->
        <div class="core-info-section">
          <h4 class="section-title">
            <el-icon><Document /></el-icon>
            委托信息
          </h4>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="委托编号">{{ currentDetail.delegateNo || '草稿（无编号）' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="getStatusType(currentDetail.status)" size="small">
                {{ getStatusText(currentDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="委托人">{{ currentDetail.delegatorName }}</el-descriptions-item>
            <el-descriptions-item label="受托人">{{ currentDetail.trusteeName }}</el-descriptions-item>
            <el-descriptions-item label="委托起止时间">
              {{ currentDetail.startTime }} 至 {{ currentDetail.endTime }}
            </el-descriptions-item>
            <el-descriptions-item label="委托范围">
              {{ currentDetail.scope }}
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentDetail.submitTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="确认时间">{{ currentDetail.confirmTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="委托备注" :span="2">
              {{ currentDetail.remark || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 操作记录区 -->
        <div class="operation-log-section">
          <h4 class="section-title">
            <el-icon><Operation /></el-icon>
            操作日志
          </h4>
          <el-timeline>
            <el-timeline-item
                v-for="(log, index) in operationLogs"
                :key="index"
                :timestamp="log.time"
                placement="top"
                :color="log.color"
            >
              <el-card shadow="hover">
                <div class="log-item">
                  <div class="log-header">
                    <span class="log-type" :style="{ color: log.color }">{{ log.type }}</span>
                    <span class="log-operator">{{ log.operator }}</span>
                  </div>
                  <div class="log-content">{{ log.content }}</div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 底部操作栏 -->
        <div class="bottom-actions">
          <el-button @click="detailDialogVisible = false" icon="Close">关闭</el-button>

          <!-- 我发起的委托 - 草稿待确认状态：显示提交、编辑、删除 -->
          <template v-if="activeTab === 'initiated' && currentDetail?.status === 'draft_pending'">
            <el-button
                type="primary"
                @click="handleSubmitFromDetail(currentDetail)"
                icon="Check"
            >
              提交
            </el-button>
            <el-button
                type="warning"
                @click="handleEditFromDetail(currentDetail)"
                icon="Edit"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                @click="handleDelete(currentDetail)"
                icon="Delete"
            >
              删除
            </el-button>
          </template>

          <!-- 我发起的委托 - 待确认状态：显示编辑、撤销 -->
          <template v-else-if="activeTab === 'initiated' && currentDetail?.status === 'pending'">
            <el-button
                type="warning"
                @click="handleEditFromDetail(currentDetail)"
                icon="Edit"
            >
              编辑
            </el-button>
            <el-button
                type="danger"
                @click="handleRevoke(currentDetail)"
                icon="Close"
            >
              撤销
            </el-button>
          </template>

          <!-- 我发起的委托 - 待生效/生效中状态：显示撤销 -->
          <template v-else-if="activeTab === 'initiated' && (currentDetail?.status === 'waiting' || currentDetail?.status === 'active')">
            <el-button
                type="danger"
                @click="handleRevoke(currentDetail)"
                icon="Close"
            >
              撤销
            </el-button>
          </template>

          <!-- 我收到的委托 - 待确认状态：显示同意和拒绝按钮 -->
          <template v-else-if="activeTab === 'received' && currentDetail?.status === 'pending'">
            <el-button
                type="success"
                @click="handleAgree(currentDetail)"
                icon="Check"
            >
              同意接受委托
            </el-button>
            <el-button
                type="danger"
                @click="handleReject(currentDetail)"
                icon="Close"
            >
              拒绝委托
            </el-button>
          </template>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, View, Edit, Close, Check, User, Delete,
  Document, Operation, Timer, CircleCheck, CircleClose, Warning, InfoFilled,
  Clock
} from '@element-plus/icons-vue'

const activeTab = ref('initiated')
const loading = ref(false)
const dialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const currentDetail = ref(null)

// 流程选择相关
const processSearchText = ref('')
const selectAllProcesses = ref(false)
const isIndeterminate = ref(false)

// 筛选表单
const filterForm = reactive({
  status: '',
  dateRange: [],
  person: ''
})

// 表单数据
const delegateForm = reactive({
  id: null,
  dateTimeRange: [],
  trusteeId: '',
  scopeType: 'all',
  selectedProcesses: [],
  remark: ''
})

// 表单验证规则
const formRules = {
  dateTimeRange: [
    { required: true, message: '请选择委托起止时间', trigger: 'change' }
  ],
  trusteeId: [
    { required: true, message: '请选择受托人', trigger: 'change' }
  ],
  scopeType: [
    { required: true, message: '请选择委托范围', trigger: 'change' }
  ]
}

// 操作日志数据
const operationLogs = ref([])

// 受托人列表
const trusteeList = ref([
  { id: 'user1', name: '李四', department: '信息技术部' },
  { id: 'user2', name: '王五', department: '信息技术部' },
  { id: 'user3', name: '赵六', department: '信息技术部' }
])

// 流程分类列表（包含黑名单流程）
const processCategories = ref([
  {
    name: '人事类',
    processes: [
      { id: 'leave', name: '请假审批流程' },
      { id: 'attendance', name: '考勤审批流程' },
      { id: 'overtime', name: '加班申请流程' },
      { id: 'salary', name: '薪酬审批流程', disabled: true } // 黑名单
    ]
  },
  {
    name: '行政类',
    processes: [
      { id: 'meeting', name: '会议申请流程' },
      { id: 'vehicle', name: '用车申请流程' },
      { id: 'seal', name: '用印申请流程' }
    ]
  },
  {
    name: '财务类',
    processes: [
      { id: 'purchase', name: '采购申请流程' },
      { id: 'expense', name: '费用报销流程' },
      { id: 'payment', name: '付款申请流程' }
    ]
  },
  {
    name: '其他类',
    processes: [
      { id: 'contract', name: '合同审批流程', disabled: true },
      { id: 'project', name: '项目立项流程' },
      { id: 'hr_transfer', name: '人事任免流程', disabled: true } // 黑名单
    ]
  }
])

// 表格数据 - 包含所有状态，增加更多测试数据
const tableData = ref([
  // 我发起的委托（张三发起）
  {
    id: 1,
    delegateNo: 'WT20240115001',
    trusteeName: '李四',
    delegatorName: '张三',
    scope: '全部审批流程',
    startTime: '2024-01-15 09:00',
    endTime: '2024-01-22 18:00',
    status: 'active',
    confirmStatus: 'confirmed',
    submitTime: '2024-01-15 08:50:00',
    confirmTime: '2024-01-15 09:00:00',
    remark: '休假期间委托处理日常审批'
  },
  {
    id: 2,
    delegateNo: 'WT20240114001',
    trusteeName: '王五',
    delegatorName: '张三',
    scope: '采购申请流程、费用报销流程',
    startTime: '2024-01-14 09:00',
    endTime: '2024-01-21 18:00',
    status: 'pending',
    confirmStatus: 'waiting',
    submitTime: '2024-01-14 08:30:00',
    confirmTime: null,
    remark: '外出培训，委托处理紧急采购和报销'
  },
  {
    id: 3,
    delegateNo: null,
    trusteeName: '赵六',
    delegatorName: '张三',
    scope: '会议申请流程',
    startTime: '2024-01-13 09:00',
    endTime: '2024-01-20 18:00',
    status: 'draft_pending',
    confirmStatus: 'unsubmitted',
    submitTime: null,
    confirmTime: null,
    remark: '出差期间委托处理会议安排'
  },
  {
    id: 4,
    delegateNo: 'WT20240112001',
    trusteeName: '钱七',
    delegatorName: '张三',
    scope: '人事调动流程',
    startTime: '2024-01-12 09:00',
    endTime: '2024-01-19 18:00',
    status: 'waiting',
    confirmStatus: 'confirmed',
    submitTime: '2024-01-12 08:00:00',
    confirmTime: '2024-01-12 10:00:00',
    remark: '已同意但尚未到生效时间'
  },
  {
    id: 5,
    delegateNo: 'WT20240111001',
    trusteeName: '孙八',
    delegatorName: '张三',
    scope: '用印申请流程',
    startTime: '2024-01-11 09:00',
    endTime: '2024-01-18 18:00',
    status: 'rejected',
    confirmStatus: 'rejected',
    submitTime: '2024-01-11 08:00:00',
    confirmTime: null,
    rejectReason: '时间冲突，无法接受',
    rejectTime: '2024-01-11 10:00:00',
    remark: '被受托人拒绝'
  },
  {
    id: 6,
    delegateNo: 'WT20240110001',
    trusteeName: '周九',
    delegatorName: '张三',
    scope: '车辆申请流程',
    startTime: '2024-01-10 09:00',
    endTime: '2024-01-17 18:00',
    status: 'cancelled',
    confirmStatus: 'confirmed',
    submitTime: '2024-01-10 08:00:00',
    confirmTime: '2024-01-10 09:00:00',
    remark: '委托人主动撤销'
  },

  // 我收到的委托（张三作为受托人）- 新增多条数据
  {
    id: 7,
    delegateNo: 'WT20240109001',
    trusteeName: '张三',
    delegatorName: '吴十',
    scope: '加班申请流程',
    startTime: '2024-01-09 09:00',
    endTime: '2024-01-10 18:00',
    status: 'pending',
    confirmStatus: 'waiting',
    submitTime: '2024-01-09 08:00:00',
    confirmTime: null,
    remark: '家中有事，委托处理加班审批'
  },
  {
    id: 8,
    delegateNo: 'WT20240108001',
    trusteeName: '张三',
    delegatorName: '郑十一',
    scope: '考勤审批流程',
    startTime: '2024-01-08 09:00',
    endTime: '2024-01-09 18:00',
    status: 'pending',
    confirmStatus: 'waiting',
    submitTime: '2024-01-08 08:00:00',
    confirmTime: null,
    remark: '生病请假，委托处理考勤异常'
  },
  {
    id: 9,
    delegateNo: 'WT20240107001',
    trusteeName: '张三',
    delegatorName: '王十二',
    scope: '付款申请流程',
    startTime: '2024-01-07 09:00',
    endTime: '2024-01-14 18:00',
    status: 'active',
    confirmStatus: 'confirmed',
    submitTime: '2024-01-07 08:00:00',
    confirmTime: '2024-01-07 09:30:00',
    remark: '出国考察，委托处理紧急付款'
  },
  {
    id: 10,
    delegateNo: 'WT20240106001',
    trusteeName: '张三',
    delegatorName: '冯十三',
    scope: '合同审批流程',
    startTime: '2024-01-06 09:00',
    endTime: '2024-01-13 18:00',
    status: 'rejected',
    confirmStatus: 'rejected',
    submitTime: '2024-01-06 08:00:00',
    confirmTime: null,
    rejectReason: '对合同条款不熟悉，无法审批',
    rejectTime: '2024-01-06 10:00:00',
    remark: '专业领域不符，建议找法务同事'
  },
  {
    id: 11,
    delegateNo: 'WT20240105001',
    trusteeName: '张三',
    delegatorName: '陈十四',
    scope: '项目立项流程',
    startTime: '2024-01-05 09:00',
    endTime: '2024-01-12 18:00',
    status: 'pending',
    confirmStatus: 'waiting',
    submitTime: '2024-01-05 08:00:00',
    confirmTime: null,
    remark: '参加封闭培训，委托处理项目审批'
  },
  {
    id: 12,
    delegateNo: 'WT20240104001',
    trusteeName: '张三',
    delegatorName: '褚十五',
    scope: '费用报销流程',
    startTime: '2024-01-04 09:00',
    endTime: '2024-01-11 18:00',
    status: 'active',
    confirmStatus: 'confirmed',
    submitTime: '2024-01-04 08:00:00',
    confirmTime: '2024-01-04 09:00:00',
    remark: '产假期间，委托处理日常报销'
  },
  {
    id: 13,
    delegateNo: 'WT20240103001',
    trusteeName: '张三',
    delegatorName: '卫十六',
    scope: '采购申请流程',
    startTime: '2024-01-03 09:00',
    endTime: '2024-01-10 18:00',
    status: 'void',
    confirmStatus: 'void',
    submitTime: '2024-01-03 08:00:00',
    confirmTime: null,
    remark: '超过生效时间未确认，系统自动作废'
  },
  {
    id: 14,
    delegateNo: 'WT20240102001',
    trusteeName: '张三',
    delegatorName: '蒋十七',
    scope: '全部审批流程',
    startTime: '2024-01-02 09:00',
    endTime: '2024-01-09 18:00',
    status: 'expired',
    confirmStatus: 'confirmed',
    submitTime: '2024-01-02 08:00:00',
    confirmTime: '2024-01-02 09:00:00',
    remark: '短期出差，委托处理日常审批'
  }
])

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(tableData.value.length)

// 过滤后的流程分类
const filteredProcessCategories = computed(() => {
  if (!processSearchText.value) return processCategories.value

  return processCategories.value.map(category => ({
    ...category,
    processes: category.processes.filter(process =>
        process.name.includes(processSearchText.value)
    )
  })).filter(category => category.processes.length > 0)
})

// 所有可选流程 ID 列表
const allAvailableProcessIds = computed(() => {
  const ids = []
  processCategories.value.forEach(category => {
    category.processes.forEach(process => {
      if (!process.disabled) {
        ids.push(process.id)
      }
    })
  })
  return ids
})

const filteredTableData = computed(() => {
  let result = activeTab.value === 'initiated'
      ? tableData.value.filter(item => item.delegatorName === '张三')
      : tableData.value.filter(item => item.trusteeName === '张三')

  // 状态过滤
  if (filterForm.status) {
    result = result.filter(item => item.status === filterForm.status)
  }

  // 人员过滤
  if (filterForm.person) {
    const person = filterForm.person
    result = result.filter(item =>
        item.trusteeName.includes(person) || item.delegatorName.includes(person)
    )
  }

  // 时间范围过滤
  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    const startDate = new Date(filterForm.dateRange[0])
    const endDate = new Date(filterForm.dateRange[1])
    endDate.setHours(23, 59, 59, 999)

    result = result.filter(item => {
      const itemDate = new Date(item.startTime)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})

const getStatusType = (status) => {
  const typeMap = {
    'draft_pending': 'info',
    'pending': 'warning',
    'rejected': 'danger',
    'waiting': 'primary',
    'active': 'success',
    'cancelled': 'danger',
    'expired': 'info',
    'void': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'draft_pending': '草稿待确认',
    'pending': '待确认',
    'rejected': '已拒绝',
    'waiting': '待生效',
    'active': '生效中',
    'cancelled': '已撤销',
    'expired': '已过期',
    'void': '已作废'
  }
  return textMap[status] || '未知'
}

const getStatusIcon = (status) => {
  const iconMap = {
    'draft_pending': InfoFilled,
    'pending': Clock,
    'rejected': CircleClose,
    'waiting': Timer,
    'active': Check,
    'cancelled': CircleClose,
    'expired': Warning,
    'void': CircleClose
  }
  return iconMap[status] || CircleCheck
}

// 获取受托人确认状态类型
const getConfirmStatusType = (confirmStatus) => {
  const typeMap = {
    'unsubmitted': 'info',
    'waiting': 'warning',
    'confirmed': 'success',
    'rejected': 'danger',
    'void': 'info'
  }
  return typeMap[confirmStatus] || 'info'
}

// 获取受托人确认状态文本
const getConfirmStatusText = (confirmStatus) => {
  const textMap = {
    'unsubmitted': '未提交',
    'waiting': '待确认',
    'confirmed': '已确认',
    'rejected': '已拒绝',
    'void': '已作废'
  }
  return textMap[confirmStatus] || '未知'
}

const canRevoke = (status) => {
  // 待确认、待生效、生效中可以撤销
  return ['pending', 'waiting', 'active'].includes(status)
}

// 获取状态提示信息
const getPendingHint = (status) => {
  const hintMap = {
    'draft_pending': '草稿状态，仅您可见，提交后将发送给受托人确认',
    'pending': '等待受托人确认接受委托，确认后委托将正式生效',
    'waiting': '受托人已同意，等待到达生效时间后自动生效',
    'active': '委托正常生效中，受托人可处理指定审批流程',
    'rejected': '受托人已拒绝该委托，流程已终止',
    'cancelled': '委托已撤销，权限已收回',
    'expired': '委托已超过失效时间，系统自动终止',
    'void': '委托已过生效时间仍未确认，系统自动作废'
  }
  return hintMap[status] || ''
}

// 计算剩余时间
const calculateRemainingTime = (endTime) => {
  if (!endTime) return '-'

  const end = new Date(endTime).getTime()
  const now = Date.now()
  const diff = end - now

  if (diff <= 0) return '已过期'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 86400000
}

// 禁用时间（限制最长 90 天）
const disabledTime = (time) => {
  // 这里可以添加逻辑限制最长时间
  return false
}

// 委托范围变更
const handleScopeChange = () => {
  if (delegateForm.scopeType === 'all') {
    delegateForm.selectedProcesses = []
  } else {
    delegateForm.selectedProcesses = [...allAvailableProcessIds.value]
  }
  updateSelectAllState()
}

// 全选/取消全选
const handleSelectAll = (checked) => {
  if (checked) {
    delegateForm.selectedProcesses = [...allAvailableProcessIds.value]
  } else {
    delegateForm.selectedProcesses = []
  }
  updateSelectAllState()
}

// 反选
const handleInverseSelection = () => {
  const unselected = allAvailableProcessIds.value.filter(
      id => !delegateForm.selectedProcesses.includes(id)
  )
  delegateForm.selectedProcesses = unselected
  updateSelectAllState()
}

// 更新全选状态
const updateSelectAllState = () => {
  const selectedCount = delegateForm.selectedProcesses.length
  const totalCount = allAvailableProcessIds.value.length

  selectAllProcesses.value = selectedCount === totalCount
  isIndeterminate.value = selectedCount > 0 && selectedCount < totalCount
}

// 筛选操作
const handleFilter = () => {
  ElMessage.success('筛选完成')
}

const handleResetFilter = () => {
  filterForm.status = ''
  filterForm.dateRange = []
  filterForm.person = ''
}

// Tab 切换
const handleTabChange = (tab) => {
  console.log('切换到 Tab:', tab)
}

// 新建委托
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑委托
const handleEdit = (row) => {
  isEdit.value = true
  dialogVisible.value = true

  setTimeout(() => {
    delegateForm.id = row.id
    delegateForm.dateTimeRange = [row.startTime, row.endTime]
    delegateForm.trusteeId = 'user1'
    delegateForm.scopeType = row.scope === '全部审批流程' ? 'all' : 'specific'
    delegateForm.remark = row.remark || ''

    if (delegateForm.scopeType === 'specific') {
      delegateForm.selectedProcesses = ['purchase', 'expense']
    }

    updateSelectAllState()
  }, 100)
}

// 从详情编辑
const handleEditFromDetail = (row) => {
  detailDialogVisible.value = false
  setTimeout(() => {
    handleEdit(row)
  }, 300)
}

// 提交委托（从列表）
const handleSubmit = (row) => {
  ElMessageBox.confirm(
      '确认提交该委托吗？提交后将发送给受托人确认，所有操作全程留痕可追溯。',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
  ).then(() => {
    // 执行前置校验
    if (!validateBeforeSubmit(row)) {
      return
    }

    row.status = 'pending'
    row.confirmStatus = 'waiting'
    row.submitTime = new Date().toLocaleString('zh-CN')
    row.delegateNo = `WT${new Date().toISOString().slice(0,10).replace(/-/g,'')}00${row.id}`

    ElMessage.success('提交成功')
  }).catch(() => {})
}

// 从详情提交
const handleSubmitFromDetail = (row) => {
  detailDialogVisible.value = false
  setTimeout(() => {
    handleSubmit(row)
  }, 300)
}

// 提交前校验
const validateBeforeSubmit = (row) => {
  // 1. 人员权限校验
  // 2. 时长校验（最长 90 天）
  const startDate = new Date(row.startTime)
  const endDate = new Date(row.endTime)
  const diffDays = (endDate - startDate) / (1000 * 60 * 60 * 24)

  if (diffDays > 90) {
    ElMessage.error('委托时长不能超过 90 天')
    return false
  }

  // 3. 流程校验（黑名单流程）
  // 这里可以检查 selectedProcesses 是否包含黑名单流程

  return true
}

// 删除草稿
const handleDelete = (row) => {
  ElMessageBox.confirm('确认删除该草稿吗？删除后无法恢复。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index !== -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
    detailDialogVisible.value = false
  }).catch(() => {})
}

// 查看详情
const handleView = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true

  // 加载操作日志
  loadOperationLogs(row)
}

// 加载操作日志
const loadOperationLogs = (row) => {
  const logs = []

  // 创建委托
  logs.push({
    type: '创建委托',
    operator: row.delegatorName,
    time: row.submitTime || new Date().toLocaleString('zh-CN'),
    content: `创建了审批委托，委托范围：${row.scope}`,
    color: '#409EFF'
  })

  // 根据状态添加不同的日志
  if (row.status === 'draft_pending') {
    logs.push({
      type: '暂存草稿',
      operator: row.delegatorName,
      time: new Date().toLocaleString('zh-CN'),
      content: '暂存为草稿，仅委托人可见',
      color: '#909399'
    })
  } else if (row.status === 'pending') {
    logs.push({
      type: '提交申请',
      operator: row.delegatorName,
      time: row.submitTime,
      content: '提交委托申请，等待受托人确认',
      color: '#909399'
    })
    logs.push({
      type: '通知发送',
      operator: '系统',
      time: row.submitTime,
      content: `已向受托人${row.trusteeName}发送委托通知`,
      color: '#67C23A'
    })
  } else if (row.status === 'waiting' || row.status === 'active') {
    logs.push({
      type: '提交申请',
      operator: row.delegatorName,
      time: row.submitTime,
      content: '提交委托申请，等待受托人确认',
      color: '#909399'
    })
    logs.push({
      type: '受托人确认',
      operator: row.trusteeName,
      time: row.confirmTime,
      content: `${row.trusteeName}已确认接受委托`,
      color: '#67C23A'
    })
    if (row.status === 'waiting') {
      logs.push({
        type: '等待生效',
        operator: '系统',
        time: row.confirmTime,
        content: `委托已确认，将在 ${row.startTime} 生效`,
        color: '#E6A23C'
      })
    } else {
      logs.push({
        type: '委托生效',
        operator: '系统',
        time: row.confirmTime,
        content: `委托已生效，有效期至 ${row.endTime}`,
        color: '#E6A23C'
      })
    }
  } else if (row.status === 'rejected') {
    logs.push({
      type: '提交申请',
      operator: row.delegatorName,
      time: row.submitTime,
      content: '提交委托申请，等待受托人确认',
      color: '#909399'
    })
    logs.push({
      type: '受托人拒绝',
      operator: row.trusteeName,
      time: row.rejectTime,
      content: `${row.trusteeName}拒绝了委托，原因：${row.rejectReason}`,
      color: '#F56C6C'
    })
  } else if (row.status === 'cancelled') {
    logs.push({
      type: '撤销委托',
      operator: row.delegatorName,
      time: new Date().toLocaleString('zh-CN'),
      content: '委托人主动撤销该委托',
      color: '#F56C6C'
    })
  } else if (row.status === 'expired') {
    logs.push({
      type: '委托生效',
      operator: '系统',
      time: row.confirmTime,
      content: `委托已生效，有效期至 ${row.endTime}`,
      color: '#E6A23C'
    })
    logs.push({
      type: '委托过期',
      operator: '系统',
      time: row.endTime,
      content: '委托已超过失效时间，系统自动终止',
      color: '#909399'
    })
  } else if (row.status === 'void') {
    logs.push({
      type: '提交申请',
      operator: row.delegatorName,
      time: row.submitTime,
      content: '提交委托申请，等待受托人确认',
      color: '#909399'
    })
    logs.push({
      type: '系统作废',
      operator: '系统',
      time: new Date().toLocaleString('zh-CN'),
      content: '超过生效时间仍未确认，系统自动作废',
      color: '#909399'
    })
  }

  operationLogs.value = logs
}

// 撤销委托
const handleRevoke = (row) => {
  ElMessageBox.confirm('确认撤销该委托吗？撤销后受托人将无法继续处理相关审批。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'cancelled'
    ElMessage.success('撤销成功')
    detailDialogVisible.value = false
  }).catch(() => {})
}

// 同意委托
const handleAgree = (row) => {
  ElMessageBox.confirm('确认接受该委托吗？接受后您将有权处理委托人指定的审批单，所有操作将留痕可追溯。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'success'
  }).then(() => {
    row.confirmTime = new Date().toLocaleString('zh-CN')
    row.confirmStatus = 'confirmed'

    // 判断是否立即生效
    const now = Date.now()
    const startTime = new Date(row.startTime).getTime()

    if (now >= startTime) {
      row.status = 'active'
      ElMessage.success('接受委托成功，委托已生效！')
    } else {
      row.status = 'waiting'
      ElMessage.success('接受委托成功，委托将在设定时间自动生效')
    }

    detailDialogVisible.value = false

    // 模拟通知委托人
    setTimeout(() => {
      ElMessage.info(`已通知${row.delegatorName}：您发起的委托已被接受`)
    }, 1000)
  }).catch(() => {})
}

// 拒绝委托
const handleReject = (row) => {
  ElMessageBox.prompt('请输入拒绝原因，委托人将看到此信息', '拒绝委托', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '请填写拒绝原因',
    inputPlaceholder: '例如：时间冲突，无法接受委托',
    type: 'warning'
  }).then(({ value }) => {
    row.rejectReason = value
    row.rejectTime = new Date().toLocaleString('zh-CN')
    row.status = 'rejected'
    row.confirmStatus = 'rejected'

    ElMessage.success('已拒绝委托')
    detailDialogVisible.value = false

    // 模拟通知委托人
    setTimeout(() => {
      ElMessage.warning(`已通知${row.delegatorName}：您发起的委托已被拒绝，原因：${value}`)
    }, 1000)
  }).catch(() => {})
}

// 重置表单
const resetForm = () => {
  delegateForm.id = null
  delegateForm.dateTimeRange = [
    new Date().toLocaleString('zh-CN'),
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString('zh-CN')
  ]
  delegateForm.trusteeId = ''
  delegateForm.scopeType = 'all'
  delegateForm.selectedProcesses = []
  delegateForm.remark = ''
  processSearchText.value = ''
  selectAllProcesses.value = false
  isIndeterminate.value = false

  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单（暂存草稿）
const handleSubmitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (!valid) return

    if (delegateForm.scopeType === 'specific' && delegateForm.selectedProcesses.length === 0) {
      ElMessage.warning('请至少选择一个审批流程')
      return
    }

    ElMessageBox.confirm(
        '您即将暂存为草稿，仅您本人可见，是否确认？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    ).then(() => {
      submitting.value = true

      setTimeout(() => {
        ElMessage.success(isEdit.value ? '修改成功' : '创建成功')
        dialogVisible.value = false
        submitting.value = false

        // 模拟发送到我的收到委托列表
        if (!isEdit.value) {
          const newDelegate = {
            id: tableData.value.length + 1,
            delegateNo: null, // 草稿无编号
            trusteeName: '李四',
            delegatorName: '张三',
            scope: delegateForm.scopeType === 'all' ? '全部审批流程' : '指定流程',
            startTime: delegateForm.dateTimeRange[0],
            endTime: delegateForm.dateTimeRange[1],
            status: 'draft_pending', // 草稿待确认
            confirmStatus: 'unsubmitted',
            submitTime: null,
            confirmTime: null,
            remark: delegateForm.remark
          }
          tableData.value.unshift(newDelegate)
        }
      }, 500)
    }).catch(() => {})
  })
}

onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
.delegate-container {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  min-height: calc(100vh - 140px);

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    .header-left {
      h2 {
        font-size: 20px;
        color: #333;
        margin: 0;
        font-weight: 600;
      }
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .tab-card {
    :deep(.el-card__body) {
      padding: 0;
    }

    :deep(.el-tabs__header) {
      padding: 0 20px;
      margin-bottom: 0;
      background-color: #fafafa;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.el-tabs__item) {
      height: 50px;
      line-height: 50px;
      font-size: 15px;
      color: #606266;

      &.is-active {
        color: #409EFF;
        font-weight: 600;
      }
    }
  }

  .table-footer {
    margin-top: 20px;
    padding: 0 20px 20px;
    display: flex;
    justify-content: flex-end;
  }
}

// 弹框样式
.section-title {
  font-size: 14px;
  color: #333;
  font-weight: 600;
  margin-bottom: 12px;

  .el-icon {
    margin-right: 6px;
    vertical-align: middle;
  }
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.process-selector {
  margin-top: 12px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;

  .process-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .process-categories {
    max-height: 400px;
    overflow-y: auto;

    .category-item {
      margin-bottom: 16px;

      &:last-child {
        margin-bottom: 0;
      }

      .category-title {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        padding-left: 4px;
        border-left: 3px solid #409EFF;
      }

      .process-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        padding-left: 8px;

        .el-checkbox {
          margin-right: 0;

          :deep(.el-checkbox__label) {
            width: 100%;
            line-height: normal;
          }
        }
      }
    }
  }
}

// 详情弹框样式
.detail-content {
  .status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    margin: -20px -20px 20px;
    border-bottom: 2px solid;

    &.status-draft-pending {
      background-color: #f4f4f5;
      border-color: #909399;
    }

    &.status-pending {
      background-color: #fdf6ec;
      border-color: #E6A23C;
    }

    &.status-waiting {
      background-color: #ecf5ff;
      border-color: #409EFF;
    }

    &.status-active {
      background-color: #f0f9ff;
      border-color: #409EFF;
    }

    &.status-rejected,
    &.status-cancelled,
    &.status-void {
      background-color: #fef0f0;
      border-color: #F56C6C;
    }

    &.status-expired {
      background-color: #f4f4f5;
      border-color: #909399;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .status-icon {
        color: inherit;
      }

      .status-texts {
        .status-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 4px;
        }

        .pending-hint {
          margin-top: 8px;
        }

        .remaining-time {
          font-size: 13px;
          color: #E6A23C;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }

  .core-info-section,
  .operation-log-section {
    margin-bottom: 24px;

    .section-title {
      font-size: 16px;
      color: #333;
      margin-bottom: 16px;
      padding-left: 12px;
      border-left: 4px solid #409EFF;
    }
  }

  .operation-log-section {
    :deep(.el-timeline) {
      padding-left: 8px;
    }

    .log-item {
      .log-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .log-type {
          font-size: 14px;
          font-weight: 600;
        }

        .log-operator {
          font-size: 13px;
          color: #909399;
        }
      }

      .log-content {
        font-size: 14px;
        color: #606266;
        line-height: 1.6;
      }
    }
  }

  .bottom-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding-top: 20px;
    border-top: 1px solid #e8e8e8;
  }
}
</style>
