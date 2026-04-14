<template>
  <div class="categories-page">
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/admin/home' }">后台首页</el-breadcrumb-item>
        <el-breadcrumb-item>流程中心</el-breadcrumb-item>
        <el-breadcrumb-item>流程分类管理</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增分类
        </el-button>
        <el-button :disabled="selection.length === 0" @click="handleBatchEnable">
          <el-icon><Check /></el-icon>批量启用
        </el-button>
        <el-button :disabled="selection.length === 0" @click="handleBatchDisable">
          <el-icon><Close /></el-icon>批量禁用
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </div>

    <div class="search-area">
      <el-form :inline="true" :model="query">
        <el-form-item label="分类名称">
          <el-input v-model="query.name" placeholder="模糊搜索" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <div class="table-area">
      <el-table
          :data="filteredData"
          border
          v-loading="loading"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          :default-expand-all="true"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column label="分类名称" min-width="220">
          <template #default="{ row }">
            <span :class="{ 'level-1': !row.parentId, 'level-2': row.parentId }">
              <el-icon v-if="row.parentId" class="child-icon"><ArrowRight /></el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="分类编码" width="140" align="center">
          <template #default="{ row }">
            <span class="code-text">{{ row.code }}</span>
          </template>
        </el-table-column>
        <el-table-column label="排序号" width="100" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.sort" :min="0" :max="999" size="small" controls-position="right" @change="handleSortChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="关联流程数" width="120" align="center">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleViewProcesses(row)">{{ row.processCount || 0 }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180" align="center" prop="createTime" />
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-group">
              <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
              <el-button size="small" :type="row.enabled ? 'warning' : 'success'" link @click="handleToggle(row)">
                {{ row.enabled ? '禁用' : '启用' }}
              </el-button>
              <el-dropdown trigger="click" @command="(cmd) => handleMore(cmd, row)">
                <el-button size="small" link>
                  更多<el-icon><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="add-child" v-if="!row.parentId">添加子分类</el-dropdown-item>
                    <el-dropdown-item command="delete" divided type="danger">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="pagination-bar">
      <el-pagination layout="total, sizes, prev, pager, next" :total="total" :page-sizes="[10, 20, 50]" v-model:page-size="pageSize" v-model:current-page="currentPage" />
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级分类" prop="parentId">
          <el-select v-model="form.parentId" placeholder="无上级（一级分类）" clearable style="width: 100%">
            <el-option v-for="item in parentOptions" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="英文+数字，如 hr_leave" :disabled="!!form.id" />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="999" controls-position="right" style="width: 100%" />
          <span class="form-tip">数字越小越靠前，默认 99</span>
        </el-form-item>
        <el-form-item label="状态" prop="enabled">
          <el-radio-group v-model="form.enabled">
            <el-radio :value="true">启用</el-radio>
            <el-radio :value="false">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Check, Close, Refresh, ArrowRight, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref(null)
const selection = ref([])

const query = reactive({ name: '', status: '' })
const pageSize = ref(10)
const currentPage = ref(1)
const total = ref(0)

const tableData = ref([
  {
    id: 1, parentId: null, name: '人事管理', code: 'hr', sort: 10, enabled: true, processCount: 5, createTime: '2026-01-01 10:00',
    children: [
      { id: 11, parentId: 1, name: '请假', code: 'hr_leave', sort: 1, enabled: true, processCount: 2, createTime: '2026-01-01 10:30' },
      { id: 12, parentId: 1, name: '入职', code: 'hr_onboard', sort: 2, enabled: true, processCount: 1, createTime: '2026-01-01 10:30' },
      { id: 13, parentId: 1, name: '转正', code: 'hr_regular', sort: 3, enabled: false, processCount: 2, createTime: '2026-01-01 10:30' }
    ]
  },
  {
    id: 2, parentId: null, name: '财务管理', code: 'finance', sort: 20, enabled: true, processCount: 3, createTime: '2026-01-05 14:00',
    children: [
      { id: 21, parentId: 2, name: '报销', code: 'finance_reimburse', sort: 1, enabled: true, processCount: 3, createTime: '2026-01-05 14:30' }
    ]
  },
  {
    id: 3, parentId: null, name: '行政管理', code: 'admin', sort: 30, enabled: true, processCount: 2, createTime: '2026-01-10 09:00',
    children: []
  }
])

const parentOptions = computed(() => tableData.value.filter(item => !item.parentId))

const filteredData = computed(() => {
  let result = [...tableData.value]
  if (query.name) {
    const keyword = query.name.toLowerCase()
    const filterNodes = (nodes) => {
      return nodes.filter(node => {
        const match = node.name.toLowerCase().includes(keyword)
        if (node.children) {
          node.children = filterNodes(node.children)
        }
        return match || (node.children && node.children.length > 0)
      })
    }
    result = filterNodes(result)
  }
  if (query.status) {
    const enabled = query.status === 'enabled'
    const filterNodes = (nodes) => {
      return nodes.filter(node => {
        if (node.children) {
          node.children = filterNodes(node.children)
        }
        const match = node.enabled === enabled
        return match || (node.children && node.children.length > 0)
      })
    }
    result = filterNodes(result)
  }
  total.value = result.reduce((count, node) => count + 1 + (node.children ? node.children.length : 0), 0)
  return result
})

const form = reactive({ id: null, parentId: null, name: '', code: '', sort: 99, enabled: true })

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }, { max: 20, message: '长度不超过 20 个字符', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }, { pattern: /^[a-zA-Z0-9_]+$/, message: '仅支持英文、数字和下划线', trigger: 'blur' }]
}

