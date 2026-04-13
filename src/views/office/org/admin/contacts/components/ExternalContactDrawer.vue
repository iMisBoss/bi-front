<template>
  <el-drawer
      v-model="visible"
      :title="`${currentContact?.name || ''}（外部联系人）`"
      size="600px"
  >
    <template #header>
      <div class="drawer-header">
        <h3 class="drawer-title">{{ currentContact?.name }}（外部联系人）</h3>
        <div class="drawer-actions">
          <el-button size="small" @click="$emit('edit-contact', currentContact)">编辑</el-button>
          <el-button
              v-if="currentContact?.status === 'enabled'"
              size="small"
              type="warning"
              @click="$emit('disable-contact', currentContact)"
          >
            禁用
          </el-button>
          <el-button
              v-else
              size="small"
              type="success"
              @click="$emit('enable-contact', currentContact)"
          >
            启用
          </el-button>
          <el-button
              size="small"
              type="danger"
              :disabled="currentContact?.linkedProcesses > 0"
              @click="$emit('delete-contact', currentContact)"
          >
            删除
          </el-button>
        </div>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="基本信息" name="basic">
        <el-form :model="basicForm" label-width="100px" class="basic-form">
          <el-form-item label="姓名" required>
            <el-input v-model="basicForm.name" />
          </el-form-item>
          <el-form-item label="所属公司" required>
            <el-input v-model="basicForm.company" />
          </el-form-item>
          <el-form-item label="联系人分类" required>
            <el-select v-model="basicForm.category" placeholder="选择分类" style="width: 100%">
              <el-option label="客户" value="客户" />
              <el-option label="供应商" value="供应商" />
              <el-option label="合作伙伴" value="合作伙伴" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
          <el-form-item label="手机号" required>
            <el-input v-model="basicForm.phone" />
          </el-form-item>
          <el-form-item label="邮箱">
            <el-input v-model="basicForm.email" />
          </el-form-item>
          <el-form-item label="办公电话">
            <el-input v-model="basicForm.officePhone" />
          </el-form-item>
          <el-form-item label="地址">
            <el-input v-model="basicForm.address" />
          </el-form-item>
          <el-form-item label="状态">
            <el-radio-group v-model="basicForm.status">
              <el-radio label="enabled">启用</el-radio>
              <el-radio label="disabled">禁用</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input
                v-model="basicForm.remark"
                type="textarea"
                :rows="3"
                maxlength="200"
                show-word-limit
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="权限配置" name="permission">
        <el-form :model="permissionForm" label-width="100px" class="basic-form">
          <el-form-item label="可见范围">
            <el-select v-model="permissionForm.visibleScope" placeholder="选择可见范围" style="width: 100%">
              <el-option label="全公司可见" value="全公司可见" />
              <el-option label="仅指定部门可见" value="仅指定部门可见" />
              <el-option label="仅管理员可见" value="仅管理员可见" />
            </el-select>
          </el-form-item>
          <el-form-item label="关联内部人员">
            <el-select v-model="permissionForm.relatedUserId" placeholder="选择负责人" clearable style="width: 100%">
              <el-option label="张三" value="1" />
              <el-option label="李四" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="编辑权限">
            <el-select v-model="permissionForm.editPermission" placeholder="选择编辑权限" style="width: 100%">
              <el-option label="仅管理员可编辑" value="仅管理员可编辑" />
              <el-option label="负责人可编辑" value="负责人可编辑" />
              <el-option label="全公司可编辑" value="全公司可编辑" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="操作日志" name="logs">
        <el-table :data="logs" border>
          <el-table-column prop="operator" label="操作人" width="120" />
          <el-table-column prop="time" label="操作时间" width="180" />
          <el-table-column prop="type" label="操作类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getLogTypeTag(row.type)">{{ getLogTypeLabel(row.type) }}</el-tag>
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

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  currentContact: {
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
  permissionForm: {
    type: Object,
    required: true
  },
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:modelValue',
  'update:activeTab',
  'edit-contact',
  'disable-contact',
  'enable-contact',
  'delete-contact'
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
    disable: 'warning',
    enable: 'success',
    delete: 'danger'
  }
  return tags[type] || ''
}

const getLogTypeLabel = (type) => {
  const labels = {
    create: '新增',
    edit: '编辑',
    disable: '禁用',
    enable: '启用',
    delete: '删除'
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
</style>
