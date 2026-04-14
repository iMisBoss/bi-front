<template>
  <div class="group-table">
    <el-table
        :data="tableData"
        border
        @selection-change="handleSelectionChange"
        row-key="id"
        :header-cell-style="{ background: '#fafafa', color: '#333', fontWeight: '600' }"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column label="群组头像" width="100" align="center">
        <template #default="{ row }">
          <el-avatar :size="36" class="group-avatar">{{ row.name?.charAt(0) }}</el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="groupId" label="群ID" width="100" />
      <el-table-column prop="name" label="群组名称" min-width="150" />

      <!-- 核心字段1：上级群组 -->
      <el-table-column prop="parentName" label="上级群组" width="120">
        <template #default="{ row }">
          <el-tag v-if="row.parentName === '根群组'" type="info" size="small">根群组</el-tag>
          <span v-else>{{ row.parentName }}</span>
        </template>
      </el-table-column>

      <!-- 核心字段2：适用范围 -->
      <el-table-column prop="scopeName" label="适用范围" width="120">
        <template #default="{ row }">
          <el-tag :type="getScopeType(row.scope)" size="small">{{ row.scopeName }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="typeName" label="群组类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getTypeTagType(row.type)" size="small">{{ row.typeName }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="owner" label="群主" width="100" />

      <!-- 核心字段3：群组成员 -->
      <el-table-column label="群组成员" width="140" align="center">
        <template #default="{ row }">
          <el-link type="primary" @click="$emit('manage-members', row)">
            {{ row.memberCount }}人 【查看】
          </el-link>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">
            {{ row.status === 'enabled' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="160" />
      <el-table-column label="操作" fixed="right" width="280" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="$emit('edit', row)">编辑</el-button>
          <el-button link type="primary" size="small" @click="$emit('manage-members', row)">成员管理</el-button>
          <el-button link type="primary" size="small" @click="$emit('view', row)">详情</el-button>
          <el-button
              link
              :type="row.status === 'enabled' ? 'warning' : 'success'"
              size="small"
              :disabled="row.isSystem"
              @click="$emit('toggle-status', row)"
          >
            {{ row.status === 'enabled' ? '禁用' : '启用' }}
          </el-button>
          <el-button
              link
              type="danger"
              size="small"
              :disabled="row.isSystem"
              @click="$emit('dissolve', row)"
          >
            解散
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  tableData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['selection-change', 'edit', 'manage-members', 'view', 'toggle-status', 'dissolve'])

const handleSelectionChange = (selection) => {
  emit('selection-change', selection)
}

const getScopeType = (scope) => {
  const types = {
    'all': '',
    'department': 'primary',
    'position': 'warning',
    'custom': 'success'
  }
  return types[scope] || ''
}

const getTypeTagType = (type) => {
  const types = {
    'department': '',
    'project': 'success',
    'system': 'danger',
    'temporary': 'warning'
  }
  return types[type] || ''
}
</script>

<style lang="scss" scoped>
.group-table {
  flex: 1;
  overflow: auto;

  .group-avatar {
    background: #409eff;
    color: #fff;
    font-weight: 600;
  }
}
</style>
