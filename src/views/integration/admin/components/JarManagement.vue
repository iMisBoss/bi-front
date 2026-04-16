<template>
  <div class="jar-management">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input placeholder="搜索组件包名称" clearable style="width: 200px" />
        <el-button type="primary" icon="Search">查询</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" icon="Upload" @click="handleUpload">上传组件包</el-button>
      </div>
    </div>

    <!-- 组件包列表 -->
    <el-table :data="jarList" border style="margin-top: 16px" :header-cell-style="{background: '#f5f7fa', color: '#606266'}">
      <el-table-column prop="name" label="组件包名称" min-width="200" />
      <el-table-column prop="version" label="版本号" width="120" />
      <el-table-column prop="size" label="文件大小" width="120" />
      <el-table-column prop="uploadTime" label="上传时间" width="160" />
      <el-table-column prop="uploader" label="上传人" width="100" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '已启用' : '未启用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
          <el-button link type="primary" size="small" @click="handleEnable(row)" v-if="row.status !== 'enabled'">启用</el-button>
          <el-button link type="warning" size="small" @click="handleDisable(row)" v-if="row.status === 'enabled'">禁用</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 16px; justify-content: flex-end"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(12)

const jarList = ref([
  { id: 1, name: 'document-parser.jar', version: '1.2.0', size: '2.5 MB', uploadTime: '2026-04-10 14:30', uploader: '管理员', status: 'enabled' },
  { id: 2, name: 'ai-connector.jar', version: '2.0.1', size: '5.8 MB', uploadTime: '2026-04-08 10:15', uploader: '管理员', status: 'enabled' },
  { id: 3, name: 'report-generator.jar', version: '1.5.0', size: '3.2 MB', uploadTime: '2026-04-05 16:20', uploader: '管理员', status: 'enabled' },
  { id: 4, name: 'excel-exporter.jar', version: '1.0.3', size: '1.8 MB', uploadTime: '2026-03-28 09:45', uploader: '管理员', status: 'disabled' },
  { id: 5, name: 'pdf-converter.jar', version: '1.1.0', size: '4.2 MB', uploadTime: '2026-03-20 11:30', uploader: '管理员', status: 'disabled' }
])

const handleUpload = () => {
  ElMessage.info('上传组件包功能')
}

const handleView = (row) => {
  ElMessage.info(`查看组件包：${row.name}`)
}

const handleEnable = (row) => {
  ElMessageBox.confirm(`确定要启用组件包「${row.name}」吗？`, '启用组件包', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    row.status = 'enabled'
    ElMessage.success('启用成功')
  }).catch(() => {})
}

const handleDisable = (row) => {
  ElMessageBox.confirm(`确定要禁用组件包「${row.name}」吗？`, '禁用组件包', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = 'disabled'
    ElMessage.success('禁用成功')
  }).catch(() => {})
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除组件包「${row.name}」吗？此操作不可恢复！`, '删除组件包', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style lang="scss" scoped>
.jar-management {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left,
    .toolbar-right {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
}
</style>
