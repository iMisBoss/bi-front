<template>
  <div class="data-resources-management">
    <!-- 功能区 -->
    <div class="function-section">
      <div class="search-area">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索资源名称/编码"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="action-area" v-if="isAdmin">
        <el-button type="primary" icon="Plus" @click="handleAdd">
          {{ getAddButtonText() }}
        </el-button>
      </div>
    </div>

    <!-- Tab导航栏 -->
    <el-tabs v-model="activeTab" class="resource-tabs" @tab-change="handleTabChange">
      <!-- Tab1：数据字典 -->
      <el-tab-pane label="数据字典" name="dictionary">
        <template #label>
          <span class="tab-label">
            <el-icon><Notebook /></el-icon>
            数据字典
            <el-badge :value="dictionaryList.length" :max="99" class="tab-badge" />
          </span>
        </template>

        <!-- 批量操作栏 -->
        <div v-if="selectedDicts.length > 0 && isAdmin" class="batch-toolbar">
          <el-checkbox v-model="selectAllDict" @change="handleSelectAllDict">全选</el-checkbox>
          <span class="batch-info">已选择 {{ selectedDicts.length }} 项</span>
          <el-button size="small" type="success" @click="handleBatchEnableDict">批量启用</el-button>
          <el-button size="small" type="warning" @click="handleBatchDisableDict">批量禁用</el-button>
          <el-button size="small" type="info" @click="handleBatchExportDict">批量导出</el-button>
        </div>

        <!-- 数据字典表格 -->
        <el-table
            :data="filteredDictionaryList"
            border
            stripe
            v-loading="loading"
            @selection-change="handleDictSelectionChange"
        >
          <el-table-column v-if="isAdmin" type="selection" width="50" align="center" />

          <el-table-column prop="dictCode" label="字典编码" width="150" fixed>
            <template #default="{ row }">
              <span class="code-text">{{ row.dictCode }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="dictName" label="字典名称" width="160" />

          <el-table-column prop="category" label="字典分类" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getDictCategoryTag(row.category)">
                {{ getDictCategoryText(row.category) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="选项数量" width="100" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small">{{ row.options ? row.options.length : 0 }} 项</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                  v-if="isAdmin && !row.isSystem"
                  v-model="row.status"
                  active-value="enabled"
                  inactive-value="disabled"
                  @change="handleDictStatusChange(row)"
              />
              <el-tag v-else :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="updateTime" label="更新时间" width="180" />

          <el-table-column label="操作" width="280" align="center" fixed="right" v-if="isAdmin">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="handleEditDict(row)">编辑</el-button>
              <el-button size="small" link type="success" @click="handleManageOptions(row)">管理选项</el-button>
              <el-button size="small" link type="info" @click="handleImportDict(row)">导入</el-button>
              <el-button size="small" link type="warning" @click="handleExportDict(row)">导出</el-button>
              <el-button
                  v-if="!row.isSystem"
                  size="small"
                  link
                  type="danger"
                  @click="handleDeleteDict(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <el-empty v-if="filteredDictionaryList.length === 0" description="暂无数据字典" :image-size="100">
          <template #description>
            <p class="empty-text">请点击上方「新建字典」按钮创建</p>
          </template>
          <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAdd">新建字典</el-button>
        </el-empty>
      </el-tab-pane>

      <!-- Tab2：数据源 -->
      <el-tab-pane label="数据源" name="datasource">
        <template #label>
          <span class="tab-label">
            <el-icon><DataLine /></el-icon>
            数据源
            <el-badge :value="datasourceList.length" :max="99" class="tab-badge" />
          </span>
        </template>

        <!-- 批量操作栏 -->
        <div v-if="selectedDatasources.length > 0 && isAdmin" class="batch-toolbar">
          <el-checkbox v-model="selectAllDatasource" @change="handleSelectAllDatasource">全选</el-checkbox>
          <span class="batch-info">已选择 {{ selectedDatasources.length }} 项</span>
          <el-button size="small" type="success" @click="handleBatchSyncDatasource">批量同步</el-button>
          <el-button size="small" type="info" @click="handleBatchExportDatasource">批量导出</el-button>
        </div>

        <!-- 数据源表格 -->
        <el-table
            :data="filteredDatasourceList"
            border
            stripe
            v-loading="loading"
            @selection-change="handleDatasourceSelectionChange"
        >
          <el-table-column v-if="isAdmin" type="selection" width="50" align="center" />

          <el-table-column prop="name" label="数据源名称" width="180" />

          <el-table-column prop="type" label="数据源类型" width="120" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getDatasourceTypeTag(row.type)">
                {{ getDatasourceTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="connectionUrl" label="连接地址" min-width="200">
            <template #default="{ row }">
              <span class="masked-text">{{ maskUrl(row.connectionUrl) }}</span>
            </template>
          </el-table-column>

          <el-table-column label="连接状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="row.connectionStatus === 'success' ? 'success' : 'danger'" size="small">
                {{ row.connectionStatus === 'success' ? '正常' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="lastSyncTime" label="最后同步时间" width="180" />

          <el-table-column label="操作" width="220" align="center" fixed="right" v-if="isAdmin">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="handleEditDatasource(row)">编辑</el-button>
              <el-button size="small" link type="success" @click="handleTestConnection(row)">测试连接</el-button>
              <el-button size="small" link type="warning" @click="handleSyncDatasource(row)">同步数据</el-button>
              <el-button
                  v-if="!row.isSystem"
                  size="small"
                  link
                  type="danger"
                  @click="handleDeleteDatasource(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <el-empty v-if="filteredDatasourceList.length === 0" description="暂无数据源" :image-size="100">
          <template #description>
            <p class="empty-text">请点击上方「新建数据源」按钮创建</p>
          </template>
          <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAdd">新建数据源</el-button>
        </el-empty>
      </el-tab-pane>

      <!-- Tab3：接口管理 -->
      <el-tab-pane label="接口管理" name="api">
        <template #label>
          <span class="tab-label">
            <el-icon><Share /></el-icon>
            接口管理
            <el-badge :value="apiList.length" :max="99" class="tab-badge" />
          </span>
        </template>

        <!-- 批量操作栏 -->
        <div v-if="selectedApis.length > 0 && isAdmin" class="batch-toolbar">
          <el-checkbox v-model="selectAllApi" @change="handleSelectAllApi">全选</el-checkbox>
          <span class="batch-info">已选择 {{ selectedApis.length }} 项</span>
          <el-button size="small" type="success" @click="handleBatchEnableApi">批量启用</el-button>
          <el-button size="small" type="warning" @click="handleBatchDisableApi">批量禁用</el-button>
        </div>

        <!-- 接口表格 -->
        <el-table
            :data="filteredApiList"
            border
            stripe
            v-loading="loading"
            @selection-change="handleApiSelectionChange"
        >
          <el-table-column v-if="isAdmin" type="selection" width="50" align="center" />

          <el-table-column prop="name" label="接口名称" width="180" />

          <el-table-column prop="method" label="请求方式" width="100" align="center">
            <template #default="{ row }">
              <el-tag size="small" :type="getMethodTag(row.method)">
                {{ row.method }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="url" label="接口地址" min-width="250">
            <template #default="{ row }">
              <span class="masked-text">{{ maskUrl(row.url) }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="callCount" label="调用次数" width="100" align="center">
            <template #default="{ row }">
              <span class="call-count">{{ row.callCount }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-switch
                  v-if="isAdmin"
                  v-model="row.status"
                  active-value="enabled"
                  inactive-value="disabled"
                  @change="handleApiStatusChange(row)"
              />
              <el-tag v-else :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
                {{ row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220" align="center" fixed="right" v-if="isAdmin">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="handleEditApi(row)">编辑</el-button>
              <el-button size="small" link type="success" @click="handleDebugApi(row)">接口调试</el-button>
              <el-button size="small" link type="info" @click="handleViewApiLogs(row)">查看日志</el-button>
              <el-button size="small" link type="danger" @click="handleDeleteApi(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 空状态 -->
        <el-empty v-if="filteredApiList.length === 0" description="暂无接口" :image-size="100">
          <template #description>
            <p class="empty-text">请点击上方「新建接口」按钮创建</p>
          </template>
          <el-button v-if="isAdmin" type="primary" icon="Plus" @click="handleAdd">新建接口</el-button>
        </el-empty>
      </el-tab-pane>
    </el-tabs>

    <!-- 分页区 -->
    <div class="pagination-section">
      <div class="pagination-info">
        共 {{ getCurrentTotal() }} 条记录 | 每页{{ pageSize }}条
      </div>
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="getCurrentTotal()"
          layout="prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>

    <!-- 新建/编辑字典弹窗 -->
    <el-dialog
        v-model="dictDialogVisible"
        :title="dictDialogTitle"
        width="700px"
        :close-on-click-modal="false"
    >
      <el-form :model="dictForm" :rules="dictRules" ref="dictFormRef" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="dictForm.dictName" placeholder="如：请假类型" />
        </el-form-item>
        <el-form-item label="字典编码" prop="dictCode">
          <el-input v-model="dictForm.dictCode" placeholder="如：leave_type" :disabled="!!dictForm.id" />
          <div class="form-tip">字典编码用于表单引用，建议使用英文和下划线</div>
        </el-form-item>
        <el-form-item label="字典分类" prop="category">
          <el-select v-model="dictForm.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="行政" value="admin" />
            <el-option label="财务" value="finance" />
            <el-option label="人事" value="hr" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dictForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dictDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitDict" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 管理选项弹窗 -->
    <el-dialog
        v-model="optionsDialogVisible"
        :title="`管理选项 - ${currentDict?.dictName || ''}`"
        width="600px"
        :close-on-click-modal="false"
    >
      <div class="options-manager">
        <div class="options-header">
          <el-button size="small" type="primary" icon="Plus" @click="addOption">添加选项</el-button>
          <span class="options-count">共 {{ currentDict?.options?.length || 0 }} 项</span>
        </div>
        <div class="options-list">
          <div v-for="(option, index) in currentDict?.options" :key="index" class="option-item">
            <span class="option-index">{{ index + 1 }}</span>
            <el-input v-model="option.label" placeholder="选项名称" size="small" style="flex: 1" />
            <el-input v-model="option.value" placeholder="选项值" size="small" style="flex: 1; margin-left: 8px" />
            <el-button size="small" type="danger" icon="Delete" circle @click="removeOption(index)" />
          </div>
        </div>
        <el-empty v-if="!currentDict?.options || currentDict.options.length === 0" description="暂无选项" :image-size="80" />
      </div>
      <template #footer>
        <el-button @click="optionsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveOptions" :loading="saving">保存选项</el-button>
      </template>
    </el-dialog>

    <!-- 数据源编辑弹窗 -->
    <el-dialog
        v-model="datasourceDialogVisible"
        :title="datasourceDialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="datasourceForm" :rules="datasourceRules" ref="datasourceFormRef" label-width="120px">
        <el-form-item label="数据源名称" prop="name">
          <el-input v-model="datasourceForm.name" placeholder="如：公司HR数据库" />
        </el-form-item>
        <el-form-item label="数据源类型" prop="type">
          <el-select v-model="datasourceForm.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="系统内置" value="system" />
            <el-option label="MySQL" value="mysql" />
            <el-option label="Oracle" value="oracle" />
            <el-option label="API接口" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item label="连接地址" prop="connectionUrl">
          <el-input v-model="datasourceForm.connectionUrl" placeholder="如：jdbc:mysql://localhost:3306/hr_db" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="datasourceForm.username" placeholder="数据库用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="datasourceForm.password" type="password" placeholder="数据库密码" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="datasourceDialogVisible = false">取消</el-button>
        <el-button type="success" @click="handleTestConnectionForm">测试连接</el-button>
        <el-button type="primary" @click="handleSubmitDatasource" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 接口编辑弹窗 -->
    <el-dialog
        v-model="apiDialogVisible"
        :title="apiDialogTitle"
        width="800px"
        :close-on-click-modal="false"
    >
      <el-form :model="apiForm" :rules="apiRules" ref="apiFormRef" label-width="120px">
        <el-form-item label="接口名称" prop="name">
          <el-input v-model="apiForm.name" placeholder="如：客户信息查询接口" />
        </el-form-item>
        <el-form-item label="请求方式" prop="method">
          <el-select v-model="apiForm.method" placeholder="请选择" style="width: 100%">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="接口地址" prop="url">
          <el-input v-model="apiForm.url" placeholder="如：https://api.example.com/customer" />
        </el-form-item>
        <el-form-item label="请求头">
          <el-input v-model="apiForm.headers" type="textarea" :rows="2" placeholder='{"Content-Type": "application/json"}' />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="apiForm.status">
            <el-radio label="enabled">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="apiDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitApi" :loading="saving">保存</el-button>
      </template>
    </el-dialog>

    <!-- 接口调试弹窗 -->
    <el-dialog
        v-model="debugDialogVisible"
        title="接口调试"
        width="900px"
        :close-on-click-modal="false"
    >
      <div class="api-debug">
        <div class="debug-section">
          <h4 class="debug-title">请求参数</h4>
          <el-input
              v-model="debugParams"
              type="textarea"
              :rows="4"
              placeholder='{"customerId": "123"}'
          />
          <el-button type="primary" icon="VideoPlay" @click="handleDebugRequest" :loading="debugLoading" style="margin-top: 8px">
            发送请求
          </el-button>
        </div>
        <div class="debug-section">
          <h4 class="debug-title">响应结果</h4>
          <div class="response-box">
            <pre class="response-content">{{ debugResponse || '点击「发送请求」查看结果' }}</pre>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="debugDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, Notebook, DataLine, Share,
  Delete, VideoPlay
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 加载状态
const loading = ref(false)
const saving = ref(false)
const debugLoading = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 当前Tab
const activeTab = ref('dictionary')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// ========== 数据字典 ==========
const dictDialogVisible = ref(false)
const dictDialogTitle = ref('新建字典')
const dictFormRef = ref(null)
const currentDict = ref(null)
const optionsDialogVisible = ref(false)
const selectAllDict = ref(false)
const selectedDicts = ref([])

const dictForm = ref({
  id: null,
  dictName: '',
  dictCode: '',
  category: '',
  status: 'enabled',
  options: []
})

const dictRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictCode: [
    { required: true, message: '请输入字典编码', trigger: 'blur' },
    { pattern: /^[a-z_][a-z0-9_]*$/, message: '仅允许小写字母、数字、下划线', trigger: 'blur' }
  ],
  category: [{ required: true, message: '请选择字典分类', trigger: 'change' }]
}

const dictionaryList = ref([
  {
    id: 1,
    dictCode: 'leave_type',
    dictName: '请假类型',
    category: 'hr',
    status: 'enabled',
    isSystem: true,
    options: [
      { label: '事假', value: 'personal' },
      { label: '病假', value: 'sick' },
      { label: '年假', value: 'annual' },
      { label: '调休', value: 'compensatory' }
    ],
    updateTime: '2026-04-01 10:00:00'
  },
  {
    id: 2,
    dictCode: 'expense_category',
    dictName: '报销科目',
    category: 'finance',
    status: 'enabled',
    isSystem: true,
    options: [
      { label: '差旅费', value: 'travel' },
      { label: '办公费', value: 'office' },
      { label: '招待费', value: 'entertainment' }
    ],
    updateTime: '2026-04-01 10:30:00'
  },
  {
    id: 3,
    dictCode: 'item_category',
    dictName: '物品类别',
    category: 'admin',
    status: 'enabled',
    isSystem: false,
    options: [
      { label: '电脑', value: 'computer' },
      { label: '办公家具', value: 'furniture' },
      { label: '耗材', value: 'consumables' }
    ],
    updateTime: '2026-04-02 09:00:00'
  },
  {
    id: 4,
    dictCode: 'urgency_level',
    dictName: '紧急程度',
    category: 'admin',
    status: 'enabled',
    isSystem: true,
    options: [
      { label: '普通', value: 'normal' },
      { label: '紧急', value: 'urgent' },
      { label: '特急', value: 'critical' }
    ],
    updateTime: '2026-04-01 11:00:00'
  }
])

// ========== 数据源 ==========
const datasourceDialogVisible = ref(false)
const datasourceDialogTitle = ref('新建数据源')
const datasourceFormRef = ref(null)
const selectAllDatasource = ref(false)
const selectedDatasources = ref([])

const datasourceForm = ref({
  id: null,
  name: '',
  type: 'mysql',
  connectionUrl: '',
  username: '',
  password: ''
})

const datasourceRules = {
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  connectionUrl: [{ required: true, message: '请输入连接地址', trigger: 'blur' }]
}

const datasourceList = ref([
  {
    id: 1,
    name: '组织人员数据源',
    type: 'system',
    connectionUrl: '内置数据源',
    connectionStatus: 'success',
    lastSyncTime: '2026-04-07 08:00:00',
    isSystem: true
  },
  {
    id: 2,
    name: '部门架构数据源',
    type: 'system',
    connectionUrl: '内置数据源',
    connectionStatus: 'success',
    lastSyncTime: '2026-04-07 08:00:00',
    isSystem: true
  },
  {
    id: 3,
    name: '公司HR数据库',
    type: 'mysql',
    connectionUrl: 'jdbc:mysql://192.168.1.100:3306/hr_system',
    connectionStatus: 'success',
    lastSyncTime: '2026-04-06 12:00:00',
    isSystem: false
  },
  {
    id: 4,
    name: '财务系统数据源',
    type: 'oracle',
    connectionUrl: 'jdbc:oracle:thin:@192.168.1.200:1521:finance',
    connectionStatus: 'failed',
    lastSyncTime: '2026-04-05 10:00:00',
    isSystem: false
  }
])

// ========== 接口管理 ==========
const apiDialogVisible = ref(false)
const apiDialogTitle = ref('新建接口')
const apiFormRef = ref(null)
const debugDialogVisible = ref(false)
const debugParams = ref('')
const debugResponse = ref('')
const selectAllApi = ref(false)
const selectedApis = ref([])

const apiForm = ref({
  id: null,
  name: '',
  method: 'GET',
  url: '',
  headers: '',
  status: 'enabled'
})

const apiRules = {
  name: [{ required: true, message: '请输入接口名称', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方式', trigger: 'change' }],
  url: [{ required: true, message: '请输入接口地址', trigger: 'blur' }]
}

const apiList = ref([
  {
    id: 1,
    name: '客户信息查询接口',
    method: 'GET',
    url: 'https://api.example.com/customer/info',
    callCount: 1256,
    status: 'enabled'
  },
  {
    id: 2,
    name: '部门人员列表接口',
    method: 'POST',
    url: 'https://api.example.com/department/users',
    callCount: 892,
    status: 'enabled'
  },
  {
    id: 3,
    name: '库存查询接口',
    method: 'GET',
    url: 'https://api.example.com/inventory/query',
    callCount: 445,
    status: 'disabled'
  }
])

// ========== 计算属性 ==========
const filteredDictionaryList = computed(() => {
  let result = [...dictionaryList.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(d =>
        d.dictName.toLowerCase().includes(kw) ||
        d.dictCode.toLowerCase().includes(kw)
    )
  }
  return result
})

const filteredDatasourceList = computed(() => {
  let result = [...datasourceList.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(d => d.name.toLowerCase().includes(kw))
  }
  return result
})

const filteredApiList = computed(() => {
  let result = [...apiList.value]
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(a => a.name.toLowerCase().includes(kw))
  }
  return result
})

// ========== 通用方法 ==========
const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('刷新成功')
  }, 300)
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleTabChange = () => {
  currentPage.value = 1
  searchKeyword.value = ''
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

const getCurrentTotal = () => {
  if (activeTab.value === 'dictionary') return filteredDictionaryList.value.length
  if (activeTab.value === 'datasource') return filteredDatasourceList.value.length
  return filteredApiList.value.length
}

const getAddButtonText = () => {
  const texts = {
    dictionary: '新建字典',
    datasource: '新建数据源',
    api: '新建接口'
  }
  return texts[activeTab.value] || '新建'
}

const maskUrl = (url) => {
  if (!url) return '-'
  if (url.includes('内置')) return url
  const parts = url.split('//')
  if (parts.length > 1) {
    return parts[0] + '//' + '****' + parts[1].substring(parts[1].indexOf(':'))
  }
  return '****'
}

const handleAdd = () => {
  if (activeTab.value === 'dictionary') {
    dictDialogTitle.value = '新建字典'
    dictForm.value = {
      id: null,
      dictName: '',
      dictCode: '',
      category: '',
      status: 'enabled',
      options: []
    }
    dictDialogVisible.value = true
  } else if (activeTab.value === 'datasource') {
    datasourceDialogTitle.value = '新建数据源'
    datasourceForm.value = {
      id: null,
      name: '',
      type: 'mysql',
      connectionUrl: '',
      username: '',
      password: ''
    }
    datasourceDialogVisible.value = true
  } else {
    apiDialogTitle.value = '新建接口'
    apiForm.value = {
      id: null,
      name: '',
      method: 'GET',
      url: '',
      headers: '',
      status: 'enabled'
    }
    apiDialogVisible.value = true
  }
}

// ========== 数据字典方法 ==========
const handleEditDict = (row) => {
  dictDialogTitle.value = '编辑字典'
  dictForm.value = { ...row }
  dictDialogVisible.value = true
}

const handleManageOptions = (row) => {
  currentDict.value = { ...row, options: [...(row.options || [])] }
  optionsDialogVisible.value = true
}

const handleImportDict = (row) => {
  ElMessage.success('导入功能开发中...')
}

const handleExportDict = (row) => {
  ElMessage.success('导出功能开发中...')
}

const handleDeleteDict = (row) => {
  ElMessageBox.confirm(
      `确定删除字典「${row.dictName}」吗？删除后所有关联表单将失效！`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    dictionaryList.value = dictionaryList.value.filter(d => d.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleDictStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${action}字典「${row.dictName}」`)
}

const handleSubmitDict = () => {
  dictFormRef.value?.validate((valid) => {
    if (!valid) return
    saving.value = true
    setTimeout(() => {
      if (dictForm.value.id) {
        const index = dictionaryList.value.findIndex(d => d.id === dictForm.value.id)
        if (index !== -1) {
          dictionaryList.value[index] = {
            ...dictForm.value,
            updateTime: new Date().toLocaleString('zh-CN')
          }
        }
        ElMessage.success('字典修改成功')
      } else {
        dictionaryList.value.unshift({
          ...dictForm.value,
          id: Date.now(),
          isSystem: false,
          options: [],
          updateTime: new Date().toLocaleString('zh-CN')
        })
        ElMessage.success('字典新增成功')
      }
      saving.value = false
      dictDialogVisible.value = false
    }, 500)
  })
}

const addOption = () => {
  if (!currentDict.value.options) {
    currentDict.value.options = []
  }
  currentDict.value.options.push({ label: '', value: '' })
}

const removeOption = (index) => {
  currentDict.value.options.splice(index, 1)
}

const handleSaveOptions = () => {
  saving.value = true
  setTimeout(() => {
    const index = dictionaryList.value.findIndex(d => d.id === currentDict.value.id)
    if (index !== -1) {
      dictionaryList.value[index].options = [...currentDict.value.options]
      dictionaryList.value[index].updateTime = new Date().toLocaleString('zh-CN')
    }
    saving.value = false
    optionsDialogVisible.value = false
    ElMessage.success('选项保存成功')
  }, 500)
}

const handleSelectAllDict = (val) => {
  filteredDictionaryList.value.forEach(d => d.selected = val)
}

const handleDictSelectionChange = (selection) => {
  selectedDicts.value = selection
}

const handleBatchEnableDict = () => {
  selectedDicts.value.forEach(d => d.status = 'enabled')
  ElMessage.success(`已批量启用 ${selectedDicts.value.length} 个字典`)
  selectedDicts.value = []
}

const handleBatchDisableDict = () => {
  selectedDicts.value.forEach(d => d.status = 'disabled')
  ElMessage.success(`已批量禁用 ${selectedDicts.value.length} 个字典`)
  selectedDicts.value = []
}

const handleBatchExportDict = () => {
  ElMessage.success('批量导出功能开发中...')
}

// ========== 数据源方法 ==========
const handleEditDatasource = (row) => {
  datasourceDialogTitle.value = '编辑数据源'
  datasourceForm.value = { ...row }
  datasourceDialogVisible.value = true
}

const handleTestConnection = (row) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    if (row.connectionStatus === 'success') {
      ElMessage.success(`数据源「${row.name}」连接正常`)
    } else {
      ElMessage.error(`数据源「${row.name}」连接失败，请检查配置`)
    }
  }, 1000)
}

const handleTestConnectionForm = () => {
  ElMessage.success('连接测试成功')
}

const handleSyncDatasource = (row) => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    row.lastSyncTime = new Date().toLocaleString('zh-CN')
    row.connectionStatus = 'success'
    ElMessage.success(`数据源「${row.name}」同步成功`)
  }, 1500)
}

const handleDeleteDatasource = (row) => {
  ElMessageBox.confirm(
      `确定删除数据源「${row.name}」吗？`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    datasourceList.value = datasourceList.value.filter(d => d.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSubmitDatasource = () => {
  datasourceFormRef.value?.validate((valid) => {
    if (!valid) return
    saving.value = true
    setTimeout(() => {
      if (datasourceForm.value.id) {
        const index = datasourceList.value.findIndex(d => d.id === datasourceForm.value.id)
        if (index !== -1) {
          datasourceList.value[index] = { ...datasourceForm.value }
        }
        ElMessage.success('数据源修改成功')
      } else {
        datasourceList.value.unshift({
          ...datasourceForm.value,
          id: Date.now(),
          isSystem: false,
          connectionStatus: 'success',
          lastSyncTime: '-'
        })
        ElMessage.success('数据源新增成功')
      }
      saving.value = false
      datasourceDialogVisible.value = false
    }, 500)
  })
}

const handleSelectAllDatasource = (val) => {
  filteredDatasourceList.value.forEach(d => d.selected = val)
}

const handleDatasourceSelectionChange = (selection) => {
  selectedDatasources.value = selection
}

const handleBatchSyncDatasource = () => {
  selectedDatasources.value.forEach(d => {
    d.lastSyncTime = new Date().toLocaleString('zh-CN')
    d.connectionStatus = 'success'
  })
  ElMessage.success(`已批量同步 ${selectedDatasources.value.length} 个数据源`)
  selectedDatasources.value = []
}

const handleBatchExportDatasource = () => {
  ElMessage.success('批量导出功能开发中...')
}

// ========== 接口管理方法 ==========
const handleEditApi = (row) => {
  apiDialogTitle.value = '编辑接口'
  apiForm.value = { ...row }
  apiDialogVisible.value = true
}

const handleDebugApi = (row) => {
  currentApi = row
  debugParams.value = ''
  debugResponse.value = ''
  debugDialogVisible.value = true
}

let currentApi = null

const handleDebugRequest = () => {
  debugLoading.value = true
  setTimeout(() => {
    debugLoading.value = false
    debugResponse.value = JSON.stringify({
      code: 200,
      message: 'success',
      data: {
        customerId: 'C12345',
        customerName: '示例客户',
        phone: '138****8888',
        address: '北京市朝阳区xxx路xxx号'
      }
    }, null, 2)
    currentApi.callCount++
    ElMessage.success('请求成功')
  }, 1000)
}

const handleViewApiLogs = (row) => {
  ElMessage.success('日志查看功能开发中...')
}

const handleDeleteApi = (row) => {
  ElMessageBox.confirm(
      `确定删除接口「${row.name}」吗？`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    apiList.value = apiList.value.filter(a => a.id !== row.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleApiStatusChange = (row) => {
  const action = row.status === 'enabled' ? '启用' : '禁用'
  ElMessage.success(`已${action}接口「${row.name}」`)
}

const handleSubmitApi = () => {
  apiFormRef.value?.validate((valid) => {
    if (!valid) return
    saving.value = true
    setTimeout(() => {
      if (apiForm.value.id) {
        const index = apiList.value.findIndex(a => a.id === apiForm.value.id)
        if (index !== -1) {
          apiList.value[index] = { ...apiForm.value }
        }
        ElMessage.success('接口修改成功')
      } else {
        apiList.value.unshift({
          ...apiForm.value,
          id: Date.now(),
          callCount: 0
        })
        ElMessage.success('接口新增成功')
      }
      saving.value = false
      apiDialogVisible.value = false
    }, 500)
  })
}

const handleSelectAllApi = (val) => {
  filteredApiList.value.forEach(a => a.selected = val)
}

const handleApiSelectionChange = (selection) => {
  selectedApis.value = selection
}

const handleBatchEnableApi = () => {
  selectedApis.value.forEach(a => a.status = 'enabled')
  ElMessage.success(`已批量启用 ${selectedApis.value.length} 个接口`)
  selectedApis.value = []
}

const handleBatchDisableApi = () => {
  selectedApis.value.forEach(a => a.status = 'disabled')
  ElMessage.success(`已批量禁用 ${selectedApis.value.length} 个接口`)
  selectedApis.value = []
}

// ========== 工具方法 ==========
const getDictCategoryTag = (category) => {
  const tags = { admin: 'success', finance: 'warning', hr: 'primary', other: 'info' }
  return tags[category] || 'info'
}

const getDictCategoryText = (category) => {
  const texts = { admin: '行政', finance: '财务', hr: '人事', other: '其他' }
  return texts[category] || category
}

const getDatasourceTypeTag = (type) => {
  const tags = { system: 'success', mysql: 'primary', oracle: 'warning', api: 'info' }
  return tags[type] || 'info'
}

const getDatasourceTypeText = (type) => {
  const texts = { system: '系统内置', mysql: 'MySQL', oracle: 'Oracle', api: 'API接口' }
  return texts[type] || type
}

const getMethodTag = (method) => {
  const tags = { GET: 'success', POST: 'primary', PUT: 'warning', DELETE: 'danger' }
  return tags[method] || 'info'
}
</script>

<style scoped lang="scss">
.data-resources-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .function-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .resource-tabs {
    background: #fff;
    border-radius: 8px;
    padding: 0 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .tab-label {
      display: flex;
      align-items: center;
      gap: 6px;

      .tab-badge {
        margin-left: 4px;
      }
    }
  }

  .batch-toolbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #f0f9ff;
    border: 1px solid #d9ecff;
    border-radius: 4px;
    margin-bottom: 16px;

    .batch-info {
      font-size: 14px;
      color: #409eff;
      font-weight: 500;
    }
  }

  .code-text {
    font-family: 'Courier New', monospace;
    color: #409EFF;
    font-weight: 600;
    font-size: 13px;
  }

  .masked-text {
    color: #909399;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  .call-count {
    color: #606266;
    font-weight: 500;
  }

  .pagination-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 16px;
    padding: 16px 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .pagination-info {
      font-size: 14px;
      color: #606266;
    }
  }

  .form-tip {
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }

  .empty-text {
    color: #909399;
    margin: 8px 0 16px;
  }

  // 选项管理器样式
  .options-manager {
    .options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      .options-count {
        font-size: 14px;
        color: #909399;
      }
    }

    .options-list {
      max-height: 400px;
      overflow-y: auto;

      .option-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        margin-bottom: 8px;
        background: #f5f7fa;
        border-radius: 4px;

        .option-index {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #409EFF;
          color: #fff;
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
        }
      }
    }
  }

  // 接口调试样式
  .api-debug {
    .debug-section {
      margin-bottom: 20px;

      .debug-title {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin: 0 0 12px;
        padding-left: 8px;
        border-left: 3px solid #409EFF;
      }

      .response-box {
        background: #fafafa;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        padding: 12px;
        max-height: 300px;
        overflow-y: auto;

        .response-content {
          margin: 0;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #303133;
          white-space: pre-wrap;
        }
      }
    }
  }
}
</style>
