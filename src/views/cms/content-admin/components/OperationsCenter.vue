<template>
  <div class="operations-center">
    <el-tabs v-model="activeTab">
      <!-- 回收站 -->
      <el-tab-pane label="回收站" name="recycle">
        <div class="toolbar">
          <el-button-group>
            <el-button @click="handleBatchRestore" :disabled="selectedRows.length === 0">批量恢复</el-button>
            <el-button type="danger" @click="handleBatchDelete" :disabled="selectedRows.length === 0">彻底删除</el-button>
          </el-button-group>
          <el-button @click="handleClearRecycle" type="danger">清空回收站</el-button>
        </div>

        <el-table
            :data="recycleData"
            border
            @selection-change="handleSelectionChange"
            style="flex: 1"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column prop="title" label="标题" min-width="250" />
          <el-table-column prop="type" label="类型" width="100" />
          <el-table-column prop="deleteTime" label="删除时间" width="160" />
          <el-table-column prop="deleteUser" label="删除人" width="100" />
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleRestore(row)">恢复</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">彻底删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 水印配置 -->
      <el-tab-pane label="水印配置" name="watermark">
        <el-form label-width="120px" style="max-width: 600px; margin: 20px auto">
          <el-form-item label="全局水印">
            <el-switch v-model="watermarkConfig.globalEnabled" />
          </el-form-item>
          <el-form-item label="水印内容">
            <el-input v-model="watermarkConfig.content" placeholder="用户名+部门+时间" />
          </el-form-item>
          <el-form-item label="水印透明度">
            <el-slider v-model="watermarkConfig.opacity" :min="0" :max="100" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveWatermark">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 审计日志 -->
      <el-tab-pane label="审计日志" name="audit">
        <div class="filter-bar">
          <el-input placeholder="搜索操作人/内容" prefix-icon="Search" clearable style="width: 240px" />
          <el-select placeholder="操作类型" style="width: 150px" clearable>
            <el-option label="新增" value="add" />
            <el-option label="编辑" value="edit" />
            <el-option label="删除" value="delete" />
            <el-option label="发布" value="publish" />
          </el-select>
          <el-date-picker type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width: 240px" />
          <el-button @click="handleExportAudit" icon="Download">导出日志</el-button>
        </div>

        <el-table :data="auditData" border style="flex: 1">
          <el-table-column prop="time" label="操作时间" width="160" />
          <el-table-column prop="user" label="操作人" width="100" />
          <el-table-column prop="module" label="模块" width="120" />
          <el-table-column prop="action" label="操作类型" width="100" />
          <el-table-column prop="content" label="操作内容" min-width="250" show-overflow-tooltip />
          <el-table-column prop="ip" label="IP地址" width="140" />
        </el-table>
      </el-tab-pane>

      <!-- 全局参数 -->
      <el-tab-pane label="全局参数" name="params">
        <el-form label-width="150px" style="max-width: 700px; margin: 20px auto">
          <el-form-item label="附件大小限制">
            <el-input-number v-model="globalParams.attachmentSize" :min="10" :max="200" />
            <span style="margin-left: 10px">MB</span>
          </el-form-item>
          <el-form-item label="内容保留时长">
            <el-select v-model="globalParams.retentionDays" style="width: 200px">
              <el-option label="永久" :value="0" />
              <el-option label="180天" :value="180" />
              <el-option label="365天" :value="365" />
            </el-select>
          </el-form-item>
          <el-form-item label="自动下架开关">
            <el-switch v-model="globalParams.autoOffline" />
          </el-form-item>
          <el-form-item label="消息推送开关">
            <el-switch v-model="globalParams.messagePush" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSaveParams">保存配置</el-button>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('recycle')
const selectedRows = ref([])

const recycleData = ref([
  { id: 1, title: '测试公告', type: '公告', deleteTime: '2026-04-10 15:00', deleteUser: '张三' },
  { id: 2, title: '旧版技术文档', type: '文档', deleteTime: '2026-04-08 10:00', deleteUser: '李四' }
])

const watermarkConfig = ref({
  globalEnabled: true,
  content: '{用户名} - {部门} - {时间}',
  opacity: 30
})

const auditData = ref([
  { time: '2026-04-15 10:30', user: '张三', module: '内容管理', action: '发布', content: '发布内容「关于召开2026年度第一次全员大会的通知」', ip: '192.168.1.100' },
  { time: '2026-04-15 09:15', user: '李四', module: '栏目管理', action: '编辑', content: '编辑栏目「部门通知」', ip: '192.168.1.101' }
])

const globalParams = ref({
  attachmentSize: 50,
  retentionDays: 0,
  autoOffline: true,
  messagePush: true
})

const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}

const handleRestore = (row) => {
  ElMessage.success('恢复成功')
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要彻底删除吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleBatchRestore = () => {
  ElMessage.success('批量恢复成功')
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  ElMessageBox.confirm('确定要彻底删除吗？此操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('批量删除成功')
    selectedRows.value = []
  }).catch(() => {})
}

const handleClearRecycle = () => {
  ElMessageBox.confirm('确定要清空回收站吗？所有数据将永久删除！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    ElMessage.success('清空成功')
  }).catch(() => {})
}

const handleSaveWatermark = () => {
  ElMessage.success('水印配置保存成功')
}

const handleExportAudit = () => {
  ElMessage.success('审计日志导出成功')
}

const handleSaveParams = () => {
  ElMessage.success('全局参数保存成功')
}
</script>

<style lang="scss" scoped>
.operations-center {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }
}
</style>