const handleSearch = () => { ElMessage.success('查询完成') }
const handleReset = () => { query.name = ''; query.status = ''; currentPage.value = 1; ElMessage.success('已重置') }
const handleRefresh = () => { ElMessage.success('刷新成功') }
const handleSelectionChange = (val) => { selection.value = val }

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增分类'
  Object.assign(form, { id: null, parentId: null, name: '', code: '', sort: 99, enabled: true })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      setTimeout(() => {
        if (!isEdit.value) {
          const newItem = {
            id: Date.now(),
            ...form,
            createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').replace(',', ''),
            processCount: 0
          }
          if (form.parentId) {
            const parent = tableData.value.find(item => item.id === form.parentId)
            if (parent) {
              if (!parent.children) parent.children = []
              parent.children.push(newItem)
            }
          } else {
            tableData.value.push(newItem)
          }
          ElMessage.success('新增成功')
        } else {
          const updateNode = (nodes) => {
            for (let node of nodes) {
              if (node.id === form.id) {
                Object.assign(node, form)
                return true
              }
              if (node.children && updateNode(node.children)) return true
            }
            return false
          }
          updateNode(tableData.value)
          ElMessage.success('保存成功')
        }
        submitLoading.value = false
        dialogVisible.value = false
      }, 500)
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const handleToggle = (row) => {
  const action = row.enabled ? '禁用' : '启用'
  if (!row.enabled && row.processCount > 0) {
    ElMessage.warning('该分类下存在关联流程，启用前请确保流程状态正确')
  }
  ElMessageBox.confirm(`确定${action}分类「${row.name}」？`, `${action}确认`, { type: 'warning' }).then(() => {
    row.enabled = !row.enabled
    ElMessage.success(`${action}成功`)
  }).catch(() => {})
}

const handleDelete = (row) => {
  if (row.processCount > 0) {
    ElMessage.warning('该分类已关联流程模板，无法删除，请先解绑流程')
    return
  }
  ElMessageBox.confirm(`确定删除分类「${row.name}」？此操作不可恢复！`, '删除确认', { type: 'error' }).then(() => {
    if (row.parentId) {
      const parent = tableData.value.find(item => item.id === row.parentId)
      if (parent) {
        parent.children = parent.children.filter(item => item.id !== row.id)
      }
    } else {
      tableData.value = tableData.value.filter(item => item.id !== row.id)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleMore = (cmd, row) => {
  if (cmd === 'add-child') {
    isEdit.value = false
    dialogTitle.value = '添加子分类'
    Object.assign(form, { id: null, parentId: row.id, name: '', code: '', sort: 99, enabled: true })
    dialogVisible.value = true
  }
  if (cmd === 'delete') {
    handleDelete(row)
  }
}

const handleBatchEnable = () => {
  ElMessageBox.confirm(`确定批量启用 ${selection.value.length} 个分类？`, '批量启用', { type: 'warning' }).then(() => {
    selection.value.forEach(item => { item.enabled = true })
    ElMessage.success('批量启用成功')
  }).catch(() => {})
}

const handleBatchDisable = () => {
  ElMessageBox.confirm(`确定批量禁用 ${selection.value.length} 个分类？`, '批量禁用', { type: 'warning' }).then(() => {
    selection.value.forEach(item => { item.enabled = false })
    ElMessage.success('批量禁用成功')
  }).catch(() => {})
}

const handleSortChange = (row) => {
  ElMessage.success(`「${row.name}」排序号已更新为 ${row.sort}`)
}

const handleViewProcesses = (row) => {
  router.push({ path: '/process/design/flowable/version', query: { category: row.code } })
}
</script>

<style scoped lang="scss">
.categories-page {
  height: calc(100vh - 50px);
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  .page-header {
    background: #fff;
    border-bottom: 1px solid #dee0e3;
    padding: 12px 24px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    :deep(.el-breadcrumb__inner) { font-size: 14px; color: #646a73; }
    :deep(.el-breadcrumb__separator) { color: #c0c4cc; margin: 0 8px; }
  }

  .toolbar {
    background: #fff;
    border-bottom: 1px solid #dee0e3;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    gap: 10px;

    .toolbar-left { display: flex; align-items: center; gap: 10px; }

    :deep(.el-button) {
      height: 36px;
      border-radius: 4px;
      font-size: 14px;
      .el-icon { margin-right: 6px; }
    }
  }

  .search-area {
    background: #fff;
    border: 1px solid #dee0e3;
    border-radius: 6px;
    padding: 16px 20px;
    margin: 16px 24px 0;
  }

  .table-area {
    flex: 1;
    margin: 16px 24px 0;
    overflow: hidden;

    :deep(.el-table) { border-radius: 6px; overflow: hidden; }

    .level-2 {
      padding-left: 24px;
      .child-icon { margin-right: 4px; vertical-align: middle; color: #909399; }
    }

    .code-text {
      font-family: 'Courier New', monospace;
      color: #909399;
      font-size: 13px;
    }

    .action-group {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      flex-wrap: nowrap;

      :deep(.el-button--link) {
        padding: 0 6px;
        margin: 0;
        font-size: 13px;
      }
    }
  }

  .pagination-bar {
    display: flex;
    justify-content: flex-end;
    padding: 16px 24px;
    background: #fff;
    border-top: 1px solid #dee0e3;
    margin-top: 16px;
  }

  .form-tip {
    display: block;
    margin-top: 4px;
    font-size: 12px;
    color: #909399;
  }
}
</style>
