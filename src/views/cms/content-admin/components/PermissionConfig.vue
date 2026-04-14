<template>
  <div class="permission-config">
    <div class="toolbar">
      <el-radio-group v-model="permissionTarget">
        <el-radio label="role">按角色授权</el-radio>
        <el-radio label="department">按部门授权</el-radio>
        <el-radio label="user">按人员授权</el-radio>
      </el-radio-group>
    </div>

    <el-table :data="permissionData" border style="flex: 1">
      <el-table-column prop="name" label="名称" width="200" />
      <el-table-column label="栏目权限">
        <el-table-column prop="columnView" label="查看" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.columnView" />
          </template>
        </el-table-column>
        <el-table-column prop="columnAdd" label="新增" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.columnAdd" />
          </template>
        </el-table-column>
        <el-table-column prop="columnEdit" label="编辑" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.columnEdit" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="内容权限">
        <el-table-column prop="contentView" label="查看" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.contentView" />
          </template>
        </el-table-column>
        <el-table-column prop="contentPublish" label="发布" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.contentPublish" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="文档权限">
        <el-table-column prop="docPreview" label="预览" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.docPreview" />
          </template>
        </el-table-column>
        <el-table-column prop="docDownload" label="下载" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.docDownload" />
          </template>
        </el-table-column>
      </el-table-column>
    </el-table>

    <div class="pagination-wrapper">
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const permissionTarget = ref('role')

const permissionData = ref([
  { id: 1, name: '系统管理员', columnView: true, columnAdd: true, columnEdit: true, contentView: true, contentPublish: true, docPreview: true, docDownload: true },
  { id: 2, name: '部门管理员', columnView: true, columnAdd: true, columnEdit: false, contentView: true, contentPublish: true, docPreview: true, docDownload: false },
  { id: 3, name: '普通员工', columnView: true, columnAdd: false, columnEdit: false, contentView: true, contentPublish: false, docPreview: true, docDownload: false }
])

const handleSave = () => {
  ElMessage.success('权限配置保存成功')
}
</script>

<style lang="scss" scoped>
.permission-config {
  display: flex;
  flex-direction: column;
  height: 100%;

  .toolbar {
    margin-bottom: 16px;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
