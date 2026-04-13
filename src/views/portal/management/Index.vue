<template>
  <div class="portal-management">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/admin/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>门户中心</el-breadcrumb-item>
      <el-breadcrumb-item>门户管理中心</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 顶部操作栏 -->
    <div class="top-actions">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增门户
      </el-button>
      <el-button @click="handleBatchDelete" :disabled="selectedRows.length === 0">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
      <el-button @click="handleBatchExport">
        <el-icon><Download /></el-icon>批量导出
      </el-button>
      <el-button @click="refreshData">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- 筛选区 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="门户名称">
          <el-input v-model="searchForm.name" placeholder="请输入" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="门户分类">
          <el-select v-model="searchForm.category" placeholder="请选择" clearable style="width: 140px">
            <el-option label="办公门户" value="office" />
            <el-option label="数据门户" value="data" />
            <el-option label="管理门户" value="admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="使用状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Tab栏 -->
    <el-card class="main-card" shadow="never">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <!-- Tab1: 模板管理 -->
        <el-tab-pane label="模板管理" name="template">
          <el-table
              :data="tableData"
              v-loading="loading"
              @selection-change="handleSelectionChange"
              stripe
              border
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="name" label="门户名称" min-width="180">
              <template #default="{ row }">
                <el-link type="primary" @click="handleEdit(row)">{{ row.name }}</el-link>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="门户分类" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getCategoryType(row.category)" size="small">{{ getCategoryLabel(row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="version" label="当前版本" width="100" align="center" />
            <el-table-column prop="creator" label="设计人" width="120" />
            <el-table-column prop="updater" label="更新人" width="120" />
            <el-table-column prop="updateTime" label="更新时间" width="160" />
            <el-table-column prop="status" label="使用状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="320" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEdit(row)" :disabled="row.status === 'published'">编辑设计</el-button>
                <el-button link type="primary" size="small" @click="handlePreview(row)">预览</el-button>
                <el-button link type="primary" size="small" @click="handleCopy(row)">复制</el-button>
                <el-button link type="success" size="small" @click="handlePublish(row)" v-if="row.status === 'draft'">发布</el-button>
                <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :total="pagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              class="pagination"
              @size-change="fetchData"
              @current-change="fetchData"
          />
        </el-tab-pane>

        <!-- Tab2: 发布管理 -->
        <el-tab-pane label="发布管理" name="publish">
          <el-form :inline="true" size="default" class="sub-filter">
            <el-form-item label="运行状态">
              <el-select v-model="publishFilter.status" placeholder="请选择" clearable style="width: 120px" @change="fetchPublishData">
                <el-option label="启用" value="enabled" />
                <el-option label="停用" value="disabled" />
              </el-select>
            </el-form-item>
            <el-form-item label="是否首页">
              <el-select v-model="publishFilter.isHome" placeholder="请选择" clearable style="width: 120px" @change="fetchPublishData">
                <el-option label="是" value="true" />
                <el-option label="否" value="false" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-table :data="publishData" v-loading="publishLoading" stripe border>
            <el-table-column prop="name" label="门户名称" min-width="180" />
            <el-table-column prop="category" label="门户分类" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getCategoryType(row.category)" size="small">{{ getCategoryLabel(row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="version" label="当前版本" width="100" align="center" />
            <el-table-column prop="publisher" label="发布人" width="120" />
            <el-table-column prop="publishTime" label="发布时间" width="160" />
            <el-table-column prop="runStatus" label="运行状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.runStatus === 'enabled' ? 'success' : 'warning'" size="small">
                  {{ row.runStatus === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="isHome" label="是否首页" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isHome ? 'success' : 'info'" size="small">{{ row.isHome ? '是' : '否' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="visibleScope" label="前台可见范围" min-width="180" />
            <el-table-column label="操作" width="280" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handlePreview(row)">预览</el-button>
                <el-button
                    link
                    :type="row.runStatus === 'enabled' ? 'warning' : 'success'"
                    size="small"
                    @click="handleToggleRunStatus(row)"
                >
                  {{ row.runStatus === 'enabled' ? '停用' : '启用' }}
                </el-button>
                <el-button link type="primary" size="small" @click="handleSetHome(row)" :disabled="row.isHome">设为首页</el-button>
                <el-button link type="warning" size="small" @click="handleRollback(row)">版本回滚</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="publishPagination.currentPage"
              v-model:page-size="publishPagination.pageSize"
              :total="publishPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              class="pagination"
              @size-change="fetchPublishData"
              @current-change="fetchPublishData"
          />
        </el-tab-pane>

        <!-- Tab3: 权限分配 -->
        <el-tab-pane label="权限分配" name="permission">
          <el-form :inline="true" size="default" class="sub-filter">
            <el-form-item label="授权范围">
              <el-select v-model="permissionFilter.scopeType" placeholder="请选择" clearable style="width: 140px" @change="fetchPermissionData">
                <el-option label="全员" value="all" />
                <el-option label="指定部门" value="department" />
                <el-option label="指定角色" value="role" />
                <el-option label="指定人员" value="user" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-table :data="permissionData" v-loading="permissionLoading" stripe border>
            <el-table-column prop="name" label="门户名称" min-width="180" />
            <el-table-column prop="category" label="门户分类" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getCategoryType(row.category)" size="small">{{ getCategoryLabel(row.category) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="runStatus" label="运行状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.runStatus === 'enabled' ? 'success' : 'warning'" size="small">
                  {{ row.runStatus === 'enabled' ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="visibleScope" label="可见范围" min-width="200" />
            <el-table-column prop="scopeType" label="授权类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ getScopeTypeLabel(row.scopeType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="authorizer" label="授权人" width="120" />
            <el-table-column prop="authorizeTime" label="授权时间" width="160" />
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleSetPermission(row)">设置权限</el-button>
                <el-button link type="danger" size="small" @click="handleClearPermission(row)">清空权限</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="permissionPagination.currentPage"
              v-model:page-size="permissionPagination.pageSize"
              :total="permissionPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              class="pagination"
              @size-change="fetchPermissionData"
              @current-change="fetchPermissionData"
          />
        </el-tab-pane>

        <!-- Tab4: 数据绑定 -->
        <el-tab-pane label="数据绑定" name="databind">
          <el-form :inline="true" size="default" class="sub-filter">
            <el-form-item label="所属门户">
              <el-select v-model="databindFilter.portalId" placeholder="请选择门户" clearable style="width: 200px" @change="fetchDatabindData">
                <el-option v-for="item in portalOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-form>

          <el-table :data="databindData" v-loading="databindLoading" stripe border>
            <el-table-column prop="portalName" label="所属门户" min-width="180" />
            <el-table-column prop="componentName" label="组件名称" min-width="150" />
            <el-table-column prop="componentType" label="组件类型" width="120" align="center" />
            <el-table-column prop="dataSourceType" label="数据源类型" width="140" align="center">
              <template #default="{ row }">
                <el-tag size="small">{{ getDataSourceTypeLabel(row.dataSourceType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="bindContent" label="绑定内容" min-width="200" />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'normal' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'normal' ? '正常' : '异常' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEditBind(row)">编辑绑定</el-button>
                <el-button link type="success" size="small" @click="handleTestConnection(row)">测试连通</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="databindPagination.currentPage"
              v-model:page-size="databindPagination.pageSize"
              :total="databindPagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              class="pagination"
              @size-change="fetchDatabindData"
              @current-change="fetchDatabindData"
          />
        </el-tab-pane>

        <!-- Tab5: 回收站 -->
        <el-tab-pane label="回收站" name="recycle">
          <el-table :data="recycleData" v-loading="recycleLoading" stripe border>
            <el-table-column prop="name" label="门户名称" min-width="180" />
            <el-table-column prop="deleter" label="删除人" width="120" />
            <el-table-column prop="deleteTime" label="删除时间" width="160" />
            <el-table-column prop="originalCategory" label="原分类" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getCategoryType(row.originalCategory)" size="small">{{ getCategoryLabel(row.originalCategory) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="success" size="small" @click="handleRestore(row)">恢复</el-button>
                <el-button link type="danger" size="small" @click="handlePermanentDelete(row)">彻底删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
              v-model:current-page="recyclePagination.currentPage"
              v-model:page-size="recyclePagination.pageSize"
              :total="recyclePagination.total"
              :page-sizes="[10, 20, 50, 100]"
              layout="total, sizes, prev, pager, next, jumper"
              class="pagination"
              @size-change="fetchRecycleData"
              @current-change="fetchRecycleData"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 权限设置弹窗 -->
    <el-dialog v-model="permissionDialogVisible" title="设置权限" width="600px">
      <el-form :model="permissionForm" label-width="100px">
        <el-form-item label="授权范围">
          <el-radio-group v-model="permissionForm.scopeType">
            <el-radio value="all">全员可见</el-radio>
            <el-radio value="department">指定部门</el-radio>
            <el-radio value="role">指定角色</el-radio>
            <el-radio value="user">指定人员</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="permissionForm.scopeType === 'department'" label="选择部门">
          <el-tree-select
              v-model="permissionForm.departmentIds"
              :data="departmentTree"
              multiple
              show-checkbox
              node-key="id"
              placeholder="请选择部门"
              style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="permissionForm.scopeType === 'role'" label="选择角色">
          <el-select v-model="permissionForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option label="系统管理员" value="1" />
            <el-option label="人事专员" value="2" />
            <el-option label="财务专员" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="permissionForm.scopeType === 'user'" label="选择人员">
          <el-select v-model="permissionForm.userIds" multiple placeholder="请选择人员" style="width: 100%">
            <el-option label="张三" value="1" />
            <el-option label="李四" value="2" />
            <el-option label="王五" value="3" />
          </el-select>
        </el-form-item>
        <el-divider />
        <el-form-item label="高级设置">
          <el-checkbox v-model="permissionForm.allowCustomLayout">允许用户自定义布局</el-checkbox>
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="permissionForm.allowMobile">允许移动端展示</el-checkbox>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermission">确定</el-button>
      </template>
    </el-dialog>

    <!-- 数据绑定编辑弹窗 -->
    <el-dialog v-model="databindDialogVisible" title="编辑数据绑定" width="600px">
      <el-form :model="databindForm" label-width="100px">
        <el-form-item label="数据范围">
          <el-radio-group v-model="databindForm.dataScope">
            <el-radio value="all">全部待办</el-radio>
            <el-radio value="category">指定流程分类</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="databindForm.dataScope === 'category'" label="选择分类">
          <el-select v-model="databindForm.categoryId" placeholder="请选择" style="width: 100%">
            <el-option label="请假流程" value="1" />
            <el-option label="报销流程" value="2" />
            <el-option label="出差流程" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示条数">
          <el-select v-model="databindForm.displayCount" style="width: 100%">
            <el-option label="5条" :value="5" />
            <el-option label="10条" :value="10" />
            <el-option label="20条" :value="20" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序方式">
          <el-select v-model="databindForm.sortRule" style="width: 100%">
            <el-option label="最新优先" value="time_desc" />
            <el-option label="紧急优先" value="urgency" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="databindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveDatabind">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Download, Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 状态管理
const activeTab = ref('template')
const loading = ref(false)
const publishLoading = ref(false)
const permissionLoading = ref(false)
const databindLoading = ref(false)
const recycleLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  name: '',
  category: '',
  status: '',
  dateRange: []
})

// 筛选条件
const publishFilter = reactive({
  status: '',
  isHome: ''
})

const permissionFilter = reactive({
  scopeType: ''
})

const databindFilter = reactive({
  portalId: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const publishPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const permissionPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const databindPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const recyclePagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 表格数据
const tableData = ref([])
const publishData = ref([])
const permissionData = ref([])
const databindData = ref([])
const recycleData = ref([])
const selectedRows = ref([])
const portalOptions = ref([])

// 弹窗
const permissionDialogVisible = ref(false)
const databindDialogVisible = ref(false)

const permissionForm = reactive({
  portalId: null,
  scopeType: 'all',
  departmentIds: [],
  roleIds: [],
  userIds: [],
  allowCustomLayout: false,
  allowMobile: true
})

const databindForm = reactive({
  id: null,
  dataScope: 'all',
  categoryId: '',
  displayCount: 10,
  sortRule: 'time_desc'
})

// 部门树
const departmentTree = ref([
  { id: 1, label: '总公司', children: [
      { id: 2, label: '人事部' },
      { id: 3, label: '技术部' },
      { id: 4, label: '财务部' }
    ]}
])

// 获取数据
const fetchData = () => {
  loading.value = true
  setTimeout(() => {
    tableData.value = [
      { id: 1, name: '员工门户', category: 'office', version: 'V1.2', creator: '张三/技术部', updater: '李四/技术部', updateTime: '2024-01-15 10:30', status: 'draft' },
      { id: 2, name: '管理员门户', category: 'admin', version: 'V1.0', creator: '王五/人事部', updater: '王五/人事部', updateTime: '2024-01-14 15:20', status: 'published' },
      { id: 3, name: '部门门户', category: 'office', version: 'V2.1', creator: '赵六/财务部', updater: '赵六/财务部', updateTime: '2024-01-13 09:15', status: 'disabled' }
    ]
    pagination.total = 3
    loading.value = false
  }, 500)
}

const fetchPublishData = () => {
  publishLoading.value = true
  setTimeout(() => {
    publishData.value = [
      { id: 2, name: '管理员门户', category: 'admin', version: 'V1.0', publisher: '王五', publishTime: '2024-01-14 15:20', runStatus: 'enabled', isHome: true, visibleScope: '全员可见' },
      { id: 4, name: '数据看板', category: 'data', version: 'V1.1', publisher: '张三', publishTime: '2024-01-12 11:00', runStatus: 'enabled', isHome: false, visibleScope: '技术部+财务部' }
    ]
    publishPagination.total = 2
    publishLoading.value = false
  }, 500)
}

const fetchPermissionData = () => {
  permissionLoading.value = true
  setTimeout(() => {
    permissionData.value = [
      { id: 2, name: '管理员门户', category: 'admin', runStatus: 'enabled', visibleScope: '全员可见', scopeType: 'all', authorizer: '系统管理员', authorizeTime: '2024-01-14 15:20' },
      { id: 4, name: '数据看板', category: 'data', runStatus: 'enabled', visibleScope: '技术部+财务部', scopeType: 'department', authorizer: '张三', authorizeTime: '2024-01-12 11:00' }
    ]
    permissionPagination.total = 2
    permissionLoading.value = false
  }, 500)
}

const fetchDatabindData = () => {
  databindLoading.value = true
  setTimeout(() => {
    databindData.value = [
      { id: 1, portalName: '员工门户', componentName: '我的待办', componentType: '待办审批', dataSourceType: 'flow', bindContent: '全部待办', status: 'normal' },
      { id: 2, portalName: '员工门户', componentName: '新闻列表', componentType: '信息公告', dataSourceType: 'notice', bindContent: '公司公告栏目', status: 'normal' },
      { id: 3, portalName: '数据看板', componentName: '流程统计', componentType: '业务图表', dataSourceType: 'report', bindContent: '流程效率报表', status: 'error' }
    ]
    databindPagination.total = 3
    databindLoading.value = false
  }, 500)
}

const fetchRecycleData = () => {
  recycleLoading.value = true
  setTimeout(() => {
    recycleData.value = [
      { id: 5, name: '测试门户', deleter: '张三', deleteTime: '2024-01-10 14:30', originalCategory: 'office' }
    ]
    recyclePagination.total = 1
    recycleLoading.value = false
  }, 500)
}

// 工具函数
const getCategoryType = (category) => {
  const map = { office: '', data: 'success', admin: 'warning' }
  return map[category] || ''
}

const getCategoryLabel = (category) => {
  const map = { office: '办公门户', data: '数据门户', admin: '管理门户' }
  return map[category] || category
}

const getStatusType = (status) => {
  const map = { draft: 'info', published: 'success', disabled: 'warning' }
  return map[status] || 'info'
}

const getStatusLabel = (status) => {
  const map = { draft: '草稿', published: '已发布', disabled: '已停用' }
  return map[status] || status
}

const getScopeTypeLabel = (type) => {
  const map = { all: '全员', department: '部门', role: '角色', user: '人员' }
  return map[type] || type
}

const getDataSourceTypeLabel = (type) => {
  const map = { flow: '流程中心', form: '表单中心', notice: '公告模块', report: '报表/BI', api: '自定义接口' }
  return map[type] || type
}

// 事件处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchData()
}

const handleReset = () => {
  Object.assign(searchForm, {
    name: '',
    category: '',
    status: '',
    dateRange: []
  })
  handleSearch()
}

const handleTabChange = (tab) => {
  if (tab === 'publish') fetchPublishData()
  if (tab === 'permission') fetchPermissionData()
  if (tab === 'databind') fetchDatabindData()
  if (tab === 'recycle') fetchRecycleData()
}

const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

const handleAdd = () => {
  router.push('/portal/designer')
}

const handleEdit = (row) => {
  if (row.status === 'published') {
    ElMessage.warning('已发布的门户不可编辑，请复制为新版本')
    return
  }
  router.push({ path: '/portal/designer', query: { id: row.id } })
}

const handlePreview = (row) => {
  ElMessage.info(`预览门户：${row.name}`)
}

const handleCopy = (row) => {
  ElMessageBox.confirm(`确定复制门户"${row.name}"？`, '复制确认', { type: 'info' }).then(() => {
    ElMessage.success('复制成功')
    fetchData()
  }).catch(() => {})
}

const handlePublish = (row) => {
  ElMessageBox.confirm('发布后门户将在前台生效，是否确认发布？', '发布确认', { type: 'warning' }).then(() => {
    ElMessage.success('发布成功')
    fetchData()
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm('删除后将移入回收站，是否继续？', '删除确认', { type: 'warning' }).then(() => {
    ElMessage.success('已移入回收站')
    fetchData()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 个门户？`, '批量删除', { type: 'warning' }).then(() => {
    ElMessage.success('批量删除成功')
    fetchData()
  }).catch(() => {})
}

const handleBatchExport = () => {
  ElMessage.success('批量导出功能开发中')
}

const refreshData = () => {
  if (activeTab.value === 'template') fetchData()
  if (activeTab.value === 'publish') fetchPublishData()
  if (activeTab.value === 'permission') fetchPermissionData()
  if (activeTab.value === 'databind') fetchDatabindData()
  if (activeTab.value === 'recycle') fetchRecycleData()
  ElMessage.success('刷新成功')
}

const handleToggleRunStatus = (row) => {
  const action = row.runStatus === 'enabled' ? '停用' : '启用'
  ElMessageBox.confirm(`确定${action}门户"${row.name}"？`, `${action}确认`, { type: 'warning' }).then(() => {
    ElMessage.success(`${action}成功`)
    fetchPublishData()
  }).catch(() => {})
}

const handleSetHome = (row) => {
  ElMessageBox.confirm('设置为首页后，其他门户将取消首页状态，是否继续？', '设为首页', { type: 'warning' }).then(() => {
    ElMessage.success('设为首页成功')
    fetchPublishData()
  }).catch(() => {})
}

const handleRollback = (row) => {
  ElMessageBox.confirm('确定回滚到上一版本？', '版本回滚', { type: 'warning' }).then(() => {
    ElMessage.success('版本回滚成功')
    fetchPublishData()
  }).catch(() => {})
}

const handleSetPermission = (row) => {
  permissionForm.portalId = row.id
  permissionForm.scopeType = row.scopeType || 'all'
  permissionDialogVisible.value = true
}

const handleClearPermission = (row) => {
  ElMessageBox.confirm('确定清空该门户的权限配置？', '清空确认', { type: 'warning' }).then(() => {
    ElMessage.success('权限已清空')
    fetchPermissionData()
  }).catch(() => {})
}

const handleSavePermission = () => {
  ElMessage.success('权限保存成功')
  permissionDialogVisible.value = false
  fetchPermissionData()
}

const handleEditBind = (row) => {
  databindForm.id = row.id
  databindDialogVisible.value = true
}

const handleTestConnection = (row) => {
  ElMessage.info('测试连通性功能开发中')
}

const handleSaveDatabind = () => {
  ElMessage.success('数据绑定保存成功')
  databindDialogVisible.value = false
  fetchDatabindData()
}

const handleRestore = (row) => {
  ElMessageBox.confirm('确定恢复该门户？', '恢复确认', { type: 'info' }).then(() => {
    ElMessage.success('恢复成功')
    fetchRecycleData()
    fetchData()
  }).catch(() => {})
}

const handlePermanentDelete = (row) => {
  ElMessageBox.confirm('彻底删除后不可恢复，是否继续？', '彻底删除', { type: 'error' }).then(() => {
    ElMessage.success('已彻底删除')
    fetchRecycleData()
  }).catch(() => {})
}

onMounted(() => {
  fetchData()
  portalOptions.value = [
    { id: 1, name: '员工门户' },
    { id: 2, name: '管理员门户' },
    { id: 3, name: '部门门户' }
  ]
})
</script>

<style scoped lang="scss">
.portal-management {
  padding: 16px;
  background: #f0f2f5;
  min-height: calc(100vh - 50px);

  .breadcrumb {
    margin-bottom: 16px;
  }

  .top-actions {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .filter-card {
    margin-bottom: 16px;

    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .main-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .sub-filter {
    margin-bottom: 16px;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
