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
        <el-button type="warning" icon="Delete" @click="handleBatchDelete">批量删除</el-button>
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
      <el-table-column prop="ruleCode" label="规则编码" min-width="110" />
      <el-table-column prop="businessObject" label="业务对象" min-width="110" />
      <el-table-column prop="numberFormat" label="编号格式" min-width="200">
        <template #default="{ row }">
          <el-tag size="small">{{ row.numberFormat }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="currentNumber" label="当前编号" width="200" />
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
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column prop="creator" label="创建人" width="120" />
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column label="操作" width="320" align="center" fixed="right">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button size="small" type="primary" icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="success" icon="Setting" @click="handleDetail(row)">细则</el-button>
            <el-button size="small" type="info" icon="View" @click="handlePreview(row)">预览</el-button>
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

    <!-- 新增/编辑基础信息对话框 -->
    <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="ruleForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input
              v-model="ruleForm.ruleName"
              placeholder="请输入规则名称"
              @input="handleRuleNameChange"
          />
        </el-form-item>

        <el-form-item label="规则编码" prop="ruleCode">
          <el-input
              v-model="ruleForm.ruleCode"
              placeholder="自动生成，可编辑"
          />
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

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="ruleForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="查看范围" prop="viewScope">
          <el-input
              v-model="ruleForm.viewScopeText"
              readonly
              placeholder="请选择查看范围"
              @click="handleSelectUser('view')"
          >
            <template #append>
              <el-button icon="Search" @click="handleSelectUser('view')">选择</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="维护范围" prop="maintainScope">
          <el-input
              v-model="ruleForm.maintainScopeText"
              readonly
              placeholder="请选择维护范围"
              @click="handleSelectUser('maintain')"
          >
            <template #append>
              <el-button icon="Search" @click="handleSelectUser('maintain')">选择</el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
              v-model="ruleForm.sort"
              :min="0"
              :max="9999"
              style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>

    <!-- 细则编辑对话框 -->
    <el-dialog
        v-model="detailDialogVisible"
        title="编辑规则细则"
        width="1000px"
        :close-on-click-modal="false"
        class="rule-detail-dialog"
    >
      <div class="dialog-content">
        <!-- 提示信息 -->
        <el-alert
            title="请将规则属性拖入编号格式中，并依次点击拖入编号格式中的规则属性，填写并完成相应属性设置中的内容，编号格式中必须选择流水号规则属性"
            type="warning"
            :closable="false"
            show-icon
            style="margin-bottom: 20px"
        />

        <!-- 规则属性选择区 -->
        <div class="section">
          <h4 class="section-title">规则属性</h4>
          <div class="rule-attributes">
            <el-button
                v-for="attr in ruleAttributes"
                :key="attr.type"
                :type="selectedAttribute === attr.type ? 'primary' : 'default'"
                size="default"
                @click="handleSelectAttribute(attr.type)"
            >
              <el-icon><component :is="attr.icon" /></el-icon>
              {{ attr.label }}
            </el-button>
          </div>
        </div>

        <!-- 编号格式区 -->
        <div class="section">
          <h4 class="section-title">编号格式</h4>
          <div class="format-container">
            <div class="format-items">
              <div
                  v-for="(item, index) in formatItems"
                  :key="index"
                  class="format-item"
                  :class="{ 'active': activeFormatIndex === index }"
                  @click="handleSelectFormatItem(index)"
              >
                <span class="format-label">{{ getFormatLabel(item) }}</span>
                <el-icon class="remove-icon" @click.stop="handleRemoveFormatItem(index)"><CircleClose /></el-icon>
              </div>
              <el-button class="add-item-btn" @click="handleAddFormatItem">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 属性设置区 -->
        <div class="section" v-if="activeFormatIndex !== null && formatItems[activeFormatIndex]">
          <h4 class="section-title">属性设置</h4>
          <div class="attribute-settings">
            <!-- 常量设置 -->
            <div v-if="formatItems[activeFormatIndex].type === 'constant'" class="setting-item">
              <el-form-item label="常量值">
                <el-input
                    v-model="formatItems[activeFormatIndex].value"
                    placeholder="请输入常量值"
                    @input="updatePreview"
                />
              </el-form-item>
            </div>

            <!-- 日期时间设置 -->
            <div v-if="formatItems[activeFormatIndex].type === 'datetime'" class="setting-item">
              <el-form-item label="日期格式">
                <el-select v-model="formatItems[activeFormatIndex].format" @change="updatePreview">
                  <el-option label="YYYY" value="YYYY" />
                  <el-option label="YYYYMM" value="YYYYMM" />
                  <el-option label="YYYYMMDD" value="YYYYMMDD" />
                  <el-option label="YYYY-MM-DD" value="YYYY-MM-DD" />
                  <el-option label="YYYY-MM" value="YYYY-MM" />
                  <el-option label="MMDD" value="MMDD" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 流水号设置 -->
            <div v-if="formatItems[activeFormatIndex].type === 'sequence'" class="setting-item">
              <el-form :model="formatItems[activeFormatIndex]" label-width="100px">
                <el-form-item label="重置规则">
                  <el-select v-model="formatItems[activeFormatIndex].resetRule" @change="updatePreview">
                    <el-option label="永不重置" value="never" />
                    <el-option label="每天重置" value="daily" />
                    <el-option label="每月重置" value="monthly" />
                    <el-option label="每年重置" value="yearly" />
                  </el-select>
                </el-form-item>
                <el-form-item label="起始值">
                  <el-input-number
                      v-model="formatItems[activeFormatIndex].startValue"
                      :min="1"
                      :max="999999"
                      style="width: 100%"
                      @change="updatePreview"
                  />
                </el-form-item>
                <el-form-item label="步长">
                  <el-input-number
                      v-model="formatItems[activeFormatIndex].step"
                      :min="1"
                      :max="100"
                      style="width: 100%"
                      @change="updatePreview"
                  />
                </el-form-item>
                <el-form-item label="长度">
                  <el-input-number
                      v-model="formatItems[activeFormatIndex].length"
                      :min="1"
                      :max="10"
                      style="width: 100%"
                      @change="updatePreview"
                  />
                </el-form-item>
                <el-form-item label="填充值">
                  <el-input
                      v-model="formatItems[activeFormatIndex].padding"
                      maxlength="1"
                      style="width: 100px"
                      @input="updatePreview"
                  />
                </el-form-item>
              </el-form>
            </div>

            <!-- 自定义设置 -->
            <div v-if="formatItems[activeFormatIndex].type === 'custom'" class="setting-item">
              <el-form-item label="自定义值">
                <el-input
                    v-model="formatItems[activeFormatIndex].value"
                    placeholder="请输入自定义表达式"
                    @input="updatePreview"
                />
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- 预览编号区 -->
        <div class="section">
          <h4 class="section-title">预览编号</h4>
          <div class="preview-container">
            <el-input
                v-model="previewNumber"
                readonly
                size="large"
                class="preview-input"
            >
              <template #prefix>
                <el-icon><View /></el-icon>
              </template>
            </el-input>
          </div>
        </div>

        <!-- 编号预览展示 -->
        <div class="section">
          <h4 class="section-title">编号预览</h4>
          <div class="preview-display">
            <el-tag type="success" size="large">{{ previewNumber || '请在上方配置编号格式' }}</el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleDetailSubmit" :loading="saving">保存</el-button>
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

    <!-- 选人组件 -->
    <UserSelectDialog
        v-model="userSelectVisible"
        :multiple="true"
        @confirm="handleUserSelectConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Download, Edit, View, Delete, CircleClose, Document, Calendar, Sort, EditPen, Setting } from '@element-plus/icons-vue'
import UserSelectDialog from '@/components/UserSelectDialog.vue'
import { pinyin } from 'pinyin-pro'

const searchKeyword = ref('')
const filterStatus = ref('')
const loading = ref(false)
const saving = ref(false)

// 规则列表
const ruleList = ref([
  {
    id: 1,
    ruleName: '请假申请编号规则',
    ruleCode: 'JQSQ001',
    businessObject: '请假申请',
    numberFormat: 'QJ{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'QJ20240408-0015',
    formatItems: [
      { type: 'constant', value: 'QJ' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'datetime', format: 'MM' },
      { type: 'datetime', format: 'DD' },
      { type: 'constant', value: '-' },
      { type: 'sequence', resetRule: 'daily', startValue: 1, step: 1, length: 4, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '全员',
    maintainScope: [],
    maintainScopeText: '系统管理员',
    sort: 1,
    creator: '系统管理员',
    createTime: '2024-01-10 09:00:00'
  },
  {
    id: 2,
    ruleName: '加班申请编号规则',
    ruleCode: 'JBSQ001',
    businessObject: '加班申请',
    numberFormat: 'JB{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'JB20240408-0008',
    formatItems: [
      { type: 'constant', value: 'JB' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'datetime', format: 'MM' },
      { type: 'datetime', format: 'DD' },
      { type: 'constant', value: '-' },
      { type: 'sequence', resetRule: 'daily', startValue: 1, step: 1, length: 4, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '全员',
    maintainScope: [],
    maintainScopeText: '系统管理员',
    sort: 2,
    creator: '系统管理员',
    createTime: '2024-01-12 14:30:00'
  },
  {
    id: 3,
    ruleName: '业务用车编号规则',
    ruleCode: 'YWYC001',
    businessObject: '车辆申请',
    numberFormat: '业务用车[{YYYY}]第{SEQ:1}号',
    currentNumber: '业务用车[2026]第1号',
    formatItems: [
      { type: 'constant', value: '业务用车[' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'constant', value: ']第' },
      { type: 'sequence', resetRule: 'yearly', startValue: 1, step: 1, length: 1, padding: '' },
      { type: 'constant', value: '号' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '全员',
    maintainScope: [],
    maintainScopeText: '系统管理员',
    sort: 3,
    creator: '行政管理员',
    createTime: '2024-02-15 10:00:00'
  },
  {
    id: 4,
    ruleName: '会议申请编号规则',
    ruleCode: 'HYSQ001',
    businessObject: '会议申请',
    numberFormat: 'HY{YYYY}{MM}-{SEQ:4}',
    currentNumber: 'HY202404-0023',
    formatItems: [
      { type: 'constant', value: 'HY' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'datetime', format: 'MM' },
      { type: 'constant', value: '-' },
      { type: 'sequence', resetRule: 'monthly', startValue: 1, step: 1, length: 4, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '全员',
    maintainScope: [],
    maintainScopeText: '系统管理员',
    sort: 4,
    creator: '流程管理员',
    createTime: '2024-02-01 10:00:00'
  },
  {
    id: 5,
    ruleName: '费用报销编号规则',
    ruleCode: 'FYBX001',
    businessObject: '费用报销',
    numberFormat: 'BX{YYYY}{MM}{DD}-{SEQ:6}',
    currentNumber: 'BX20240408-000042',
    formatItems: [
      { type: 'constant', value: 'BX' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'datetime', format: 'MM' },
      { type: 'datetime', format: 'DD' },
      { type: 'constant', value: '-' },
      { type: 'sequence', resetRule: 'daily', startValue: 1, step: 1, length: 6, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '财务部',
    maintainScope: [],
    maintainScopeText: '财务管理员',
    sort: 5,
    creator: '财务管理员',
    createTime: '2024-03-01 09:30:00'
  },
  {
    id: 6,
    ruleName: '资金头寸安排编号规则',
    ruleCode: 'ZZTCAP001',
    businessObject: '资金安排',
    numberFormat: 'ZZTCAP-{YYYY}{MM}{DD}-{SEQ:4}',
    currentNumber: 'ZZTCAP-20240408-0001',
    formatItems: [
      { type: 'constant', value: 'ZZTCAP-' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'datetime', format: 'MM' },
      { type: 'datetime', format: 'DD' },
      { type: 'constant', value: '-' },
      { type: 'sequence', resetRule: 'daily', startValue: 1, step: 1, length: 4, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '财务部、高管',
    maintainScope: [],
    maintainScopeText: '财务总监',
    sort: 6,
    creator: '财务总监',
    createTime: '2024-03-15 14:00:00'
  },
  {
    id: 7,
    ruleName: '合同审批编号规则',
    ruleCode: 'HTSP001',
    businessObject: '合同审批',
    numberFormat: 'HT{YYYY}-{SEQ:5}',
    currentNumber: 'HT2024-00125',
    formatItems: [
      { type: 'constant', value: 'HT' },
      { type: 'datetime', format: 'YYYY' },
      { type: 'constant', value: '-' },
      { type: 'sequence', resetRule: 'yearly', startValue: 1, step: 1, length: 5, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '法务部、财务部',
    maintainScope: [],
    maintainScopeText: '法务管理员',
    sort: 7,
    creator: '法务管理员',
    createTime: '2024-01-20 11:00:00'
  },
  {
    id: 8,
    ruleName: '采购申请编号规则',
    ruleCode: 'CGSQ001',
    businessObject: '采购申请',
    numberFormat: 'CG{YYYYMM}{SEQ:4}',
    currentNumber: 'CG2024040089',
    formatItems: [
      { type: 'constant', value: 'CG' },
      { type: 'datetime', format: 'YYYYMM' },
      { type: 'sequence', resetRule: 'monthly', startValue: 1, step: 1, length: 4, padding: '0' }
    ],
    status: 'disabled',
    viewScope: [],
    viewScopeText: '采购部',
    maintainScope: [],
    maintainScopeText: '采购管理员',
    sort: 8,
    creator: '采购管理员',
    createTime: '2024-02-10 16:30:00'
  },
  {
    id: 9,
    ruleName: '差旅报销编号规则',
    ruleCode: 'CLBX001',
    businessObject: '差旅报销',
    numberFormat: '差旅[{YYYY-MM}]-{SEQ:3}',
    currentNumber: '差旅[2024-04]-056',
    formatItems: [
      { type: 'constant', value: '差旅[' },
      { type: 'datetime', format: 'YYYY-MM' },
      { type: 'constant', value: ']-' },
      { type: 'sequence', resetRule: 'monthly', startValue: 1, step: 1, length: 3, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '全员',
    maintainScope: [],
    maintainScopeText: '财务管理员',
    sort: 9,
    creator: '财务管理员',
    createTime: '2024-03-05 09:00:00'
  },
  {
    id: 10,
    ruleName: '用印申请编号规则',
    ruleCode: 'YYSQ001',
    businessObject: '用印申请',
    numberFormat: '印章{YYYYMMDD}{SEQ:4}',
    currentNumber: '印章202404080234',
    formatItems: [
      { type: 'constant', value: '印章' },
      { type: 'datetime', format: 'YYYYMMDD' },
      { type: 'sequence', resetRule: 'daily', startValue: 1, step: 1, length: 4, padding: '0' }
    ],
    status: 'enabled',
    viewScope: [],
    viewScopeText: '全员',
    maintainScope: [],
    maintainScopeText: '行政管理员',
    sort: 10,
    creator: '行政管理员',
    createTime: '2024-01-25 13:00:00'
  }
])

const pageSize = ref(10)
const currentPage = ref(1)

// 筛选后的列表
const filteredRuleList = computed(() => {
  let result = [...ruleList.value]

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(rule =>
        rule.ruleName.toLowerCase().includes(keyword) ||
        rule.businessObject.toLowerCase().includes(keyword)
    )
  }

  if (filterStatus.value) {
    result = result.filter(rule => rule.status === filterStatus.value)
  }

  return result
})

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('新增规则')
const formRef = ref(null)

// 表单数据
const ruleForm = ref({
  id: null,
  ruleName: '',
  ruleCode: '',
  businessObject: '',
  status: 'enabled',
  viewScope: [],
  viewScopeText: '',
  maintainScope: [],
  maintainScopeText: '',
  sort: 0
})

// 表单验证规则
const formRules = {
  ruleName: [
    { required: true, message: '请输入规则名称', trigger: 'blur' },
    { max: 50, message: '规则名称不能超过50个字符', trigger: 'blur' }
  ],
  ruleCode: [
    { required: true, message: '请输入规则编码', trigger: 'blur' },
    { max: 50, message: '规则编码不能超过50个字符', trigger: 'blur' }
  ],
  businessObject: [
    { required: true, message: '请选择业务对象', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 生成规则编码
const generateRuleCode = (name) => {
  if (!name) return ''

  // 判断是否包含中文
  const hasChinese = /[\u4e00-\u9fa5]/.test(name)

  let prefix = ''
  if (hasChinese) {
    // 中文：转换为汉语拼音首字母大写
    const result = pinyin(name, {
      pattern: 'first',
      toneType: 'none',
      type: 'array'
    })
    prefix = result.join('').toUpperCase()
  } else {
    // 英文：直接使用
    prefix = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
  }

  // 生成3位随机数字
  const randomNum = String(Math.floor(Math.random() * 900) + 100)

  return `${prefix}${randomNum}`
}

// 规则名称变更
const handleRuleNameChange = (value) => {
  if (!ruleForm.value.ruleCode || ruleForm.value.ruleCode === ruleForm.value._lastGeneratedCode) {
    const newCode = generateRuleCode(value)
    ruleForm.value.ruleCode = newCode
    ruleForm.value._lastGeneratedCode = newCode
  }
}

// 规则属性选项
const ruleAttributes = [
  { type: 'constant', label: '常量', icon: 'Document' },
  { type: 'datetime', label: '日期时间', icon: 'Calendar' },
  { type: 'sequence', label: '流水号', icon: 'Sort' },
  { type: 'custom', label: '自定义', icon: 'EditPen' }
]

// 细则对话框
const detailDialogVisible = ref(false)
const selectedAttribute = ref('')
const formatItems = ref([])
const activeFormatIndex = ref(null)
const previewNumber = ref('')
const currentEditRule = ref(null)

// 预览对话框
const previewVisible = ref(false)
const previewRule = ref(null)
const nextNumbers = ref([])

// 选人对话框
const userSelectVisible = ref(false)
const userSelectType = ref('') // 'view' or 'maintain'

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
    id: null,
    ruleName: '',
    ruleCode: '',
    businessObject: '',
    status: 'enabled',
    viewScope: [],
    viewScopeText: '',
    maintainScope: [],
    maintainScopeText: '',
    sort: 0,
    _lastGeneratedCode: ''
  }
  dialogVisible.value = true
}

// 编辑基础信息
const handleEdit = (row) => {
  dialogTitle.value = '编辑规则'
  ruleForm.value = {
    ...row,
    _lastGeneratedCode: row.ruleCode
  }
  dialogVisible.value = true
}

// 编辑细则
const handleDetail = (row) => {
  currentEditRule.value = row
  formatItems.value = row.formatItems ? JSON.parse(JSON.stringify(row.formatItems)) : []
  activeFormatIndex.value = null
  selectedAttribute.value = ''
  updatePreview()
  detailDialogVisible.value = true
}

// 提交基础信息
const handleSubmit = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      saving.value = true

      setTimeout(() => {
        if (ruleForm.value.id) {
          // 编辑
          const index = ruleList.value.findIndex(r => r.id === ruleForm.value.id)
          if (index !== -1) {
            const { _lastGeneratedCode, ...rest } = ruleForm.value
            ruleList.value[index] = { ...ruleList.value[index], ...rest }
          }
          ElMessage.success('规则修改成功')
        } else {
          // 新增
          const { _lastGeneratedCode, ...rest } = ruleForm.value
          const newRule = {
            ...rest,
            id: Date.now(),
            numberFormat: '',
            currentNumber: '-',
            formatItems: [],
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

// 提交细则
const handleDetailSubmit = () => {
  const hasSequence = formatItems.value.some(item => item.type === 'sequence')
  if (!hasSequence) {
    ElMessage.warning('编号格式中必须包含流水号')
    return
  }

  const numberFormat = formatItems.value.map(item => {
    switch (item.type) {
      case 'constant':
        return item.value
      case 'datetime':
        return `{${item.format}}`
      case 'sequence':
        return `{SEQ:${item.length}}`
      case 'custom':
        return item.value
      default:
        return ''
    }
  }).join('')

  saving.value = true

  setTimeout(() => {
    if (currentEditRule.value) {
      const index = ruleList.value.findIndex(r => r.id === currentEditRule.value.id)
      if (index !== -1) {
        ruleList.value[index] = {
          ...ruleList.value[index],
          formatItems: JSON.parse(JSON.stringify(formatItems.value)),
          numberFormat
        }
      }
      ElMessage.success('细则修改成功')
    }

    saving.value = false
    detailDialogVisible.value = false
  }, 500)
}

// 状态变更（带确认对话框）
const handleStatusChange = (row) => {
  const newStatus = row.status
  const oldStatus = newStatus === 'enabled' ? 'disabled' : 'enabled'
  const action = newStatus === 'enabled' ? '启用' : '停用'
  const oppositeAction = newStatus === 'enabled' ? '停用' : '启用'

  // 恢复原状态
  row.status = oldStatus

  ElMessageBox.confirm(
      `确定要${action}规则"${row.ruleName}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: `确认${action}`,
        cancelButtonText: '取消',
        type: newStatus === 'enabled' ? 'success' : 'warning'
      }
  ).then(() => {
    row.status = newStatus
    ElMessage.success(`已${action}`)
  }).catch(() => {
    // 用户取消，保持原状态
  })
}

// 选择规则属性类型
const handleSelectAttribute = (type) => {
  selectedAttribute.value = type
  formatItems.value.push(createFormatItem(type))
  activeFormatIndex.value = formatItems.value.length - 1
  updatePreview()
}

// 创建格式项
const createFormatItem = (type) => {
  const base = { type }
  switch (type) {
    case 'constant':
      return { ...base, value: '' }
    case 'datetime':
      return { ...base, format: 'YYYYMMDD' }
    case 'sequence':
      return { ...base, resetRule: 'never', startValue: 1, step: 1, length: 4, padding: '0' }
    case 'custom':
      return { ...base, value: '' }
    default:
      return base
  }
}

// 获取格式标签
const getFormatLabel = (item) => {
  switch (item.type) {
    case 'constant':
      return item.value || '常量'
    case 'datetime':
      return item.format || '日期时间'
    case 'sequence':
      return `流水号(${item.length}位)`
    case 'custom':
      return item.value || '自定义'
    default:
      return item.type
  }
}

// 选择格式项
const handleSelectFormatItem = (index) => {
  activeFormatIndex.value = index
}

// 移除格式项
const handleRemoveFormatItem = (index) => {
  formatItems.value.splice(index, 1)
  if (activeFormatIndex.value === index) {
    activeFormatIndex.value = null
  } else if (activeFormatIndex.value > index) {
    activeFormatIndex.value--
  }
  updatePreview()
}

// 添加格式项
const handleAddFormatItem = () => {
  if (!selectedAttribute.value) {
    ElMessage.warning('请先选择规则属性类型')
    return
  }
  formatItems.value.push(createFormatItem(selectedAttribute.value))
  activeFormatIndex.value = formatItems.value.length - 1
  updatePreview()
}

// 更新预览
const updatePreview = () => {
  const now = new Date()
  let preview = ''

  formatItems.value.forEach(item => {
    switch (item.type) {
      case 'constant':
        preview += item.value || ''
        break
      case 'datetime':
        preview += formatDateTime(now, item.format)
        break
      case 'sequence':
        const seq = String(item.startValue).padStart(item.length, item.padding || '0')
        preview += seq
        break
      case 'custom':
        preview += item.value || ''
        break
    }
  })

  previewNumber.value = preview
}

// 格式化日期时间
const formatDateTime = (date, format) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  switch (format) {
    case 'YYYY':
      return String(year)
    case 'YYYYMM':
      return `${year}${month}`
    case 'YYYYMMDD':
      return `${year}${month}${day}`
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    case 'YYYY-MM':
      return `${year}-${month}`
    case 'MMDD':
      return `${month}${day}`
    default:
      return format
  }
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
  let format = ''

  if (rule.formatItems && rule.formatItems.length > 0) {
    rule.formatItems.forEach(item => {
      switch (item.type) {
        case 'constant':
          format += item.value || ''
          break
        case 'datetime':
          format += formatDateTime(now, item.format)
          break
        case 'sequence':
          format += String(1).padStart(item.length, item.padding || '0')
          break
        case 'custom':
          format += item.value || ''
          break
      }
    })
  } else {
    format = rule.numberFormat || ''
    format = format.replace('{YYYY}', now.getFullYear())
    format = format.replace('{MM}', String(now.getMonth() + 1).padStart(2, '0'))
    format = format.replace('{DD}', String(now.getDate()).padStart(2, '0'))
    format = format.replace('{SEQ:4}', '0001')
    format = format.replace('{SEQ:6}', '000001')
  }

  return format
}

// 生成接下来3个编号
const generateNextNumbers = (rule) => {
  const numbers = []
  const currentNum = rule.currentNumber || '-'

  if (currentNum === '-') {
    const sample = generateSampleNumber(rule)
    for (let i = 0; i < 3; i++) {
      numbers.push(sample.replace(/0001$/, String(i + 1).padStart(4, '0')))
    }
  } else {
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

// 批量删除
const selectedRows = ref([])
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请先选择要删除的规则')
    return
  }

  ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条规则吗？此操作不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
  ).then(() => {
    const ids = selectedRows.value.map(row => row.id)
    ruleList.value = ruleList.value.filter(r => !ids.includes(r.id))
    ElMessage.success('批量删除成功')
    selectedRows.value = []
  }).catch(() => {})
}

// 选人
const handleSelectUser = (type) => {
  userSelectType.value = type
  userSelectVisible.value = true
}

const handleUserSelectConfirm = (users) => {
  if (userSelectType.value === 'view') {
    ruleForm.value.viewScope = users.map(u => u.id)
    ruleForm.value.viewScopeText = users.map(u => u.name).join('、')
  } else if (userSelectType.value === 'maintain') {
    ruleForm.value.maintainScope = users.map(u => u.id)
    ruleForm.value.maintainScopeText = users.map(u => u.name).join('、')
  }
  userSelectVisible.value = false
}

// 导出
const handleExport = () => {
  ElMessage.success('导出功能开发中...')
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

  :deep(.rule-detail-dialog) {
    .el-dialog__body {
      padding: 20px;
    }
  }

  .dialog-content {
    .section {
      margin-bottom: 24px;

      .section-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e4e7ed;
      }
    }

    .rule-attributes {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .format-container {
      background: #f5f7fa;
      padding: 16px;
      border-radius: 4px;
      min-height: 60px;

      .format-items {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;

        .format-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #fff;
          border: 1px solid #dcdfe6;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            border-color: #409eff;
          }

          &.active {
            border-color: #409eff;
            background: #ecf5ff;
          }

          .format-label {
            font-size: 13px;
            color: #606266;
          }

          .remove-icon {
            color: #f56c6c;
            cursor: pointer;
            font-size: 16px;

            &:hover {
              color: #f78989;
            }
          }
        }

        .add-item-btn {
          width: 40px;
          height: 40px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    .attribute-settings {
      background: #fafafa;
      padding: 16px;
      border-radius: 4px;

      .setting-item {
        :deep(.el-form-item) {
          margin-bottom: 16px;
        }
      }
    }

    .preview-container {
      .preview-input {
        :deep(.el-input__wrapper) {
          background: #f5f7fa;
        }
      }
    }

    .preview-display {
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;
      text-align: center;
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
