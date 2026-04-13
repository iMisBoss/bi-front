<template>
  <el-drawer
      v-model="visible"
      :title="`${currentGroup?.name || ''}（群组）`"
      size="700px"
  >
    <template #header>
      <div class="drawer-header">
        <h3 class="drawer-title">{{ currentGroup?.name }}（群组）</h3>
        <div class="drawer-actions">
          <el-button size="small" @click="$emit('edit-group', currentGroup)">编辑</el-button>
          <el-button size="small" type="primary" @click="$emit('add-members')">新增成员</el-button>
          <el-button
              v-if="currentGroup?.status === 'enabled'"
              size="small"
              type="warning"
              @click="$emit('disable-group', currentGroup)"
          >
            禁用
          </el-button>
          <el-button
              v-else
              size="small"
              type="success"
              @click="$emit('enable-group', currentGroup)"
          >
            启用
          </el-button>
          <el-button
              size="small"
              type="danger"
              :disabled="currentGroup?.linkedProcesses > 0"
              @click="$emit('disband-group', currentGroup)"
          >
            解散群
          </el-button>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <!-- Tab1: 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="basicForm" label-width="120px" class="basic-form">
          <el-form-item label="群组名称" required>
            <el-input v-model="basicForm.name" disabled />
          </el-form-item>
          <el-form-item label="群组ID" required>
            <el-input v-model="basicForm.groupId" disabled />
          </el-form-item>
          <el-form-item label="群组类型" required>
            <el-select v-model="basicForm.type" disabled style="width: 100%">
              <el-option label="部门群" value="部门群" />
              <el-option label="项目群" value="项目群" />
              <el-option label="系统群" value="系统群" />
              <el-option label="临时群" value="临时群" />
            </el-select>
          </el-form-item>
          <el-form-item label="群主" required>
            <el-input v-model="basicForm.ownerName" disabled />
          </el-form-item>
          <el-form-item label="成员数">
            <el-input :value="`${basicForm.memberCount || 0}人`" disabled />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="basicForm.status" disabled>
              <el-radio label="enabled">启用</el-radio>
              <el-radio label="disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
                v-model="basicForm.remark"
                type="textarea"
                :rows="3"
                disabled
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- Tab2: 成员管理 -->
      <el-tab-pane label="成员管理" name="members">
        <div class="member-toolbar">
          <el-button type="primary" size="small" @click="$emit('add-members')">
            <el-icon><Plus /></el-icon>
            新增成员
          </el-button>
        </div>
        <el-table :data="members" border>
          <el-table-column label="成员" min-width="180">
            <template #default="{ row }">
              <div class="member-cell">
                <el-avatar :size="32">{{ row.name.charAt(0) }}</el-avatar>
                <span class="member-name">{{ row.name }}</span>
                <el-tag v-if="row.isOwner" type="warning" size="small">群主</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="position" label="职务" width="120" />
          <el-table-column prop="joinTime" label="加入时间" width="180" />
          <el-table-column label="操作" width="160">
            <template #default="{ row }">
              <el-button
                  v-if="!row.isOwner"
                  link
                  type="primary"
                  size="small"
                  @click="$emit('transfer-owner', row)"
              >
                转让群主
              </el-button>
              <el-button
                  v-if="!row.isOwner"
                  link
                  type="danger"
                  size="small"
                  @click="$emit('remove-member', row)"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab3: 操作日志 -->
      <el-tab-pane label="操作日志" name="logs">
        <el-table :data="logs" border>
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="type" label="操作类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getLogTypeTag(row.type)" size="small">
                {{ getLogTypeLabel(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="content" label="操作内容" min-width="250" />
          <el-table-column prop="ip" label="操作IP" width="130" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentGroup: {
    type: Object,
    default: null
  },
  activeTab: {
    type: String,
    default: 'basic'
  },
  basicForm: {
    type: Object,
    required: true
  },
  members: {
    type: Array,
    default: () => []
  },
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:activeTab',
  'edit-group',
  'add-members',
  'disable-group',
  'enable-group',
  'disband-group',
  'remove-member',
  'transfer-owner'
])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeTab = computed({
  get: () => props.activeTab,
  set: (value) => emit('update:activeTab', value)
})

const getLogTypeTag = (type) => {
  const tags = {
    create: 'success',
    edit: 'primary',
    add_member: 'success',
    remove_member: 'warning',
    transfer_owner: 'warning',
    disable: 'warning',
    enable: 'success',
    disband: 'danger'
  }
  return tags[type] || ''
}

const getLogTypeLabel = (type) => {
  const labels = {
    create: '创建',
    edit: '编辑',
    add_member: '添加成员',
    remove_member: '移除成员',
    transfer_owner: '转让群主',
    disable: '禁用',
    enable: '启用',
    disband: '解散'
  }
  return labels[type] || type
}
</script>

<style lang="scss" scoped>
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .drawer-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }

  .drawer-actions {
    display: flex;
    gap: 8px;
  }
}

.basic-form {
  max-width: 500px;
}

.member-toolbar {
  margin-bottom: 12px;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .member-name {
    font-weight: 500;
  }
}
</style>
